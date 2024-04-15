import { AppDataSource } from "@src/data_source";
import { RankingsEntity } from "@src/entities/rankings";
import { pickProperties } from "@src/utils/pick_properties";
import { parse } from "@src/utils/sort_parse";
import { instanceToPlain } from "class-transformer";
import { isEmpty, isInt, min, max } from "class-validator";
import { BadRequestError, Get, InternalServerError, JsonController, QueryParam, Res } from "routing-controllers";

@JsonController('/api/v1/rankings')
export class RankingsGetController {

    @Get()
    async getRankings(@QueryParam('game', { required: false }) game: number, @QueryParam('user', { required: false }) user: number, @QueryParam('page', { required: false }) page: number, @QueryParam('page_size', { required: false }) pageSize: number, @QueryParam('sort', { required: false }) sort: string, @Res() res: any) {
        const repo = AppDataSource.getRepository(RankingsEntity);

        if(isEmpty(game) && isEmpty(user)) {
            throw new BadRequestError('Either game or user must be specified.');
        }

        if(!isEmpty(game)) {
            if(!isInt(game) || !min(game, 1) || !max(game, 2147483647)) {
                throw new BadRequestError('Invalid game.');
            }
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
            if(!isInt(pageSize) || !min(pageSize, 1) || !max(pageSize, 50)) {
                throw new BadRequestError('Invalid page size.');
            }
        }
        pageSize = pageSize ?? 10;

        const sortArr = isEmpty(sort) ? [
            {
                full_field: 'update_time',
                field: ['update_time'],
                order: 'desc'
            }
        ] : parse(sort);


        const query = repo
            .createQueryBuilder('ranking')
            .skip(pageSize * (page - 1))
            .take(pageSize);

        if(game) {
            query.where('ranking.game_id = :game', { game });
        }

        if(user) {
            query.andWhere('ranking.user_id = :user', { user });
        }

        // iterate and take args from sortArr
        for (const s of sortArr) {
            const { full_field, field, order } = s;
            if(field.length > 1) {
                throw new InternalServerError('Nested sorting is not supported yet.');
            }
            
            query.addOrderBy(full_field, order === 'asc' ? 'ASC' : 'DESC');
        }

        const result = await query.getMany();

        const props = ['game_id', 'user_id', 'count', 'max_score', 'total_score', 'update_time', 'details'];

        const rankings = result.map(ranking => {
            return pickProperties(instanceToPlain(ranking), props);
        });

        res.statusCode = 200;
        return rankings;
    }
}