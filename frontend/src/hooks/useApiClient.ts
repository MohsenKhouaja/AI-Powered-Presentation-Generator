import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  body?: unknown;
};

function normalizeRequestBody(
  body: unknown,
  headers: Headers,
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return JSON.stringify(body);
}

export function useApiClient() {
  const { fetchwithauth } = useAuth();

  const request = useCallback(
    async <TData>(
      path: string,
      method: HttpMethod,
      options?: RequestOptions,
    ): Promise<TData> => {
      const headers = new Headers(options?.headers);
      const body = normalizeRequestBody(options?.body, headers);

      const response = await fetchwithauth(path, method, {
        ...options,
        headers,
        body,
      });

      if (response.status === 204) {
        return null as TData;
      }

      return (await response.json()) as TData;
    },
    [fetchwithauth],
  );

  return {
    get: <TData>(path: string, options?: Omit<RequestOptions, "body">) =>
      request<TData>(path, "GET", options),
    post: <TData>(path: string, body?: unknown, options?: RequestOptions) =>
      request<TData>(path, "POST", { ...options, body }),
    put: <TData>(path: string, body?: unknown, options?: RequestOptions) =>
      request<TData>(path, "PUT", { ...options, body }),
    del: <TData>(path: string, options?: Omit<RequestOptions, "body">) =>
      request<TData>(path, "DELETE", options),
    request,
  };
}
