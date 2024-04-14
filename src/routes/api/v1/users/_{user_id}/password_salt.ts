import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min } from 'class-validator';

@JsonController('/api/v1/users/:user_id')
export class UsersGetPasswordSaltController {
    @Get('/password_salt')
    async getPasswordSalt(@Param('user_id') user_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);

        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        const result = await repo.findOne({ where: { user_id: user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }

        res.statusCode = 200;
        let password_salt = result.password?.substring(0, 29);
        return { salt: password_salt };
    }
}