import { AppDataSource } from "@src/data_source";
import { AnnouncementsEntity } from "@src/entities/announcements";
import { pickProperties } from "@src/utils/pick_properties";
import { plainToInstance } from "class-transformer";
import { isInt, max, min } from "class-validator";

import { BadRequestError, Body, ForbiddenError, JsonController, NotFoundError, Param, Put, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/announcements/:announcement_id')
export class AnnouncementsPutController {
    @Put()
    async putAnnouncement(@Session() sess: any, @Param('announcement_id') announcement_id: number, @Body() body: any, @Res() res: any) {
        const repo = AppDataSource.getRepository(AnnouncementsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to edit such an announcement.');
        }

        if(!isInt(announcement_id) || !min(announcement_id, 0) || !max(announcement_id, 2147483647)) {
            throw new BadRequestError('Invalid announcement id.');
        }

        const props = ['title', 'content', "details"];
        const announcement = plainToInstance(AnnouncementsEntity, pickProperties(body, props));
        
        announcement.announcement_id = announcement_id;
        announcement.update_time = Date.now();

        const result = await repo.findOne({ where: { announcement_id } });
        if (!result) {
            throw new NotFoundError('Announcement not found.');
        }

        // merge from the old announcement
        Object.assign(result, announcement);
        await repo.save(result);

        res.statusCode = 200;
        return {};
    }
}