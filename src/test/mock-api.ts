import { vi } from "vitest";

export interface MockApiRequest {
  method: string;
  url: URL;
}

export type MockApiHandler = (request: MockApiRequest) => Response;

function toUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function toMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method !== undefined) {
    return init.method.toUpperCase();
  }
  if (input instanceof Request) {
    return input.method;
  }
  return "GET";
}

/**
 * Stub `globalThis.fetch` with a pathname router so integration tests can
 * exercise the real generated client against deterministic mock responses.
 */
export function mockApi(routes: Record<string, MockApiHandler>) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(toUrl(input));
    const route = routes[url.pathname];
    if (route === undefined) {
      throw new Error(`Unhandled API request: ${url.pathname}`);
    }
    return route({ method: toMethod(input, init), url });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}
