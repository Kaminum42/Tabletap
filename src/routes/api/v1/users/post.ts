import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, HttpError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@entities/users';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { pickProperties } from '@utils/pick_properties';

@JsonController('/api/v1/users')
export class UsersPostController {
    @Post()
    async createUser(@Session() sess: any, @Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);

        body = pickProperties(body, ['username', 'password', 'nickname', 'email', 'gender', 'birthday', 'phone', 'address', 'profile_visibility', 'details']);

        const user = plainToInstance(UsersEntity, body);
        user.user_id = 0;
        user.permission_level = 350;
        user.experience = 0;
        user.level = 0;
        user.create_time = Date.now();
        user.update_time = Date.now();
        user.profile_visibility = user.profile_visibility ?? false;

        const errors = await validate(user, { skipMissingProperties: true });
        if (errors.length > 0) {
            console.log(errors);
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        const usernameQuery = await repo.findOne({ where: { username: user.username } });
        if(usernameQuery) {
            throw new HttpError(409, 'Username already exists');
        }

        if(user.email) {
            const emailQuery = await repo.findOne({ where: { email: user.email } });
            if(emailQuery) {
                throw new HttpError(409, 'Email already exists');
            }
        }

        await repo.save(user);

        const userQuery = await repo.findOne({ where: { username: user.username } });

        if(!userQuery) {
            throw new InternalServerError('Failed to create user');
        }
        
        res.location('/api/v1/users/' + userQuery.user_id);
        if(!sess.user) {
            sess.user = instanceToPlain(userQuery);
        }
        res.statusCode = 201;
        return {};
    }
}

