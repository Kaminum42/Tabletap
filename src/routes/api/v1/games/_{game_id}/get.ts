import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { GamesEntity } from '@src/entities/games';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance, instanceToInstance } from 'class-transformer';
import { pickProperties } from '@src/utils/pick_properties';
import { isInt, max, min } from 'class-validator';

@JsonController('/api/v1/games/:game_id')
export class GamesGetController {
    @Get()
    async getGame(@Session() sess: any, @Param('game_id') game_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(GamesEntity);

        if (!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id.');
        }

        const result = await repo.findOne({ where: { game_id } });
        if (!result) {
            throw new NotFoundError('Game not found.');
        }

        const basicProps = ["game_id", "game_name", "on_shelve", "create_date", "description", "cover_url", "icon_url",  "client_resources", "client_config", "details"];
        const adminProps = ["server_image", "server_config"];
        const props = sess?.user?.permission_level < 200 ? [...basicProps, ...adminProps] : basicProps;
        
        res.statusCode = 200;
        return pickProperties(instanceToPlain(result), props);
    }
}

