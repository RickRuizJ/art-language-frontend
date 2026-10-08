import { act, render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '@/app/dashboard/student/page';
import api, { messageAPI } from '@/lib/api';
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user:{id:'s',firstName:'Ana',role:'student'},loading:false,logout:jest.fn() }) }));
jest.mock('@/lib/api', () => ({ __esModule:true,default:{get:jest.fn()},messageAPI:{getInbox:jest.fn(),markRead:jest.fn()} }));
jest.mock('next/link', () => ({ __esModule:true,default:({children,...props}) => <a {...props}>{children}</a> }));
const assignment = (id,title) => ({ id,worksheetId:id,worksheet:{id,title},submissionStatus:'pending' });
const dashboard = items => ({ data:{assignments:items,stats:{avgScore:null},student:{firstName:'Ana'}} });
const message = {id:'m',body:'Teacher message',isRead:false,createdAt:'2026-10-07T10:00:00Z'};
const inbox = messages => ({ data:{data:{messages,unreadCount:messages.length}} });
const flush = () => act(async () => { await Promise.resolve(); });
const tick = ms => act(async () => { await jest.advanceTimersByTimeAsync(ms); });
beforeEach(() => {
  jest.useFakeTimers(); Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
  api.get.mockResolvedValue(dashboard([assignment('a','Original worksheet')]));
  messageAPI.getInbox.mockResolvedValue(inbox([message]));
});
afterEach(() => jest.useRealTimers());
test('initial assignments and messages load independently and Refresh is available', async () => {
  render(<Dashboard/>); await flush();
  expect(screen.getByText('Original worksheet')).toBeInTheDocument(); expect(screen.getByText('Teacher message')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Refresh'})).toBeEnabled();
  expect(api.get.mock.calls[0][0]).toBe('/students/dashboard');
  expect(api.get.mock.calls[0][1].timeout).toBe(45000);
});
test('open session receives newly assigned worksheet after 30 seconds without duplication', async () => {
  render(<Dashboard/>); await flush();
  api.get.mockResolvedValue(dashboard([assignment('a','Original worksheet'),assignment('b','New worksheet'),assignment('b','New worksheet')]));
  await tick(30000);
  expect(screen.getAllByText('Original worksheet')).toHaveLength(1);
  expect(screen.getAllByText('New worksheet')).toHaveLength(1);
  expect(screen.getAllByText('Teacher message')).toHaveLength(1);
  expect(api.get.mock.calls[1][1].timeout).toBe(20000);
});
test('manual refresh retains visible cards while Updating and shows only a small error on exhaustion', async () => {
  render(<Dashboard/>); await flush(); api.get.mockRejectedValue({ response:{status:503} });
  fireEvent.click(screen.getByRole('button',{name:'Refresh'})); await flush();
  expect(screen.getByText('Updating...')).toBeInTheDocument(); expect(screen.getByText('Original worksheet')).toBeInTheDocument();
  await tick(7000);
  expect(screen.getByText("We couldn't refresh your assignments. Please try again.")).toBeInTheDocument();
  expect(screen.getByText('Original worksheet')).toBeInTheDocument(); expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
});
test('messages failing never block successful assignments; previous inbox is retained', async () => {
  render(<Dashboard/>); await flush(); messageAPI.getInbox.mockRejectedValue({ response:{status:503} });
  api.get.mockResolvedValue(dashboard([assignment('b','New worksheet')]));
  fireEvent.click(screen.getByRole('button',{name:'Refresh'})); await flush();
  expect(screen.getByText('New worksheet')).toBeInTheDocument(); await tick(7000);
  expect(screen.getByText('Teacher message')).toBeInTheDocument();
  expect(screen.getByText(/couldn't refresh your messages/)).toBeInTheDocument();
});
test('initial messages failure does not block assignments', async () => {
  messageAPI.getInbox.mockRejectedValue({ code:'ECONNABORTED' });
  render(<Dashboard/>); await flush(); expect(screen.getByText('Original worksheet')).toBeInTheDocument();
  await tick(7000); expect(screen.getByText('Original worksheet')).toBeInTheDocument();
});
test('initial assignments failing never hide successful messages', async () => {
  api.get.mockRejectedValue({ response:{status:503} }); render(<Dashboard/>); await flush();
  expect(screen.getByText('Teacher message')).toBeInTheDocument();
  await tick(7000); expect(screen.getByText('Teacher message')).toBeInTheDocument();
  expect(screen.queryByText('No assignments yet')).not.toBeInTheDocument();
});
test('waking backend succeeds on retry without a logout/reload', async () => {
  api.get.mockRejectedValueOnce({ code:'ECONNABORTED' }).mockResolvedValue(dashboard([assignment('n','After wake')]));
  render(<Dashboard/>); await flush(); await tick(2000);
  expect(screen.getByText('After wake')).toBeInTheDocument(); expect(api.get).toHaveBeenCalledTimes(2);
});
test.each([[390,844],[768,1024],[1440,900]])('resume events work without mouse interaction at %sx%s (DOM simulation)', async (width,height) => {
  Object.defineProperty(window,'innerWidth',{configurable:true,value:width});
  Object.defineProperty(window,'innerHeight',{configurable:true,value:height});
  render(<Dashboard/>); await flush(); await tick(1200);
  api.get.mockResolvedValue(dashboard([assignment('b','Returned activity')]));
  act(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await flush(); expect(screen.getByText('Returned activity')).toBeInTheDocument(); expect(api.get).toHaveBeenCalledTimes(2);
});
