/**
 * @file tests/web2-session-status.test.ts
 * @description Tests for POST /web2/session/status
 */

import { describe, it, expect, vi } from 'vitest';
import { getSessionStatus, useExistingSessionKey } from '../src/web2/session.js';
import { createClient } from '../src/web2/client.js';
import { WEB2_CHAIN_ID } from '../src/types/common.js';

const testPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const principalId = 'test-principal-uuid';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getSessionStatus', () => {
  it('posts the signed session check and returns the active session', async () => {
    const session = useExistingSessionKey({ sessionPrivateKey: testPrivateKey, principalId });
    const address = await session.signer.getAddress();
    let captured: { url: string; method: string; body: { data: string; signature: string } } | undefined;
    const fetchFn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      captured = {
        url: String(url),
        method: init?.method ?? '',
        body: JSON.parse(String(init?.body)) as { data: string; signature: string },
      };
      return jsonResponse(200, {
        success: true,
        active: true,
        principalId,
        sessionAddress: address.toLowerCase(),
        expiresAt: '2099-01-01T00:00:00.000Z',
      });
    });

    const result = await getSessionStatus({
      session,
      blackboxUrl: 'https://blackbox.example/',
      fetch: fetchFn as typeof fetch,
    });

    expect(captured?.url).toBe('https://blackbox.example/web2/session/status');
    expect(captured?.method).toBe('POST');
    expect(captured?.body.data.startsWith(`${WEB2_CHAIN_ID}_${principalId}_${address}_`)).toBe(true);
    expect(captured?.body.signature).toMatch(/^0x[0-9a-f]+$/);
    expect(result).toEqual({
      success: true,
      active: true,
      principalId,
      sessionAddress: address.toLowerCase(),
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
  });

  it('throws BlackboxError when the session is not active', async () => {
    const session = useExistingSessionKey({ sessionPrivateKey: testPrivateKey, principalId });
    const fetchFn = vi.fn(async () => jsonResponse(403, { error: 'No active session for this address' }));

    await expect(getSessionStatus({
      session,
      blackboxUrl: 'https://blackbox.example',
      fetch: fetchFn as typeof fetch,
    })).rejects.toMatchObject({
      name: 'BlackboxError',
      message: 'No active session for this address',
      statusCode: 403,
      endpoint: '/web2/session/status',
    });
  });
});

describe('Web2Client.getSessionStatus', () => {
  it('uses the stored session and blackbox url', async () => {
    const fetchFn = vi.fn(async () => jsonResponse(200, {
      success: true,
      active: true,
      principalId,
      sessionAddress: '0xabc',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }));
    const client = createClient({
      blackboxUrl: 'https://blackbox.example',
      fetch: fetchFn as typeof fetch,
    });
    client.useExistingSessionKey({ sessionPrivateKey: testPrivateKey, principalId });

    const result = await client.getSessionStatus();

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url] = fetchFn.mock.calls[0];
    expect(String(url)).toBe('https://blackbox.example/web2/session/status');
    expect(result.active).toBe(true);
    expect(result.expiresAt).toBe('2099-01-01T00:00:00.000Z');
  });
});
