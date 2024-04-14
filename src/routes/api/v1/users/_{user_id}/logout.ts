import { AppDataSource } from '@src/data_source';
import { SessionEntity } from '@src/entities/sessions';
import { UsersEntity } from '@src/entities/users';
import { isInt, max, min } from 'class-validator';
import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { Raw } from 'typeorm';
@JsonController('/api/v1/users/:user_id')
export class UsersLogoutController {
    @Post('/logout')
    async logoutUser(@Session() sess: any, @Param('user_id') user_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(SessionEntity);

        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.user_id != user_id && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to logout this user.');
        }

        // destroy all sessions that contains this user
        // which satisfies SessionEntity.json.user.user_id == user_id
        const result = await repo.find({
            where: {
                json: Raw((alias) => `json(${alias})->'user'->>'user_id' = '${user_id}'`)
            }
        });
        // set destroyedAt
        for (const sess of result) {
            sess.destroyedAt = new Date();
            await repo.save(sess);
        }

        // is it needed?
        // if(sess.user.user_id == user_id) {
        //     sess.destroy(() => {});
        // }

        res.statusCode = 200;
        return {};
    }
}
