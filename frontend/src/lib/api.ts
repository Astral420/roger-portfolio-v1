const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, ...fetchOptions } = options;

  const url = new URL(`${API_URL}${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const error = (await response.json()) as {
        message?: string;
        error?: { message?: string };
      };
      message = error.message ?? error.error?.message ?? message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  // Some endpoints (204 No Content) won't have a body.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
