'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

export const ASSIGNMENTS_REFRESH_INTERVAL = 30000;
export const FOCUS_REFRESH_THROTTLE = 1000;

// Each resource owns its request lock, retry budget, data and error state.
export default function useAutoRefresh(load, { enabled = true, resourceKey = '', interval = ASSIGNMENTS_REFRESH_INTERVAL } = {}) {
  const [state, setState] = useState({ key: resourceKey, data: null, loading: enabled, updating: false, error: null });
  const refreshRef = useRef(() => Promise.resolve());
  const refresh = useCallback(() => refreshRef.current('manual'), []);
  const setData = useCallback(update => setState(s => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })), []);

  useEffect(() => {
    let active = true, inFlight = null, controller = null, lastStarted = -Infinity;
    let loaded = false, unauthorized = false;
    setState({ key: resourceKey, data: null, loading: enabled, updating: false, error: null });
    async function run(reason) {
      if (!active || !enabled || unauthorized) return;
      if (inFlight) return inFlight;
      if (reason === 'resume' && Date.now() - lastStarted < FOCUS_REFRESH_THROTTLE) return;
      lastStarted = Date.now();
      controller = new AbortController();
      const signal = controller.signal;
      setState(s => ({ ...s, updating: true, error: null }));
      // Defer the loader one microtask so the lock is installed even for a synchronous error.
      inFlight = Promise.resolve().then(async () => {
        try {
          const data = await fetchWithRetry(attempt => load({ signal, initial: !loaded, attempt }), { signal });
          if (active && !signal.aborted) {
            loaded = true;
            setState(s => ({ ...s, data, error: null }));
          }
        } catch (error) {
          if (active && !signal.aborted) {
            unauthorized = error.response?.status === 401;
            setState(s => ({ ...s, error }));
          }
        } finally {
          if (active) {
            inFlight = null;
            setState(s => ({ ...s, loading: false, updating: false }));
          }
        }
      });
      return inFlight;
    }
    refreshRef.current = run;
    if (!enabled) return () => { active = false; };
    const resume = () => { if (document.visibilityState === 'visible') void run('resume'); };
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void run('interval');
    }, interval);
    window.addEventListener('focus', resume);
    window.addEventListener('online', resume);
    document.addEventListener('visibilitychange', resume);
    void run('initial');
    return () => {
      active = false;
      controller?.abort();
      clearInterval(timer);
      window.removeEventListener('focus', resume);
      window.removeEventListener('online', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [enabled, resourceKey, interval, load]);

  // Never render data from a different account while its effect is being replaced.
  const current = state.key === resourceKey ? state : { data: null, loading: enabled, updating: false, error: null };
  return { ...current, refresh, setData };
}
