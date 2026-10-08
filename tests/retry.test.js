import { fetchWithRetry, dynamicReadConfig } from '@/lib/fetchWithRetry';
const timeout = { code: 'ECONNABORTED' };
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
test.each([timeout, { code: 'ERR_NETWORK' }, ...[500,502,503,504].map(status => ({ response: { status } }))])('retries transient %o with exactly 2s then 5s', async error => {
  const fn = jest.fn().mockRejectedValueOnce(error).mockRejectedValueOnce(error).mockResolvedValue('fresh');
  const promise = fetchWithRetry(fn);
  await jest.advanceTimersByTimeAsync(1999); expect(fn).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(1); expect(fn).toHaveBeenCalledTimes(2);
  await jest.advanceTimersByTimeAsync(4999); expect(fn).toHaveBeenCalledTimes(2);
  await jest.advanceTimersByTimeAsync(1); await expect(promise).resolves.toBe('fresh');
  expect(fn).toHaveBeenCalledTimes(3);
});
test.each([401,403,404,429])('does not retry HTTP %s', async status => {
  const fn = jest.fn().mockRejectedValue({ response: { status } });
  await expect(fetchWithRetry(fn)).rejects.toEqual({ response: { status } });
  expect(fn).toHaveBeenCalledTimes(1);
});
test('stops after three attempts even if backend stays unavailable', async () => {
  const fn = jest.fn().mockRejectedValue(timeout);
  const result = fetchWithRetry(fn).catch(e => e);
  await jest.advanceTimersByTimeAsync(10000);
  expect(await result).toEqual(timeout); expect(fn).toHaveBeenCalledTimes(3);
});
test('abort during backoff cancels retry', async () => {
  const controller = new AbortController(), fn = jest.fn().mockRejectedValue(timeout);
  const result = fetchWithRetry(fn, { signal: controller.signal }).catch(e => e);
  await jest.advanceTimersByTimeAsync(1000); controller.abort();
  await jest.advanceTimersByTimeAsync(10000);
  expect((await result).name).toBe('AbortError'); expect(fn).toHaveBeenCalledTimes(1);
});
test('reads use distinct cache keys and preserve their query params', () => {
  const a = dynamicReadConfig({ params: { limit: 20 } }), b = dynamicReadConfig();
  expect(a.params.limit).toBe(20); expect(a.params._refresh).not.toBe(b.params._refresh);
});
