import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isEmpty, isInt, max, maxLength, min, minLength } from 'class-validator';
import { parse } from '@src/utils/sort_parse';
import { pickProperties } from '@src/utils/pick_properties';
import { GamesEntity } from '@src/entities/games';


@JsonController('/api/v1/games')
export class GamesGetController {
    @Get()
    async getGames(@Session() sess: any, @QueryParam('page', { required: false }) page: number,
        @QueryParam('page_size', { required: false }) pageSize: number,
        @QueryParam('sort', { required: false }) sort: string,
        @QueryParam('keyword', { required: false }) keyword: string,
        @Res() res: any) {
        const repo = AppDataSource.getRepository(GamesEntity);

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
                full_field: 'game_id',
                field: ['game_id'],
                order: 'asc'
            }
        ] : parse(sort);
    
        if(!isEmpty(keyword)) {
            if(!minLength(keyword, 1) || !maxLength(keyword, 32)) {
                throw new BadRequestError('Invalid keyword.');
            }
        }

        // if(!sess.user) {
        //     throw new UnauthorizedError('You are not logged in.');
        // }

        const query = repo
            .createQueryBuilder('game')
            .skip(pageSize * (page - 1))
            .take(pageSize);

        if (keyword) {
            query.where(
                'game.game_name LIKE :keyword OR game.description LIKE :keyword',
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

        const games = result.map(game => {
            const basicProps = ["game_id", "game_name", "on_shelve", "create_date", "description", "cover_url", "icon_url",  "client_resources", "client_config", "details"];
            const adminProps = ["server_image", "server_config"];
            const props = sess?.user?.permission_level < 200 ? [...basicProps, ...adminProps] : basicProps;
            return pickProperties(instanceToPlain(game), props);
        });

        res.statusCode = 200;
        return games;
    }
}