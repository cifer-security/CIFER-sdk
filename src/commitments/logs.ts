/**
 * @module commitments/logs
 * @description Log retrieval for encrypted commitment data
 */

import type { Address, Bytes32, ChainId, Hex, CommitmentData, Log } from '../types/common.js';
import type { ReadClient } from '../types/adapters.js';
import {
  getCIFERDataStoredTopic,
  getCIFERDataUpdatedTopic,
  decodeCIFERDataEvent,
} from '../internal/abi/cifer-encrypted.js';
import { CommitmentsError, CommitmentNotFoundError } from '../internal/errors/index.js';

/**
 * Parameters for fetching commitment data from logs
 */
export interface FetchCommitmentParams {
  /** Chain ID */
  chainId: ChainId;
  /** Contract address implementing ICiferEncrypted */
  contractAddress: Address;
  /** The data ID to find */
  dataId: Bytes32;
  /** Block number where the data was stored (from metadata) */
  storedAtBlock: number;
  /** Read client for log queries */
  readClient: ReadClient;
}

/**
 * Fetch commitment data (cifer + encryptedMessage) from event logs
 *
 * The actual encrypted bytes are not stored on-chain - they are emitted
 * in CIFERDataStored or CIFERDataUpdated events. This function retrieves
 * those bytes from the logs.
 *
 * @param params - Fetch parameters
 * @returns Commitment data with cifer and encryptedMessage
 * @throws CommitmentNotFoundError if no matching log is found
 *
 * @example
 * ```typescript
 * // First get the metadata to know which block to query
 * const metadata = await getCIFERMetadata({ chainId, contractAddress, readClient }, dataId);
 *
 * // Then fetch the actual encrypted data from logs
 * const commitment = await fetchCommitmentFromLogs({
 *   chainId: 752025,
 *   contractAddress: '0x...',
 *   dataId,
 *   storedAtBlock: metadata.storedAtBlock,
 *   readClient,
 * });
 *
 * console.log('Cifer:', commitment.cifer);
 * console.log('Encrypted message:', commitment.encryptedMessage);
 * ```
 */
export async function fetchCommitmentFromLogs(
  params: FetchCommitmentParams
): Promise<CommitmentData> {
  const { chainId, contractAddress, dataId, storedAtBlock, readClient } = params;

  // Event topics for CIFERDataStored and CIFERDataUpdated
  const storedTopic = getCIFERDataStoredTopic();
  const updatedTopic = getCIFERDataUpdatedTopic();

  try {
    // Query logs at the specific block
    // We try both event types since either could be the most recent write

    // First try CIFERDataStored
    let logs = await readClient.getLogs(chainId, {
      address: contractAddress,
      topics: [storedTopic, dataId],
      fromBlock: storedAtBlock,
      toBlock: storedAtBlock,
    });

    // If not found, try CIFERDataUpdated
    if (logs.length === 0) {
      logs = await readClient.getLogs(chainId, {
        address: contractAddress,
        topics: [updatedTopic, dataId],
        fromBlock: storedAtBlock,
        toBlock: storedAtBlock,
      });
    }

    if (logs.length === 0) {
      throw new CommitmentNotFoundError(dataId);
    }

    // If multiple logs in the same block, pick the one with highest logIndex
    const log = logs.reduce((latest, current) =>
      current.logIndex > latest.logIndex ? current : latest
    );

    // Decode the event
    const decoded = decodeCIFERDataEvent(log.topics, log.data);

    return {
      cifer: decoded.cifer,
      encryptedMessage: decoded.encryptedMessage,
      ciferHash: decoded.ciferHash,
      encryptedMessageHash: decoded.encryptedMessageHash,
    };
  } catch (error) {
    if (error instanceof CommitmentNotFoundError) {
      throw error;
    }
    throw new CommitmentsError(
      `Failed to fetch commitment from logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch commitment with expanded block range search
 *
 * Sometimes the exact block might not have the event due to reorgs or
 * indexing delays. This function searches within a range around the
 * expected block.
 *
 * @param params - Fetch parameters with extended search options
 * @returns Commitment data
 */
export async function fetchCommitmentWithRetry(
  params: FetchCommitmentParams & {
    /** Number of blocks before storedAtBlock to search */
    blocksBefore?: number;
    /** Number of blocks after storedAtBlock to search */
    blocksAfter?: number;
  }
): Promise<CommitmentData> {
  const { blocksBefore = 0, blocksAfter = 5, ...baseParams } = params;
  const { chainId, contractAddress, dataId, storedAtBlock, readClient } = baseParams;

  const fromBlock = Math.max(0, storedAtBlock - blocksBefore);
  const toBlock = storedAtBlock + blocksAfter;

  const storedTopic = getCIFERDataStoredTopic();
  const updatedTopic = getCIFERDataUpdatedTopic();

  try {
    // Search for stored events in the range
    let logs = await readClient.getLogs(chainId, {
      address: contractAddress,
      topics: [storedTopic, dataId],
      fromBlock,
      toBlock,
    });

    // Also search for updated events
    const updatedLogs = await readClient.getLogs(chainId, {
      address: contractAddress,
      topics: [updatedTopic, dataId],
      fromBlock,
      toBlock,
    });

    logs = [...logs, ...updatedLogs];

    if (logs.length === 0) {
      throw new CommitmentNotFoundError(dataId);
    }

    // Find the log closest to storedAtBlock (or at storedAtBlock)
    // If multiple at the same block, pick highest logIndex
    const log = logs.reduce((best, current) => {
      if (current.blockNumber === storedAtBlock && best.blockNumber !== storedAtBlock) {
        return current;
      }
      if (best.blockNumber === storedAtBlock && current.blockNumber !== storedAtBlock) {
        return best;
      }
      if (current.blockNumber === best.blockNumber) {
        return current.logIndex > best.logIndex ? current : best;
      }
      // Pick the closest to storedAtBlock
      const currentDiff = Math.abs(current.blockNumber - storedAtBlock);
      const bestDiff = Math.abs(best.blockNumber - storedAtBlock);
      return currentDiff < bestDiff ? current : best;
    });

    const decoded = decodeCIFERDataEvent(log.topics, log.data);

    return {
      cifer: decoded.cifer,
      encryptedMessage: decoded.encryptedMessage,
      ciferHash: decoded.ciferHash,
      encryptedMessageHash: decoded.encryptedMessageHash,
    };
  } catch (error) {
    if (error instanceof CommitmentNotFoundError) {
      throw error;
    }
    throw new CommitmentsError(
      `Failed to fetch commitment from logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parse a CIFER data event from a raw log
 *
 * Use this when you have logs from your own source (e.g., WebSocket subscription)
 * and need to decode them.
 *
 * @param log - The raw log entry
 * @returns Parsed commitment data
 */
export function parseCommitmentLog(log: Log): CommitmentData {
  try {
    const decoded = decodeCIFERDataEvent(log.topics, log.data);
    return {
      cifer: decoded.cifer,
      encryptedMessage: decoded.encryptedMessage,
      ciferHash: decoded.ciferHash,
      encryptedMessageHash: decoded.encryptedMessageHash,
    };
  } catch (error) {
    throw new CommitmentsError(
      `Failed to parse commitment log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Check if a log is a CIFER data event (stored or updated)
 *
 * @param log - The log to check
 * @returns True if it's a CIFER data event
 */
export function isCIFERDataEvent(log: Log): boolean {
  const topic0 = log.topics[0]?.toLowerCase();
  return (
    topic0 === getCIFERDataStoredTopic().toLowerCase() ||
    topic0 === getCIFERDataUpdatedTopic().toLowerCase()
  );
}
