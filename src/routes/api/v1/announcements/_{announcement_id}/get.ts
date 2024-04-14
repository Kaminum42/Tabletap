import { AppDataSource } from "@src/data_source";
import { AnnouncementsEntity } from "@src/entities/announcements";
import { instanceToPlain } from "class-transformer";
import { isInt, max, min } from "class-validator";
import { BadRequestError, Get, JsonController, NotFoundError, Param, Res } from "routing-controllers";

@JsonController('/api/v1/announcements/:announcement_id')
export class AnnouncementsGetController {
    @Get()
    async getAnnouncement(@Param('announcement_id') announcement_id: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(AnnouncementsEntity);

        if(!isInt(announcement_id) || !min(announcement_id, 0) || !max(announcement_id, 2147483647)) {
            throw new BadRequestError('Invalid announcement id.');
        }

        const result = await repo.findOne({ where: { announcement_id } });
        if (!result) {
            throw new NotFoundError('Announcement not found.');
        }

        res.statusCode = 200;
        return instanceToPlain(result);
    }
}