type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export function isRemoteApiEnabled() {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "false" && Boolean(API_BASE_URL);
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.", 500);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed: GET ${path}`, response.status);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;
  return isEnvelope(payload) ? payload.data as T : payload;
}

function isEnvelope<T>(payload: ApiEnvelope<T> | T): payload is ApiEnvelope<T> {
  return Boolean(payload && typeof payload === "object" && "data" in payload);
}
