import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { requestAccountDeletion, confirmAccountDeletion } from '../src/web2/auth.js';
import { Web2AuthError } from '../src/internal/errors/index.js';

describe('web2.auth account deletion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requestAccountDeletion POSTs email/password/principalId and returns message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: 'If the account details match, a confirmation code has been sent.',
        }),
        { status: 200 }
      )
    );

    const result = await requestAccountDeletion({
      email: 'a@b.com',
      password: 'pw',
      principalId: 'p-1',
      blackboxUrl: 'http://localhost:3010/',
    });

    expect(result.message).toContain('confirmation code');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3010/web2/auth/request-deletion',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', password: 'pw', principalId: 'p-1' }),
      })
    );
  });

  it('confirmAccountDeletion POSTs email/otp and returns success/message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true, message: 'Your account has been deleted.' }),
        { status: 200 }
      )
    );

    const result = await confirmAccountDeletion({
      email: 'a@b.com',
      otp: '123456',
      blackboxUrl: 'http://localhost:3010',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Your account has been deleted.');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3010/web2/auth/confirm-deletion',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', otp: '123456' }),
      })
    );
  });

  it('requestAccountDeletion throws Web2AuthError on non-2xx', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: 'Password and principalId are required' }),
        { status: 400 }
      )
    );

    await expect(
      requestAccountDeletion({
        email: 'a@b.com',
        password: '',
        principalId: 'p-1',
        blackboxUrl: 'http://localhost:3010',
      })
    ).rejects.toBeInstanceOf(Web2AuthError);
  });

  it('confirmAccountDeletion throws Web2AuthError on non-2xx', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: 'Invalid or expired confirmation code' }),
        { status: 401 }
      )
    );

    await expect(
      confirmAccountDeletion({
        email: 'a@b.com',
        otp: '000000',
        blackboxUrl: 'http://localhost:3010',
      })
    ).rejects.toBeInstanceOf(Web2AuthError);
  });
});
