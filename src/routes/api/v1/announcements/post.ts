import { AppDataSource } from "@src/data_source";
import { AnnouncementsEntity } from "@src/entities/announcements";
import { BadRequestError, Body, ForbiddenError, JsonController, Post, Res, Session, UnauthorizedError } from "routing-controllers";
import { pickProperties } from "@src/utils/pick_properties";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@JsonController('/api/v1/announcements')
export class AnnouncementsPostController {
    @Post()
    async postAnnouncement(@Session() sess: any, @Body() body: any, @Res() res: any) {
        
        const repo = AppDataSource.getRepository(AnnouncementsEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to create such an announcement.');
        }

        const props = ['title', 'content', "details"];

        const announcement = plainToInstance(AnnouncementsEntity, pickProperties(body, props));

        announcement.announcement_id = 0;
        announcement.creator = sess.user.user_id;
        announcement.create_time = Date.now();
        announcement.update_time = Date.now();

        const errors = await validate(announcement);
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints ?? {})[0];
            throw new BadRequestError(message);
        }

        await repo.save(announcement);

        res.statusCode = 200;
        return {};
    }
}