import { AppDataSource } from "@src/data_source";
import { GamesEntity } from "@src/entities/games";
import { isInt, min, max } from "class-validator";
import multer from "multer";
import { BadRequestError, ForbiddenError, JsonController, NotFoundError, Param, Post, Req, Res, Session, UnauthorizedError, UseBefore } from "routing-controllers";

@JsonController('/api/v1/games/:game_id')
export class GamesUploadIconController {
    @Post('/upload_icon')
    @UseBefore(multer({ dest: '/res/uploads' }).single("file"))
    async uploadIcon(@Session() sess: any, @Param('game_id') game_id: number, @Req() req: any, @Res() res: any) {
        const gameRepo = AppDataSource.getRepository(GamesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if(!isInt(game_id) || !min(game_id, 0) || !max(game_id, 2147483647)) {
            throw new BadRequestError('Invalid game id');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to upload an icon');
        }

        if(!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const result = await gameRepo.findOne({ where: { game_id } });
        if(!result) {
            throw new NotFoundError('Game not found');
        }

        gameRepo.merge(result, { icon_url: req.file.path });
        await gameRepo.save(result);

        res.statusCode = 200;
        return req.file.path;
    }
}