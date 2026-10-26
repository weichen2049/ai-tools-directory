import { isAbortError } from "./errorHandling";

export type FetchRetryOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
};

const DEFAULT_TIMEOUT = 120000;
const DEFAULT_RETRY_STATUSES = [408, 425, 429, 500, 502, 503, 504];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAbortController(externalSignal: AbortSignal | null | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }

  let removeExternalListener: (() => void) | undefined;
  if (externalSignal) {
    const handleAbort = () => controller.abort();
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", handleAbort, { once: true });
      removeExternalListener = () => externalSignal.removeEventListener("abort", handleAbort);
    }
  }

  return {
    signal: controller.signal,
    isTimedOut: () => timedOut,
    cleanup: () => {
      if (timeoutId) clearTimeout(timeoutId);
      removeExternalListener?.();
    }
  };
}

async function readErrorMessage(response: Response) {
  try {
    const text = await response.text();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function fetchWithRetry(url: string, options: FetchRetryOptions = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 1,
    retryDelayMs = 600,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { signal, cleanup, isTimedOut } = createAbortController(externalSignal ?? undefined, timeoutMs);
    try {
      const response = await fetch(url, { ...fetchOptions, signal });
      cleanup();

      if (!response.ok) {
        if (retryOnStatuses.includes(response.status) && attempt < retries) {
          lastError = new Error(await readErrorMessage(response));
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        const message = await readErrorMessage(response);
        throw new Error(message);
      }

      return response;
    } catch (error) {
      cleanup();
      if (isAbortError(error)) {
        if (isTimedOut()) {
          throw new Error("请求超时");
        }
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("请求失败");
      if (attempt >= retries) {
        throw lastError;
      }
      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError ?? new Error("请求失败");
}