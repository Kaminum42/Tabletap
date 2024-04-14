import { AppDataSource } from "@src/data_source";
import { MessagesEntity } from "@src/entities/messages";
import { isInt, min, max } from "class-validator";
import { BadRequestError, Delete, ForbiddenError, JsonController, NotFoundError, Param, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/messages/:message_id')
export class MessagesDeleteController {
    @Delete()
    async deleteMessage(@Session() sess: any, @Param('message_id') message_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(MessagesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to delete such a message.');
        }

        if(!isInt(message_id) || !min(message_id, 0) || !max(message_id, 2147483647)) {
            throw new BadRequestError('Invalid message id.');
        }

        const result = await repo.findOne({ where: { message_id } });
        if (!result) {
            throw new NotFoundError('Message not found.');
        }

        await repo.remove(result);

        res.statusCode = 200;
        return {};
    }
}