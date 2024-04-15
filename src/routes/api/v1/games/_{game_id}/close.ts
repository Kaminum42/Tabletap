import { AppDataSource } from "@src/data_source";
import { GamesEntity } from "@src/entities/games";
import { isInt, min, max } from "class-validator";
import { BadRequestError, ForbiddenError, JsonController, NotFoundError, Param, Post, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/games/:game_id')
export class GamesCloseController {

    @Post('/close')
    async close(@Session() sess: any, @Param('game_id') game_id: number, @Res() res: any) {
        const gameRepo = AppDataSource.getRepository(GamesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if(!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to close a game');
        }

        const result = await gameRepo.findOne({ where: { game_id } });
        if(!result) {
            throw new NotFoundError('Game not found');
        }

        gameRepo.merge(result, { on_shelve: false });
        await gameRepo.save(result);

        // TODO stop docker container

        res.statusCode = 202;
        return game_id;
    }
}
