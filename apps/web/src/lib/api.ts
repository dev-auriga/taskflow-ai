import type { ApiResponse, ApiErrorResponse } from '@taskflow/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom error class for API errors.
 * Contains the structured error response from the backend.
 */
export class ApiError extends Error {
  statusCode: number;
  details?: Array<{ field: string; message: string }>;

  constructor(statusCode: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Typed API client that handles the response envelope and error extraction.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ApiErrorResponse;
    throw new ApiError(
      errorBody.error.statusCode,
      errorBody.error.message,
      errorBody.error.details,
    );
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

/**
 * API client methods organized by resource.
 */
export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, data: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  patch: <T>(path: string, data: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
};
