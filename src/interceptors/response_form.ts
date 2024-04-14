import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';
import http from 'http';

@Interceptor()
export class NameCorrectionInterceptor implements InterceptorInterface {
    intercept(action: Action, result: any) {
        return {
            code: action.response.statusCode,
            message: action.response.statusMessage || http.STATUS_CODES[action.response.statusCode],
            body: result ?? null
        };
    }
}