import createClient from "openapi-fetch";

import type { paths } from "./schema";

export type { paths };

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const apiClient = createClient<paths>({ baseUrl });
