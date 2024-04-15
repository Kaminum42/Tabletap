import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isEmpty, isInt, max, maxLength, min, minLength } from 'class-validator';
import { parse } from '@src/utils/sort_parse';
import { pickProperties } from '@src/utils/pick_properties';
import { RoundsEntity } from '@src/entities/rounds';
import { AnnouncementsEntity } from '@src/entities/announcements';


@JsonController('/api/v1/announcements')
export class AnnouncementsGetController {
    @Get()
    async getAnnouncements(@QueryParam('page', { required: false }) page: number,
        @QueryParam('page_size', { required: false }) pageSize: number,
        @QueryParam('sort', { required: false }) sort: string,
        @Res() res: any, @QueryParam('keyword', { required: false }) keyword: string) {

        const repo = AppDataSource.getRepository(AnnouncementsEntity);

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
                full_field: 'update_time',
                field: ['update_time'],
                order: 'desc'
            }
        ] : parse(sort);

        
        if(!isEmpty(keyword)) {
            if(!minLength(keyword, 1) || !maxLength(keyword, 32)) {
                throw new BadRequestError('Invalid keyword.');
            }
        }

        const query = repo
            .createQueryBuilder('announcement')
            .skip(pageSize * (page - 1))
            .take(pageSize);

        if (keyword) {
            query.where(
                'announcement.title LIKE :keyword OR announcement.content LIKE :keyword',
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

        const announcements = result.map(announcement => {
            const props = ["announcement_id", "title", "content", "creator", "create_time", "update_time", "details"];
            return pickProperties(instanceToPlain(announcement), props);
        });

        res.statusCode = 200;
        return announcements;
    }
}