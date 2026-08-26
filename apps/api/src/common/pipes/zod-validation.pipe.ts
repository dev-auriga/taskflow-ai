import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * NestJS pipe that validates request data against a Zod schema.
 *
 * Usage:
 *   @Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProjectInput
 *   @Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQueryParams
 *
 * On validation failure, throws BadRequestException with structured field errors.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const details = this.formatErrors(result.error);
      throw new BadRequestException({
        message: 'Validation failed',
        details,
      });
    }

    return result.data;
  }

  private formatErrors(error: ZodError): Array<{ field: string; message: string }> {
    return error.issues.map((issue) => ({
      field: issue.path.join('.') || 'unknown',
      message: issue.message,
    }));
  }
}
