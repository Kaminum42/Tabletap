import { AppDataSource } from "@src/data_source";
import { MessagesEntity } from "@src/entities/messages";
import { pickProperties } from "@src/utils/pick_properties";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError, Body, JsonController, Post, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/messages')
export class MessagesPostController {
    @Post()
    async postMessage(@Session() sess: any, @Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(MessagesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const props = ['to_user', 'content', 'details'];

        const message = plainToInstance(MessagesEntity, pickProperties(body, props));

        message.message_id = 0;
        message.from_user = sess.user.user_id;
        message.send_time = Date.now();

        const errors = await validate(message);
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        await repo.save(message);

        res.statusCode = 200;
        return {};
    }
}