/**
 * Combined Timeout + Retry Utility
 * Wraps API calls with both timeout and retry logic for robust data fetching
 */

import { withTimeout, TimeoutError } from "./timeout";
import { withRetry, RetryOptions } from "./retry";

export interface FetchWithRetryOptions {
    timeoutMs: number;
    maxRetries?: number;
    sourceName: string;
    initialDelayMs?: number;
    maxDelayMs?: number;
    retryableErrors?: (error: any) => boolean;
}

/**
 * Fetch data with timeout and retry logic
 * @param fn Function that returns a Promise to fetch data
 * @param options Configuration for timeout and retry behavior
 * @returns Promise that resolves with the fetched data
 */
export async function fetchWithTimeoutAndRetry<T>(
    fn: () => Promise<T>,
    options: FetchWithRetryOptions
): Promise<T> {
    const { timeoutMs, sourceName, ...retryOptions } = options;

    const timeoutSeconds = Math.round(timeoutMs / 1000);
    console.log(
        `[${sourceName}] Starting fetch (timeout: ${timeoutSeconds}s, maxRetries: ${
            retryOptions.maxRetries ?? 3
        })`
    );

    try {
        const result = await withRetry(
            () =>
                withTimeout(fn(), timeoutMs, `${sourceName} request timed out`),
            retryOptions
        );
        console.log(`[${sourceName}] ✅ Fetch completed successfully`);
        return result;
    } catch (error: any) {
        if (error instanceof TimeoutError) {
            console.error(
                `[${sourceName}] Failed after ${
                    options.maxRetries ?? 3
                } retries: Timeout after ${timeoutMs}ms`
            );
        } else if (error?.status === 429) {
            console.error(
                `[${sourceName}] Failed: Rate limit exceeded. Consider increasing delay or reducing request frequency.`
            );
        } else if (error?.status === 401) {
            console.error(
                `[${sourceName}] Failed: Authentication error (401). Check API credentials.`
            );
        } else if (
            error?.status === 403 &&
            (error?.message?.includes("rate limit") ||
                error?.message?.includes("403"))
        ) {
            console.error(
                `[${sourceName}] Failed: Rate limit exceeded (403). All retries exhausted.`
            );
        } else if (error?.status === 403) {
            console.error(
                `[${sourceName}] Failed: Authorization error (403). Check API permissions.`
            );
        } else {
            console.error(
                `[${sourceName}] Failed after ${
                    options.maxRetries ?? 3
                } retries:`,
                error.message || error
            );
        }
        throw error;
    }
}
