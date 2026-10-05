import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authMeQueryKey, getAuthMe } from '../src/shared/apis/auth';
import { signupMember, type SignupPayload } from '../src/shared/apis/signup';

const fetchMock = vi.fn();
const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const payload: SignupPayload = {
  agreements: [], nickname: 'test', mainType: 'DEVELOPER', categoryIds: [], techstackIds: [],
};
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => vi.unstubAllGlobals());

describe('server membership is authoritative', () => {
  it('returns unregistered even for an authenticated session and uses the local proxy', async () => {
    fetchMock.mockResolvedValue(respond(200, {
      isSuccess: true, result: { clerkId: 'test-user', memberId: null, isRegistered: false },
    }));
    expect(await getAuthMe('test-token')).toMatchObject({ memberId: null, isRegistered: false });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/me', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
    }));
  });
  it.each([401, 500])('does not turn HTTP %s into an unregistered result', async (status) => {
    fetchMock.mockResolvedValue(respond(status, { isSuccess: false, code: 'TEST', message: 'failed' }));
    await expect(getAuthMe('test-token')).rejects.toMatchObject({ status, code: 'TEST' });
  });
  it('rejects malformed successful responses', async () => {
    fetchMock.mockResolvedValue(respond(200, { isSuccess: true, result: {} }));
    await expect(getAuthMe('test-token')).rejects.toThrow('회원 정보 응답');
  });
  it('separates membership caches for different Clerk users', () => {
    expect(authMeQueryKey('first-user')).not.toEqual(authMeQueryKey('second-user'));
  });
});

describe('signup confirmation', () => {
  it('rejects unrelated 409 conflicts', async () => {
    fetchMock.mockResolvedValue(respond(409, { isSuccess: false, code: 'OTHER409', message: 'conflict' }));
    await expect(signupMember(payload, 'test-token')).rejects.toThrow('conflict');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it.each([false, true])('verifies actual membership after duplicate signup (registered=%s)', async (registered) => {
    fetchMock.mockResolvedValueOnce(respond(409, { isSuccess: false, code: 'MEMBER409_2' }));
    fetchMock.mockResolvedValueOnce(respond(200, { isSuccess: true, result: { isRegistered: registered } }));
    if (registered) await expect(signupMember(payload, 'test-token')).resolves.toMatchObject({ code: 'MEMBER409_2' });
    else await expect(signupMember(payload, 'test-token')).rejects.toThrow('회원가입 상태');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('does not complete signup on a failed application response with HTTP 200', async () => {
    fetchMock.mockResolvedValue(respond(200, { isSuccess: false, message: 'failed signup' }));
    await expect(signupMember(payload, 'test-token')).rejects.toThrow('failed signup');
  });
});
