import { AppDataSource } from "@src/data_source";
import { CommentsEntity } from "@src/entities/comments";
import { pickProperties } from "@src/utils/pick_properties";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError, Body, JsonController, Post, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/comments')
export class CommentsPostController {

    @Post()
    async postComment(@Session() sess: any, @Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(CommentsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const props = ['associated_game', 'content', 'details'];

        const comment = plainToInstance(CommentsEntity, pickProperties(body, props));

        comment.comment_id = 0;
        comment.user = sess.user.user_id;
        comment.create_time = Date.now();

        const errors = await validate(comment);
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        await repo.save(comment);

        res.statusCode = 200;
        return {};
    }
}