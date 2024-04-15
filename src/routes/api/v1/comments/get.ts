import { AppDataSource } from "@src/data_source";
import { CommentsEntity } from "@src/entities/comments";
import { pickProperties } from "@src/utils/pick_properties";
import { parse } from "@src/utils/sort_parse";
import { instanceToPlain } from "class-transformer";
import { isEmpty, isInt, min, max } from "class-validator";
import { BadRequestError, Get, InternalServerError, JsonController, QueryParam, Res } from "routing-controllers";

@JsonController('/api/v1/comments')
export class CommentsGetController {
    @Get()
    async getComments(@QueryParam('game') game: number, @QueryParam('page', { required: false }) page: number, @QueryParam('page_size', { required: false }) pageSize: number, @QueryParam('sort', { required: false }) sort: string, @Res() res: any) {

        const repo = AppDataSource.getRepository(CommentsEntity);

        if(isEmpty(game) || !isInt(game) || !min(game, 1) || !max(game, 2147483647)) {
            throw new BadRequestError('Invalid game.');
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
                full_field: 'create_time',
                field: ['create_time'],
                order: 'desc'
            }
        ] : parse(sort);


        const query = repo
            .createQueryBuilder('comment')
            .skip(pageSize * (page - 1))
            .take(pageSize);
        
        if(game) {
            query.where('comment.associated_game = :game', { game });
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

        const props = ['comment_id', 'associated_game', 'user', 'create_time', 'content', 'details'];

        const comments = pickProperties(instanceToPlain(result), props);

        res.statusCode = 200;
        return comments;
    }
}