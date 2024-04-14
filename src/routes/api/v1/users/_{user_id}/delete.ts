import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, ForbiddenError, UnauthorizedError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min } from 'class-validator';
import { SessionEntity } from '@src/entities/sessions';
import { Raw } from 'typeorm';

@JsonController('/api/v1/users/:user_id')
export class UsersDeleteController {
    @Delete()
    async deleteUser(@Session() sess: any, @Param('user_id') user_id: number, @Res() res: any) {
        const sessRepo = AppDataSource.getRepository(SessionEntity);
        const userRepo = AppDataSource.getRepository(UsersEntity);

        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.user_id != user_id && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to delete this user.');
        }

        const result = await userRepo.findOne({ where: { user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }

        const sessResult = await sessRepo.find({
            where: {
                json: Raw((alias) => `json(${alias})->'user'->>'user_id' = '${user_id}'`)
            }
        });
        // set destroyedAt
        for (const sessToDestroy of sessResult) {
            sessToDestroy.destroyedAt = new Date();
            await sessRepo.save(sessToDestroy);
        }

        sess.destroy(() => {});

        await userRepo.remove(result);
        res.statusCode = 200;
        return {};
    }
}