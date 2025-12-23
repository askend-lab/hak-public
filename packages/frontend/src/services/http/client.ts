export interface HttpClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface HttpRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function doFetch(
  url: string,
  options: HttpRequestOptions = {}
): Promise<Response> {
  const { params, ...fetchOptions } = options;

  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP error: ${String(response.status)}`);
  }

  return response;
}

export async function httpRequest<T>(
  url: string,
  options: HttpRequestOptions = {}
): Promise<T> {
  const response = await doFetch(url, options);
  return response.json() as Promise<T>;
}

export async function httpPost<T>(
  url: string,
  body: unknown,
  options: HttpRequestOptions = {}
): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function httpGet<T>(
  url: string,
  options: HttpRequestOptions = {}
): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: 'GET',
  });
}

export async function httpPostBlob(
  url: string,
  body: unknown,
  options: HttpRequestOptions = {}
): Promise<Blob> {
  const response = await doFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.blob();
}
