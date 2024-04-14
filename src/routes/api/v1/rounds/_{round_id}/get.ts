import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, ForbiddenError, UnauthorizedError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min } from 'class-validator';
import { pickProperties } from '@src/utils/pick_properties';
import { RoundsEntity } from '@src/entities/rounds';

@JsonController('/api/v1/rounds/:round_id')
export class RoundsGetController {
    @Get()
    async getRound(@Session() sess: any, @Param('round_id') round_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(RoundsEntity);
        
        if (!isInt(round_id) || !min(round_id, 0) || !max(round_id, 2147483647)) {
            throw new BadRequestError('Invalid round id.');
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const result = await repo.findOne({ where: { round_id } });

        if (!result) {
            throw new NotFoundError('Round not found.');
        }
        if(!result.players?.includes(sess.user.user_id) && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to access this round.');
        }
        
        const props = ['round_id', 'associated_game', 'create_time', 'scores', 'details'];
        
        res.statusCode = 200;
        return pickProperties(instanceToPlain(result), props);
    }
}

