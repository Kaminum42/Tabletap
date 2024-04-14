import http from 'http';
import { Middleware, ExpressErrorMiddlewareInterface, HttpError, InternalServerError } from 'routing-controllers';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err: any) => any) {
        // log request most import infos
        console.error(error);

        error = error instanceof HttpError ? error : new InternalServerError('');
        const errorMessage = error.message || http.STATUS_CODES[error.httpCode];

        response.status(error.httpCode);
        response.json({ code: error.httpCode, message: errorMessage, body: {} });
    }
}