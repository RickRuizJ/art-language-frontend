// Retry reads only. Mutations (uploads, submissions, messages) never use this helper.
export const RETRY_DELAYS = [2000, 5000];
export const isRetryableError = (error) => {
  if (error?.code === 'ERR_CANCELED' || error?.name === 'AbortError') return false;
  if (error?.response) return [500, 502, 503, 504].includes(error.response.status);
  return ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'].includes(error?.code)
    || (error?.isAxiosError === true && !!error.request);
};

function cancelled() {
  const error = new Error('Request cancelled');
  error.name = 'AbortError';
  return error;
}
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(cancelled());
    const abort = () => { clearTimeout(timer); reject(cancelled()); };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

// attempts includes the initial request: default = 1 request + at most 2 retries.
export async function fetchWithRetry(fn, { attempts = 3, delays = RETRY_DELAYS, signal } = {}) {
  const limit = Math.max(1, Math.min(3, attempts));
  for (let attempt = 0; attempt < limit; attempt += 1) {
    if (signal?.aborted) throw cancelled();
    try {
      return await fn(attempt);
    } catch (error) {
      if (signal?.aborted || !isRetryableError(error) || attempt === limit - 1) throw error;
      await wait(delays[attempt] ?? 5000, signal);
    }
  }
}

// Axios runs in the browser: Next.js fetch cache options do not apply.
// A fresh query key bypasses cached GET representations without changing other endpoints.
let requestNumber = 0;
export function dynamicReadConfig({ signal, timeout = 20000, params = {} } = {}) {
  return { signal, timeout, params: { ...params, _refresh: `${Date.now()}-${++requestNumber}` } };
}
