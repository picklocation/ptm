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
      "PGRST000",
      "PGRST001",
      "PGRST002",
      "57014",
    ].includes(e.code ?? "") ||
      /quota exceeded|resource.exhausted|database timeout|fetch failed|connection.*timeout|aborted due to timeout/i.test(
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
