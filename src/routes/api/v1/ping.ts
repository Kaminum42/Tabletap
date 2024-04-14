import { JsonController, Get } from 'routing-controllers';

@JsonController('/ping')
export class PingController {
    @Get('/')
    async ping() {
        return 'Pong!';
    }
}