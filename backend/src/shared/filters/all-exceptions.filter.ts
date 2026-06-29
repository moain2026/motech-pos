import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error';
import { ProblemDetails, problem } from '../errors/problem-details';

/**
 * Global exception filter — translates every error into an RFC 9457
 * application/problem+json response. Never leaks stack traces or DB
 * internals to the client (STANDARDS/03 §3, 07 §A10).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const traceId =
      (req.headers['x-trace-id'] as string | undefined) ?? randomUUID();

    const body = this.toProblem(exception, req.originalUrl, traceId);

    if (body.status >= 500) {
      this.logger.error(
        { err: exception, traceId, path: req.originalUrl },
        'Unhandled error',
      );
    } else {
      this.logger.warn(
        { traceId, status: body.status, type: body.type },
        body.title,
      );
    }

    res
      .status(body.status)
      .type('application/problem+json')
      .send(body);
  }

  private toProblem(
    exception: unknown,
    instance: string,
    traceId: string,
  ): ProblemDetails {
    if (exception instanceof DomainError) {
      return {
        ...problem(
          exception.typeSlug,
          exception.title,
          exception.httpStatus,
          exception.detail,
          exception.meta,
        ),
        instance,
        traceId,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      const detail =
        typeof resp === 'string'
          ? resp
          : ((resp as Record<string, unknown>).message as string | undefined);
      return {
        ...problem(
          this.slugForStatus(status),
          exception.name.replace(/Exception$/, ''),
          status,
          Array.isArray(detail) ? detail.join('; ') : detail,
        ),
        instance,
        traceId,
      };
    }

    return {
      ...problem('internal-error', 'Internal Server Error', 500),
      instance,
      traceId,
    };
  }

  private slugForStatus(status: number): string {
    const map: Record<number, string> = {
      400: 'bad-request',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'not-found',
      409: 'conflict',
      422: 'unprocessable-entity',
      429: 'too-many-requests',
    };
    return map[status] ?? 'error';
  }
}
