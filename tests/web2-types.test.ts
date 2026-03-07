/**
 * @file tests/web2-types.test.ts
 * @description Type-level tests for Web2 types
 *
 * These tests verify that types are exported correctly and can be
 * imported by consumers. Runtime assertions are minimal — the value
 * is in the compile-time checks.
 */

import { describe, it, expect } from 'vitest';
import {
  WEB2_CHAIN_ID,
} from '../src/types/common.js';
import type {
  Ed25519Signer,
  RegisterParams,
  RegisterResult,
  VerifyEmailParams,
  VerifyEmailResult,
  RegisterKeyParams,
  RegisterKeyResult,
  ResendOtpParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  RetryNodeRegistrationParams,
  RetryNodeRegistrationResult,
  NodeRegistrationStatusResult,
  CreateManagedSessionParams,
  CreateSessionResult,
  UseExistingSessionKeyParams,
  Web2Session,
  CreateWeb2SecretParams,
  CreateWeb2SecretResult,
  ListWeb2SecretsParams,
  ListWeb2SecretsResult,
  Web2SecretInfo,
  SetWeb2DelegateParams,
  SetWeb2DelegateResult,
  PermitAction,
  RequestPermitParams,
  RequestPermitResult,
  PrincipalByEmailResult,
  Web2BlackboxBaseParams,
} from '../src/types/web2.js';
import {
  Web2Error,
  Web2SessionError,
  Web2AuthError,
  isWeb2Error,
  isWeb2SessionError,
  CiferError,
} from '../src/internal/errors/index.js';

describe('Web2 Types', () => {
  it('WEB2_CHAIN_ID is exported and equals -1', () => {
    expect(WEB2_CHAIN_ID).toBe(-1);
  });

  it('types can be referenced in type positions', () => {
    // These are compile-time checks only
    const _ed25519: Ed25519Signer | null = null;
    const _registerParams: RegisterParams | null = null;
    const _registerResult: RegisterResult | null = null;
    const _verifyParams: VerifyEmailParams | null = null;
    const _verifyResult: VerifyEmailResult | null = null;
    const _regKeyParams: RegisterKeyParams | null = null;
    const _regKeyResult: RegisterKeyResult | null = null;
    const _resendOtp: ResendOtpParams | null = null;
    const _forgotPw: ForgotPasswordParams | null = null;
    const _resetPw: ResetPasswordParams | null = null;
    const _retryNode: RetryNodeRegistrationParams | null = null;
    const _retryNodeResult: RetryNodeRegistrationResult | null = null;
    const _nodeRegStatus: NodeRegistrationStatusResult | null = null;
    const _createSession: CreateManagedSessionParams | null = null;
    const _sessionResult: CreateSessionResult | null = null;
    const _existingKey: UseExistingSessionKeyParams | null = null;
    const _session: Web2Session | null = null;
    const _createSecret: CreateWeb2SecretParams | null = null;
    const _secretResult: CreateWeb2SecretResult | null = null;
    const _listSecrets: ListWeb2SecretsParams | null = null;
    const _listResult: ListWeb2SecretsResult | null = null;
    const _secretInfo: Web2SecretInfo | null = null;
    const _setDelegate: SetWeb2DelegateParams | null = null;
    const _delegateResult: SetWeb2DelegateResult | null = null;
    const _permitAction: PermitAction | null = null;
    const _permitParams: RequestPermitParams | null = null;
    const _permitResult: RequestPermitResult | null = null;
    const _principalResult: PrincipalByEmailResult | null = null;
    const _baseParams: Web2BlackboxBaseParams | null = null;

    // All null — we're just testing that the types are importable
    expect(true).toBe(true);
  });
});

describe('Web2 Error Hierarchy', () => {
  it('Web2Error extends CiferError', () => {
    const error = new Web2Error('test');
    expect(error).toBeInstanceOf(CiferError);
    expect(error).toBeInstanceOf(Web2Error);
    expect(error.name).toBe('Web2Error');
    expect(error.code).toBe('WEB2_ERROR');
    expect(error.message).toBe('test');
  });

  it('Web2SessionError extends Web2Error', () => {
    const error = new Web2SessionError('session expired');
    expect(error).toBeInstanceOf(CiferError);
    expect(error).toBeInstanceOf(Web2Error);
    expect(error).toBeInstanceOf(Web2SessionError);
    expect(error.name).toBe('Web2SessionError');
    expect(error.code).toBe('WEB2_ERROR');
  });

  it('Web2AuthError extends Web2Error', () => {
    const error = new Web2AuthError('invalid OTP');
    expect(error).toBeInstanceOf(CiferError);
    expect(error).toBeInstanceOf(Web2Error);
    expect(error).toBeInstanceOf(Web2AuthError);
    expect(error.name).toBe('Web2AuthError');
    expect(error.code).toBe('WEB2_ERROR');
  });

  it('isWeb2Error type guard works', () => {
    expect(isWeb2Error(new Web2Error('test'))).toBe(true);
    expect(isWeb2Error(new Web2SessionError('test'))).toBe(true);
    expect(isWeb2Error(new Web2AuthError('test'))).toBe(true);
    expect(isWeb2Error(new Error('not web2'))).toBe(false);
    expect(isWeb2Error('string')).toBe(false);
    expect(isWeb2Error(null)).toBe(false);
  });

  it('isWeb2SessionError type guard works', () => {
    expect(isWeb2SessionError(new Web2SessionError('test'))).toBe(true);
    expect(isWeb2SessionError(new Web2Error('test'))).toBe(false);
    expect(isWeb2SessionError(new Web2AuthError('test'))).toBe(false);
    expect(isWeb2SessionError(new Error('not web2'))).toBe(false);
  });
});
