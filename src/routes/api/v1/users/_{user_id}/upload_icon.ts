import { AppDataSource } from "@src/data_source";
import { SessionEntity } from "@src/entities/sessions";
import { UsersEntity } from "@src/entities/users";
import { Uploader } from "@src/upload";
import { isInt, min, max } from "class-validator";
import multer from "multer";
import { BadRequestError,ForbiddenError, JsonController, NotFoundError, Param, Post, Req, Res, Session, UnauthorizedError,UseBefore } from "routing-controllers";
import { Raw } from "typeorm";

@JsonController('/api/v1/users/:user_id')
export class UsersUploadIconController {
    @Post('/upload_icon')
    @UseBefore(Uploader('/res/uploads').single("file"))
    async uploadIcon(@Session() sess: any, @Param('user_id') user_id: number, @Req() req: any, @Res() res: any) {
        const userRepo = AppDataSource.getRepository(UsersEntity);
        const sessRepo = AppDataSource.getRepository(SessionEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in');
        }

        if(!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id');
        }

        if(sess.user.user_id != user_id && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to upload an icon');
        }

        if(!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const result = await userRepo.findOne({ where: { user_id } });
        if(!result) {
            throw new NotFoundError('User not found');
        }

        userRepo.merge(result, { icon_url: req.file.path });
        await userRepo.save(result);

        // potentially race condition between user and sessions
        const sessResult = await sessRepo.find({
            where: {
                json: Raw((alias) => `json(${alias})->'user'->>'user_id' = '${user_id}'`)
            }
        });

        for (const sessToModify of sessResult) {
            let temp = JSON.parse(sessToModify.json);
            temp.user.icon_url = req.file.path;
            sessToModify.json = JSON.stringify(temp);
            await sessRepo.save(sessToModify);
        }

        res.statusCode = 200;
        return req.file.path;
    }
}