import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isEmpty, isInt, max, maxLength, min, minLength } from 'class-validator';
import { parse } from '@src/utils/sort_parse';
import { pickProperties } from '@src/utils/pick_properties';
import { RoundsEntity } from '@src/entities/rounds';


@JsonController('/api/v1/rounds')
export class RoundsGetController {
    @Get()
    async getRounds(@Session() sess: any, @QueryParam('game', { required: false }) game: number, @QueryParam('user', { required: false }) user: number, @QueryParam('page', { required: false }) page: number,
        @QueryParam('page_size', { required: false }) pageSize: number,
        @QueryParam('sort', { required: false }) sort: string,
        @Res() res: any) {

        const repo = AppDataSource.getRepository(RoundsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isEmpty(game)) {
            if(!isInt(game) || !min(game, 1) || !max(game, 2147483647)) {
                throw new BadRequestError('Invalid game.');
            }
        }

        if((isEmpty(user) || user !== sess.user.user_id) && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to access these rounds.');
        }

        if(!isEmpty(user)) {
            if(!isInt(user) || !min(user, 1) || !max(user, 2147483647)) {
                throw new BadRequestError('Invalid user.');
            }
        }

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
                full_field: 'associated_game',
                field: ['associated_game'],
                order: 'asc'
            }
        ] : parse(sort);

        const query = repo
            .createQueryBuilder('round')
            .skip(pageSize * (page - 1))
            .take(pageSize);
        
        if(game) {
            query.where('round.assciated_game = :game', { game });
        }
        if(user) {
            query.where(':user IN (round.players)', { user });
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

        const rounds = result.map(round => {
            const props = ["round_id", "associated_game", "players", "create_time", "scores", "details"];
            return pickProperties(instanceToPlain(round), props);
        });

        res.statusCode = 200;
        return rounds;
    }
}