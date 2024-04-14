import { AppDataSource } from "@src/data_source";
import { RoundsEntity } from "@src/entities/rounds";
import { isInt, max, min } from "class-validator";
import { BadRequestError, Body, Delete, ForbiddenError, JsonController, NotFoundError, Param, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/rounds')
export class RoundsDeleteController {
    @Delete()
    async deleteRound(@Session() sess: any, @Param('round_id') round_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(RoundsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isInt(round_id) || !min(round_id, 0) || !max(round_id, 2147483647)) {
            throw new BadRequestError('Invalid round id.');
        }

        const result = await repo.findOne({ where: { round_id } });
        if (!result) {
            throw new NotFoundError('Round not found.');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to delete this round.');
        }

        await repo.remove(result);
        res.statusCode = 200;
        return {};
    }
}