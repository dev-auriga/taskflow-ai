import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter that catches all HttpExceptions
 * and formats them into a consistent error response shape.
 *
 * Response format:
 * {
 *   error: {
 *     statusCode: number,
 *     message: string,
 *     details?: Array<{ field: string; message: string }>
 *   }
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj['message'] as string) || exception.message;
        details = responseObj['details'] as Array<{ field: string; message: string }> | undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error('Unhandled exception:', exception);
    } else {
      console.error('Unknown exception:', exception);
    }

    response.status(statusCode).json({
      error: {
        statusCode,
        message,
        ...(details && { details }),
      },
    });
  }
}
