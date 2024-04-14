import { AppDataSource } from "@src/data_source";
import { CommentsEntity } from "@src/entities/comments";
import { pickProperties } from "@src/utils/pick_properties";
import { instanceToPlain } from "class-transformer";
import { isInt, min, max } from "class-validator";
import { BadRequestError, Get, JsonController, NotFoundError, Param, Res } from "routing-controllers";

@JsonController('/api/v1/comments/:comment_id')
export class CommentsGetController {

    @Get()
    async getComment(@Param('comment_id') comment_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(CommentsEntity);

        if(!isInt(comment_id) || !min(comment_id, 0) || !max(comment_id, 2147483647)) {
            throw new BadRequestError('Invalid comment id.');
        }

        const result = await repo.findOne({ where: { comment_id } });
        if (!result) {
            throw new NotFoundError('Comment not found.');
        }

        const props = ['comment_id', 'associated_game', 'user', 'create_time', 'content', 'details'];
        
        const comment = pickProperties(instanceToPlain(result), props);

        res.statusCode = 200;
        return comment;
    }
}