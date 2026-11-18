import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const code =
      exceptionResponse?.code ||
      (status === 404
        ? 'RESOURCE_NOT_FOUND'
        : status === 403
        ? 'AUTH_FORBIDDEN'
        : status === 401
        ? 'AUTH_UNAUTHORIZED'
        : 'INTERNAL_SERVER_ERROR');

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse?.message || (exception as Error)?.message || 'An unexpected error occurred';

    const details = exceptionResponse?.details || (Array.isArray(exceptionResponse?.message) ? exceptionResponse.message : []);

    const requestId = (request.headers['x-request-id'] as string) || crypto.randomUUID();

    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

