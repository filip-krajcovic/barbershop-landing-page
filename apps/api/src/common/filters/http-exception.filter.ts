import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  errors?: unknown;
}

/**
 * Jednotný formát chybových odpovedí: `{ statusCode, message, errors? }`.
 * Neočakávané chyby sa zalogujú a klient dostane iba všeobecnú 500.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { statusCode, message: res };
      }
      const { message, errors } = res as { message?: unknown; errors?: unknown };
      return {
        statusCode,
        message: Array.isArray(message)
          ? message.join(', ')
          : typeof message === 'string'
            ? message
            : exception.message,
        ...(errors === undefined ? {} : { errors }),
      };
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Nastala neočakávaná chyba.',
    };
  }
}
