import { Request } from "express";
import { Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class PrintRawMiddleware {
    use(request: any, response: any, next: (err?: any) => any) {
        console.log(typeof request);
        console.log(request);
        next();
    }
}