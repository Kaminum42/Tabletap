import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError, ForbiddenError, HttpError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min, validate } from 'class-validator';
import { Equal, Not, Raw } from 'typeorm';
import { pickProperties } from '@src/utils/pick_properties';
import { SessionEntity } from '@src/entities/sessions';

@JsonController('/api/v1/users/:user_id')
export class UsersPutController {
    @Put()
    async modifyUser(@Session() sess: any, @Param('user_id') user_id: number, @Body() body: any, @Res() res: any) {
        const sessRepo = AppDataSource.getRepository(SessionEntity);
        const userRepo = AppDataSource.getRepository(UsersEntity);

        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.user_id != user_id && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to modify this user.');
        }

        const basicProps = ['nickname', 'email', 'gender', 'birthday', 'phone', 'address', 'profile_visibility', 'details']
        const adminProps = ['permission_level', 'experience', 'level']
        const props = sess?.user?.permission_level < 200 ? [...basicProps, ...adminProps] : basicProps;

        body = pickProperties(body, props);
        let user = plainToInstance(UsersEntity, body);

        const errors = await validate(user, { skipMissingProperties: true });
        if (errors.length > 0) {
            console.log(errors);
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        if(user.email) {
            const emailQuery = await userRepo.findOne({ where: { email: user.email, user_id: Not(Equal(user_id)) } });
            if(emailQuery) {
                throw new HttpError(409, 'Email already exists.');
            }
        }

        let result = await userRepo.findOne({ where: { user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }
        // update user
        user = userRepo.merge(result, plainToInstance(UsersEntity, user));
        // save it to database
        await userRepo.save(plainToInstance(UsersEntity, user));

        // potentially race condition between user and sessions
        const sessResult = await sessRepo.find({
            where: {
                json: Raw((alias) => `json(${alias})->'user'->>'user_id' = '${user_id}'`)
            }
        });
        for (const sessToModify of sessResult) {
            let temp = JSON.parse(sessToModify.json);
            temp.user = user;
            sessToModify.json = JSON.stringify(temp);
            await sessRepo.save(sessToModify);
        }

        res.statusCode = 200;
        return {};
    }
}
