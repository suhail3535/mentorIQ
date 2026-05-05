export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}
