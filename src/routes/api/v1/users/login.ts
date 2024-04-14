import { JsonController, Post, Body, Res, Session, BadRequestError, NotFoundError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { isEmail, isInt, isString, matches, max, maxLength, min, minLength } from 'class-validator';

@JsonController('/api/v1/users')
export class UsersController {
    @Post('/login')
    async loginUser(@Body() body: any, @Res() res: any, @Session() session: any) {
        const repo = AppDataSource.getRepository(UsersEntity);

        const { method, user_id, username, email, password } = body;

        if (!isString(method) || ['user_id', 'username', 'email'].includes(method) === false) {
            throw new BadRequestError('Invalid method.');
        }
        if (method == "user_id") {
            if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
                throw new BadRequestError('Invalid user id.');
            }
        } else if (method === "username") {
            if (!minLength(username, 1) || !maxLength(username, 32)) {
                throw new BadRequestError('Invalid username.');
            }
        } else if (method === "email") {
            if (!maxLength(email, 255) || !isEmail(email)) {
                throw new BadRequestError('Invalid email.');
            }
        }
        if (!matches(password, /^\$2[abxy]{1}\$[1-9]{1}[0-9]{1}\$[A-Za-z0-9./]{53}$/)) {
            throw new BadRequestError('Invalid password.');
        }

        let query = repo.createQueryBuilder('user');

        if (method === 'user_id') {
            query = query.where('user.user_id = :user_id', { user_id });
        } else if (method === 'username') {
            query = query.where('user.username = :username', { username });
        } else if (method === 'email') {
            query = query.where('user.email = :email', { email });
        }

        const result = await query.getOne();
        if (!result || result.password !== password) {
            throw new NotFoundError('User not found or password incorrect.');
        }

        res.location('/api/v1/users/' + result.user_id);
        session.user = instanceToPlain(result);
        res.statusCode = 200;
        return {};
    }
}

