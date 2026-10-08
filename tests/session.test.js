import { act, render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
const student = { id: 'student-1', role: 'student', firstName: 'Ana' };
function Probe() {
  const { user, loading, authError, logout } = useAuth();
  return <><p>{user?.firstName || 'No user'}</p><p>{loading ? 'Loading' : 'Ready'}</p>
    {authError && <p>{authError}</p>}<button onClick={logout}>Logout</button></>;
}
const tick = ms => act(async () => { await jest.advanceTimersByTimeAsync(ms); });
const flush = () => act(async () => { await Promise.resolve(); });
const success = config => Promise.resolve({ status: 200, config, data: { data: { user: student } }, headers: {} });
beforeEach(() => {
  jest.useFakeTimers(); localStorage.clear();
  localStorage.setItem('token','still-valid'); localStorage.setItem('user',JSON.stringify(student));
  Object.defineProperty(document,'visibilityState',{ configurable:true,value:'visible' });
});
afterEach(() => jest.useRealTimers());
test.each([{ response: { status: 500 } },{ code: 'ECONNABORTED' },{ code: 'ERR_NETWORK' }])('retains token AND rendered session during %o; recovers on focus', async failure => {
  const adapter = jest.fn().mockRejectedValue(failure); api.defaults.adapter = adapter;
  render(<AuthProvider><Probe /></AuthProvider>); await flush();
  expect(screen.getByText('Ana')).toBeInTheDocument();
  await tick(7000);
  expect(localStorage.getItem('token')).toBe('still-valid');
  expect(screen.getByText('Ana')).toBeInTheDocument(); expect(adapter).toHaveBeenCalledTimes(3);
  adapter.mockImplementation(success);
  act(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); });
  await flush(); expect(adapter).toHaveBeenCalledTimes(4);
  expect(screen.queryByText(/Reconnecting automatically/)).not.toBeInTheDocument();
});
test('real 401 invalidates storage and has no retry', async () => {
  const adapter = jest.fn().mockRejectedValue({ response: { status: 401 } }); api.defaults.adapter = adapter;
  render(<AuthProvider><Probe /></AuthProvider>); await flush(); await tick(90000);
  expect(localStorage.getItem('token')).toBeNull(); expect(localStorage.getItem('user')).toBeNull();
  expect(screen.getByText('No user')).toBeInTheDocument(); expect(adapter).toHaveBeenCalledTimes(1);
});
test('missing user cache with valid token recovers automatically after outage', async () => {
  localStorage.removeItem('user');
  const adapter = jest.fn().mockRejectedValue({ response: { status: 503 } }); api.defaults.adapter = adapter;
  render(<AuthProvider><Probe /></AuthProvider>); await flush(); await tick(7000);
  expect(localStorage.getItem('token')).toBe('still-valid'); expect(screen.getByText(/Reconnecting automatically/)).toBeInTheDocument();
  adapter.mockImplementation(success); await tick(23000);
  expect(screen.getByText('Ana')).toBeInTheDocument();
});
test('logout cancels outstanding validation and cannot restore the cached user', async () => {
  let finish;
  api.defaults.adapter = jest.fn(config => new Promise(resolve => { finish = () => resolve({ status:200,config,data:{data:{user:student}},headers:{} }); }));
  render(<AuthProvider><Probe /></AuthProvider>); await flush();
  fireEvent.click(screen.getByText('Logout')); await act(async () => finish());
  expect(screen.getByText('No user')).toBeInTheDocument(); expect(localStorage.getItem('token')).toBeNull();
});
