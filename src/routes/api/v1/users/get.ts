import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isEmpty, isInt, max, maxLength, min, minLength } from 'class-validator';
import { parse } from '@utils/sort_parse';
import { pickProperties } from '@utils/pick_properties';


@JsonController('/api/v1/users')
export class UsersGetController {
    @Get()
    async getUsers(@Session() sess: any, @QueryParam('page', { required: false }) page: number,
        @QueryParam('page_size', { required: false }) pageSize: number,
        @QueryParam('sort', { required: false }) sort: string,
        @QueryParam('keyword', { required: false }) keyword: string,
        @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);

        if(!isEmpty(page)) {
            if(!isInt(page) || !min(page, 1) || !max(page, 2147483647)) {
                throw new BadRequestError('Invalid page.');
            }
        }
        page = page ?? 1;

        if(!isEmpty(pageSize)) {
            if(!isInt(pageSize) || !min(pageSize, 1) || !max(pageSize, 999999)) {
                throw new BadRequestError('Invalid page size.');
            }
        }
        pageSize = pageSize ?? 10;

        const sortArr = isEmpty(sort) ? [
            {
                full_field: 'user_id',
                field: ['user_id'],
                order: 'asc'
            }
        ] : parse(sort);
    
        if(!isEmpty(keyword)) {
            if(!minLength(keyword, 1) || !maxLength(keyword, 32)) {
                throw new BadRequestError('Invalid keyword.');
            }
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const query = repo
            .createQueryBuilder('user')
            .skip(pageSize * (page - 1))
            .take(pageSize);

        if (keyword) {
            query.where(
                'user.username LIKE :keyword OR user.nickname LIKE :keyword',
                { keyword: `%${keyword}%` }
            );
        }

        // iterate and take args from sortArr
        for (const s of sortArr) {
            const { full_field, field, order } = s;
            if(field.length > 1) {
                throw new InternalServerError('Nested sorting is not supported yet.');
            }
            
            query.addOrderBy(full_field, order === 'desc' ? 'DESC' : 'ASC');
        }

        const result = await query.getMany();

        const users = result.map(user => {
            const basicProps = ['user_id', 'username', 'permission_level', 'profile_visibility'];
            const privateProps = ["nickname", "email", "create_time", "update_time", "experience", "level", "icon_url", "gender", "birthday", "phone", "address", "details"];
            const props = sess.user.permission_level < 200 || sess.user.user_id == user.user_id || user.profile_visibility ? [...basicProps, ...privateProps] : basicProps;
            return pickProperties(instanceToPlain(user), props);
        });
        res.statusCode = 200;
        return users;
    }
}