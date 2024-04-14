import { AppDataSource } from "@src/data_source";
import { UsersEntity } from "@src/entities/users";
import { pickProperties } from "@src/utils/pick_properties";
import { instanceToPlain } from "class-transformer";
import { Get, JsonController, NotFoundError, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/users/current')
export class UsersCurrentGetController {
    @Get()
    async getCurrentUser(@Session() sess: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(UsersEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        const result = await repo.findOne({ where: { user_id: sess.user.user_id } });
        if (!result) {
            throw new NotFoundError('User not found.');
        }

        const props = ["user_id", "username", "permission_level", "profile_visibility", "nickname", "email", "create_time", "update_time", "experience", "level", "icon_url", "gender", "birthday", "phone", "address", "details"];

        const user = pickProperties(instanceToPlain(result), props);

        res.statusCode = 200;
        return user;
    }
}