import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min } from 'class-validator';
import { pickProperties } from '@src/utils/pick_properties';

@JsonController('/api/v1/users/:user_id')
export class UsersGetController {
    @Get()
    async getUser(@Session() sess: any, @Param('user_id') user_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);
        
        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        const result = await repo.findOne({ where: { user_id: user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }
        const user = instanceToPlain(result);

        const basicProps = ['user_id', 'username', 'permission_level', 'profile_visibility'];
        const privateProps = ["nickname", "email", "create_time", "update_time", "experience", "level", "icon_url", "gender", "birthday", "phone", "address", "details"];
        const props = sess?.user?.permission_level < 200 || sess?.user?.user_id == user.user_id || user.profile_visibility ? [...basicProps, ...privateProps] : basicProps;

        res.statusCode = 200;
        return pickProperties(instanceToPlain(user), props);
    }
}

