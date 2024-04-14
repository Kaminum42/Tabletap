import { AppDataSource } from "@src/data_source";
import { SessionEntity } from "@src/entities/sessions";
import { UsersEntity } from "@src/entities/users";
import { isInt, matches, max, min } from "class-validator";
import { BadRequestError, Body, ForbiddenError, JsonController, NotFoundError, Param, Post, Res, Session, UnauthorizedError } from "routing-controllers";
import { Raw } from "typeorm";

@JsonController('/api/v1/users/:user_id')
export class UsersChangePasswordController {

    @Post('/change_password')
    async changePassword(@Session() sess: any, @Param('user_id') user_id: number, @Body() body: any, @Res() res: any) {
        const sessRepo = AppDataSource.getRepository(SessionEntity);
        const userRepo = AppDataSource.getRepository(UsersEntity);

        if (!isInt(user_id) || !min(user_id, 0) || !max(user_id, 2147483647)) {
            throw new BadRequestError('Invalid user id.');
        }

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.user_id != user_id && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to change this user\'s password.');
        }

        const { original_password, new_password } = body;
        const passwordReg = /^\$2[abxy]{1}\$[1-9]{1}[0-9]{1}\$[A-Za-z0-9./]{53}$/;

        if (sess.user.permission_level >= 200 && !matches(original_password, passwordReg) || !matches(new_password, passwordReg)) {
            throw new BadRequestError('Missing original_password or new_password.');
        }

        const result = await userRepo.findOne({ where: { user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }

        if (sess.user.permission_level >= 200 && result.password !== original_password) {
            throw new BadRequestError('Original password is incorrect.');
        }

        result.password = new_password;
        await userRepo.save(result);

        // potentially race condition between user and sessions
        const sessResult = await sessRepo.find({
            where: {
                json: Raw((alias) => `json(${alias})->'user'->>'user_id' = '${user_id}'`)
            }
        });
        for (const sessToModify of sessResult) {
            let temp = JSON.parse(sessToModify.json);
            temp.user.password = new_password;
            sessToModify.json = JSON.stringify(temp);
            await sessRepo.save(sessToModify);
        }

        res.statusCode = 200;
        return {};
    }
}