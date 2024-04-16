import multer from "multer";
import { BadRequestError, ForbiddenError, JsonController, NotFoundError, Param, Post, QueryParam, Req, Res, Session, UnauthorizedError, UseBefore } from "routing-controllers";
import compressing from "compressing";
import { AppDataSource } from "@src/data_source";
import { GamesEntity } from "@src/entities/games";
import { isInt, min, max } from "class-validator";

@JsonController('/api/v1/games/:game_id')
export class GamesUploadClientController {
    @Post('/upload_client')
    @UseBefore(multer({ dest: '/res/tmp' }).single("file"))
    async uploadClient(@Session() sess: any, @Param('game_id') game_id: number, @QueryParam('entrypoint') entrypoint: string, @Req() req: any, @Res() res: any) {
        const gameRepo = AppDataSource.getRepository(GamesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if(!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id');
        }      

        // TODO check entrypoint path
        console.log(entrypoint);

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to upload a client');
        }

        if(!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const result = await gameRepo.findOne({ where: { game_id } });
        if(!result) {
            throw new NotFoundError('Game not found');
        }

        gameRepo.merge(result, { client_resources: entrypoint });
        await gameRepo.save(result);

        // unzip it to /res/static/
        await compressing.zip.uncompress(req.file.path, "/res/static/");
    }
}