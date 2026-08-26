import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response envelope structure.
 * All successful API responses are wrapped in this shape.
 */
export interface ApiResponseEnvelope<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

/**
 * Global interceptor that wraps all successful responses
 * in the standard API envelope: { data, meta: { timestamp } }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
