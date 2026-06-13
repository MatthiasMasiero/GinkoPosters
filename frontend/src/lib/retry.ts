/**
 * Retry an async function a few times with linear backoff.
 *
 * The storefront's first API call happens on a cold page load, before the
 * browser has a warm DNS/TLS connection to the API. If that first request
 * hiccups it would otherwise leave the page permanently empty until a manual
 * refresh, so we retry transient failures here.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 400,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * (attempt + 1)),
        );
      }
    }
  }
  throw lastError;
}
