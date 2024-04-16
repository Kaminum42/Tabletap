import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError, UnauthorizedError, ForbiddenError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { GamesEntity } from '@src/entities/games';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';
import { isInt, max, min, validate } from 'class-validator';
import { pickProperties } from '@src/utils/pick_properties';

@JsonController('/api/v1/games/:game_id')
export class GamesGetController {
    @Put()
    async putGame(@Session() session: any, @Param('game_id') game_id: number, @Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(GamesEntity);

        if (!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id.');
        }

        if (!session.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(session.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to edit this game.');
        }

        const props = ["game_name", "create_date", "description", "cover_url", "icon_url",  "server_image", "server_config", "client_resources", "client_config", "details"];

        body = pickProperties(body, props);
        let game = plainToInstance(GamesEntity, body);

        const errors = await validate(game, { skipMissingProperties: true });
        if (errors.length > 0) {
            console.log(errors);
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        let result = await repo.findOne({ where: { game_id } });
        if (!result) {
            throw new NotFoundError('Game not found.');
        }

        // update game
        game = repo.merge(result, game);
        // save it to database
        await repo.save(game);
        
        res.statusCode = 200;
        return {};
    }
}

