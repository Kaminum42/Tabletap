import { AppDataSource } from "@src/data_source";
import { GamesEntity } from "@src/entities/games";
import { isInt, min, max } from "class-validator";
import { BadRequestError, ForbiddenError, JsonController, NotFoundError, Param, Post, Res, Session, UnauthorizedError } from "routing-controllers";
import  { docker } from "@src/docker";

@JsonController('/api/v1/games/:game_id')
export class GamesOpenController {

    @Post('/open')
    async open(@Session() sess: any, @Param('game_id') game_id: number, @Res() res: any) {
        const gameRepo = AppDataSource.getRepository(GamesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if(!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to open a game');
        }

        const result = await gameRepo.findOne({ where: { game_id } });
        if(!result) {
            throw new NotFoundError('Game not found');
        }

        if(result.on_shelve) {
            throw new BadRequestError('Game is already open');
        }

        gameRepo.merge(result, { on_shelve: true });
        await gameRepo.save(result);

        // TODO start docker container with server_config
        // const config = result.server_config;
        // const container = await docker.createContainer({
        //     Image: result.server_image,
        //     name: `game-${game_id}`,
        //     HostConfig: {
        //         Binds: [`${config.save_path}:/server/saves`],
        //         PortBindings: {
        //             [`${config.port}/tcp`]: [{ HostPort: config.host_port.toString() }]
        //         }
        //     },
        //     Env: Object.keys(config.env).map(key => `${key}=${config.env[key]}`),
        //     AttachStdout: true,
        //     AttachStderr: true
        // });
        // await container.start();
        

        res.statusCode = 202;
        return game_id;
    }
}