import { AppDataSource } from "@src/data_source";
import { MessagesEntity } from "@src/entities/messages";
import { pickProperties } from "@src/utils/pick_properties";
import { instanceToPlain } from "class-transformer";
import { isInt, min, max } from "class-validator";
import { BadRequestError, ForbiddenError, Get, JsonController, NotFoundError, Param, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/messages/:message_id')
export class MessagesGetController {
    @Get()
    async getMessages(@Session() sess: any, @Param('message_id') message_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(MessagesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isInt(message_id) || !min(message_id, 0) || !max(message_id, 2147483647)) {
            throw new BadRequestError('Invalid message id.');
        }

        const result = await repo.findOne({ where: { message_id } });
        if (!result) {
            throw new NotFoundError('Message not found.');
        }

        if(sess.user.permission_level >= 200 && sess.user.user_id !== result.from_user && sess.user.user_id !== result.to_user) {
            throw new ForbiddenError('You do not have permission to view this message.');
        }

        const props = ["message_id", "from_user", "to_user", "content", "send_time", "details"];

        res.statusCode = 200;
        return pickProperties(instanceToPlain(result), props);
    }
}