export function isDatabaseUnavailable(error: unknown): boolean {
  const e = error as { code?: string | number; message?: string } | null;
  return (
    !!e &&
    ([
      4,
      8,
      14,
      "RESOURCE_EXHAUSTED",
      "DEADLINE_EXCEEDED",
      "UNAVAILABLE",
    ].includes(e.code ?? "") ||
      /quota exceeded|resource.exhausted|database timeout/i.test(
        e.message || "",
      ))
  );
}
export async function publicReadDeadline<T>(
  read: Promise<T>,
  ms = 5000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      read,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Database timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
// Wraps a strict read so a database outage serves the last good snapshot
// (or an explicit "unavailable" state) instead of failing the page.
export function resilient<T>(read: () => Promise<T[]>) {
  let lastGood: T[] | undefined;
  return async (): Promise<{ items: T[]; unavailable: boolean }> => {
    try {
      lastGood = await read();
      return { items: lastGood, unavailable: false };
    } catch (error) {
      if (!isDatabaseUnavailable(error)) throw error;
      return lastGood
        ? { items: lastGood, unavailable: false }
        : { items: [], unavailable: true };
    }
  };
}
