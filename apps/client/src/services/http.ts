export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(input: RequestInfo): Promise<T> {
  const response = await fetch(input);
  if (response.status === 503) {
    throw new ApiError(503, "Server initializing");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }
  return (await response.json()) as T;
}
