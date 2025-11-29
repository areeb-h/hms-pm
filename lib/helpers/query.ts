// lib/helpers/query.ts

export async function createQuery<TArgs extends any[], TResult>(
  name: string,
  fn: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (err: any) {
      console.error(`[Query:${name}] Failed:`, err);
      throw new Error(`Query "${name}" failed: ${err?.message || err}`);
    }
  };
}
