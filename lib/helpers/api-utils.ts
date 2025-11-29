// lib/helpers/api-utils.ts

/** Build query params safely (skip undefined/null/empty string) */
export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.append(k, String(v));
  }
  return search;
}

/** Format params into query-string (for debugging) */
export function formatParams(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}
