/**
 * Standard API success response envelope.
 * All successful API responses are wrapped in this shape.
 */
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

/**
 * API error response shape.
 * All error responses follow this structure.
 */
export interface ApiErrorResponse {
  error: {
    statusCode: number;
    message: string;
    details?: ApiValidationError[];
  };
}

/**
 * Individual field validation error.
 */
export interface ApiValidationError {
  field: string;
  message: string;
}
