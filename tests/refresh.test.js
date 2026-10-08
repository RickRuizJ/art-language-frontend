import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import useAutoRefresh from '@/hooks/useAutoRefresh';
const flush = () => act(async () => { await Promise.resolve(); });
const tick = ms => act(async () => { await jest.advanceTimersByTimeAsync(ms); });
const visible = value => Object.defineProperty(document, 'visibilityState', { configurable: true, value });
beforeEach(() => { jest.useFakeTimers(); visible('visible'); });
afterEach(() => jest.useRealTimers());
test('loads initially and shows newly assigned work on the 30-second poll without logout', async () => {
  const load = jest.fn().mockResolvedValueOnce(['old']).mockResolvedValue(['old','new']);
  const { result } = renderHook(() => useAutoRefresh(load)); await flush();
  expect(result.current.data).toEqual(['old']);
  await tick(29999); expect(load).toHaveBeenCalledTimes(1);
  await tick(1); expect(result.current.data).toEqual(['old','new']);
  expect(load).toHaveBeenCalledTimes(2);
});
test.each(['focus','visibilitychange','online'])('refreshes on %s; duplicate resume events are throttled', async event => {
  const load = jest.fn().mockResolvedValue('current');
  renderHook(() => useAutoRefresh(load)); await flush(); await tick(1200);
  act(() => (event === 'visibilitychange' ? document : window).dispatchEvent(new Event(event)));
  await flush(); expect(load).toHaveBeenCalledTimes(2);
  act(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); });
  await flush(); expect(load).toHaveBeenCalledTimes(2);
});
test('hidden tabs pause polling and returning to visible refreshes', async () => {
  const load = jest.fn().mockResolvedValue('current');
  renderHook(() => useAutoRefresh(load)); await flush(); visible('hidden');
  await tick(60000); expect(load).toHaveBeenCalledTimes(1);
  act(() => { visible('visible'); document.dispatchEvent(new Event('visibilitychange')); });
  await flush(); expect(load).toHaveBeenCalledTimes(2);
});
test('slow requests keep one lock across timer, manual, focus and retry', async () => {
  let finish;
  const load = jest.fn().mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useAutoRefresh(load)); await flush();
  await tick(60000);
  act(() => { result.current.refresh(); window.dispatchEvent(new Event('focus')); }); await flush();
  expect(load).toHaveBeenCalledTimes(1);
  await act(async () => finish(['new'])); expect(result.current.data).toEqual(['new']);
});
test('existing data remains during refresh and after all retries fail', async () => {
  const load = jest.fn().mockResolvedValueOnce(['old']).mockRejectedValue({ response: { status: 503 } });
  const { result } = renderHook(() => useAutoRefresh(load)); await flush();
  act(() => { result.current.refresh(); }); await flush();
  expect(result.current.updating).toBe(true); expect(result.current.data).toEqual(['old']);
  await tick(7000);
  expect(load).toHaveBeenCalledTimes(4); expect(result.current.updating).toBe(false);
  expect(result.current.error.response.status).toBe(503); expect(result.current.data).toEqual(['old']);
});
test('401 stops retries and later polling for that session', async () => {
  const load = jest.fn().mockRejectedValue({ response: { status: 401 } });
  renderHook(() => useAutoRefresh(load)); await flush(); await tick(90000);
  expect(load).toHaveBeenCalledTimes(1);
});
test('unmount aborts request and removes timers/listeners', async () => {
  let signal;
  const load = jest.fn().mockImplementation(options => { signal = options.signal; return new Promise(() => {}); });
  const { unmount } = renderHook(() => useAutoRefresh(load)); await flush(); unmount();
  expect(signal.aborted).toBe(true);
  await tick(60000); window.dispatchEvent(new Event('focus')); expect(load).toHaveBeenCalledTimes(1);
});
test('account change discards previous data and ignores its late response', async () => {
  let finish;
  const load = jest.fn().mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValue(['new user']);
  const { result, rerender } = renderHook(({ id }) => useAutoRefresh(load, { resourceKey: id }), { initialProps: { id: 'one' } });
  await flush(); rerender({ id: 'two' }); await flush();
  await act(async () => finish(['old user'])); expect(result.current.data).toEqual(['new user']);
});

test('React StrictMode cancels the discarded mount without issuing duplicate reads', async () => {
  const load = jest.fn().mockResolvedValue(['current']);
  const wrapper = ({ children }) => <StrictMode>{children}</StrictMode>;
  const { result } = renderHook(() => useAutoRefresh(load), { wrapper }); await flush();
  expect(load).toHaveBeenCalledTimes(1); expect(result.current.data).toEqual(['current']);
});
