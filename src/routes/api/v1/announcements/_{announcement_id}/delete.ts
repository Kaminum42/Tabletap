import { AppDataSource } from "@src/data_source";
import { AnnouncementsEntity } from "@src/entities/announcements";
import { isInt, min, max } from "class-validator";
import { BadRequestError, Delete, ForbiddenError, JsonController, NotFoundError, Param, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/announcements/:announcement_id')
export class AnnouncementsDeleteController {
    @Delete()
    async deleteAnnouncement(@Session() sess: any, @Param('announcement_id') announcement_id: number, @Res() res: any) {

        const repo = AppDataSource.getRepository(AnnouncementsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to delete such an announcement.');
        }

        if(!isInt(announcement_id) || !min(announcement_id, 0) || !max(announcement_id, 2147483647)) {
            throw new BadRequestError('Invalid announcement id.');
        }

        const result = await repo.findOne({ where: { announcement_id } });
        if (!result) {
            throw new NotFoundError('Announcement not found.');
        }

        await repo.remove(result);

        res.statusCode = 200;
        return {};
    }
}