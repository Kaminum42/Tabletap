import { AppDataSource } from "@src/data_source";
import { MessagesEntity } from "@src/entities/messages";
import { isEmpty, isInt, max, min } from "class-validator";
import { BadRequestError, ForbiddenError, Get, JsonController, QueryParam, Res, Session, UnauthorizedError } from "routing-controllers";

@JsonController('/api/v1/messages/contacts')
export class MessagesContactsGetController {
    @Get()
    async getContacts(@Session() sess: any, @QueryParam('user', { required: false }) user: number, @Res() res: any) {
        const repo = AppDataSource.getRepository(MessagesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isEmpty(user) && (!isInt(user) || !min(user, 1) || !max(user, 2147483647))) {
            throw new BadRequestError('Invalid user.');
        }

        if(!isEmpty(user) && sess.user.user_id !== user && sess.user.permission_level >= 200) {
            throw new ForbiddenError('You do not have permission to access this user\'s contacts.');
        }
        user = user ?? sess.user.user_id;

        // pick all from_user and to_user pairs relative to the current user
        const result = await repo
            .createQueryBuilder('message')
            .where('message.from_user = :user OR message.to_user = :user', { user })
            .select(['message.from_user', 'message.to_user'])
            .distinct()
            .getRawMany();

        const contacts = result.map(item => {
            return item.from_user === user ? item.to_user : item.from_user;
        });

        res.statusCode = 200;
        return contacts;
    }
}