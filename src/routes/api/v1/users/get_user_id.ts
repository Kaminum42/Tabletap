import { JsonController, Post, Body, Res, Session, BadRequestError, NotFoundError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToInstance, classToPlain, instanceToPlain } from 'class-transformer';
import { isEmail, isString, maxLength, minLength } from 'class-validator';

@JsonController('/api/v1/users')
export class UsersGetUserIdController {
    @Post('/get_user_id')
    async getUserId(@Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);
        const { method, username, email } = body;

        if(!isString(method) || ['username', 'email'].includes(method) === false) {
            throw new BadRequestError('Invalid method.');
        }
        if(method === "username") {
            if(!minLength(username, 1) || !maxLength(username, 32)) {
                throw new BadRequestError('Invalid username.');
            }
        } else if(method === "email") {
            if(!maxLength(email, 255) || !isEmail(email)) {
                throw new BadRequestError('Invalid email.');
            }
        }
        
        let query = repo
            .createQueryBuilder('users');

        if (method === 'username') {
            query = query.where('users.username = :username', { username });
        } else if (method === 'email') {
            query = query.where('users.email = :email', { email });
        }

        const result = await query.getOne();
        if (!result) {
            throw new NotFoundError('User not found.');
        }

        res.statusCode = 200;
        return { user_id: result.user_id };
    }
}