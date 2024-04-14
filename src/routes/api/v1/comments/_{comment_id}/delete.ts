import { AppDataSource } from "@src/data_source";
import { CommentsEntity } from "@src/entities/comments";
import { isInt, min, max } from "class-validator";
import { BadRequestError, Delete, ForbiddenError, JsonController, NotFoundError, Param, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/comments/:comment_id')
export class CommentsDeleteController {
    @Delete()
    async deleteComment(@Session() sess: any, @Param('comment_id') comment_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(CommentsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isInt(comment_id) || !min(comment_id, 0) || !max(comment_id, 2147483647)) {
            throw new BadRequestError('Invalid comment id.');
        }

        const result = await repo.findOne({ where: { comment_id } });
        if (!result) {
            throw new NotFoundError('Comment not found.');
        }

        if(sess.user.permission_level >= 200 && sess.user.user_id !== result.user) {
            throw new ForbiddenError('You do not have permission to delete this comment.');
        }

        await repo.remove(result);

        res.statusCode = 200;
        return {};
    }
}