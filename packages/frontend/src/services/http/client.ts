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

export async function httpRequest<T>(
  url: string,
  options: HttpRequestOptions = {}
): Promise<T> {
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
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP error: ${response.status}`);
  }

  return response.json();
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
  const { params, ...fetchOptions } = options;

  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP error: ${response.status}`);
  }

  return response.blob();
}
