import { AppDataSource } from "@src/data_source";
import { GamesEntity } from "@src/entities/games";
import { isInt, min, max } from "class-validator";
import multer from "multer";
import { BadRequestError, Body, ForbiddenError, JsonController, NotFoundError, Param, Post, QueryParam, Req, Res, Session, UnauthorizedError, UseBefore } from "routing-controllers";
import fs from "fs";
import  { docker } from "@src/docker";
import { Uploader } from "@src/upload";

@JsonController('/api/v1/games/:game_id')
export class UploadServer {
    @Post('/upload_server')
    @UseBefore(Uploader('/res/tmp').single("file"))
    async uploadServer(@Session() session: any, @Param('game_id') game_id: number, @QueryParam('image_name') image_name: string, @Req() req: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(GamesEntity);

        if(!session.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if (!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id.');
        }

        if(session.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to edit this game');
        }

        if(!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const result = await repo.findOne({ where: { game_id } });
        if (!result) {
            throw new NotFoundError('Game not found.');
        }

        // FIXME if dev?
        fs.renameSync(req.file.path, `/res/servers/${req.file.originalname}`);

        // TODO dockerode to load image
        const image = await docker.loadImage(`/res/servers/${req.file.originalname}`);

        // merge
        repo.merge(result, { server_image: image_name });
        await repo.save(result);

        res.statusCode = 200;
        return req.file.path;
    }
}