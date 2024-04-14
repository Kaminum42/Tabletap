import { JsonController, Post, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/users/current')
export class UsersCurrentPingController {
    @Post('/ping')
    async ping(@Session() sess: any, @Res() res: any) {
        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        res.statusCode = 200;
        return { user_id: sess.user.user_id };
    }
}