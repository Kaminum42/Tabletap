// import { AppDataSource } from "@src/data_source";
// import { MessagesEntity } from "@src/entities/messages";
// import { pickProperties } from "@src/utils/pick_properties";
// import { parse } from "@src/utils/sort_parse";
// import { instanceToPlain } from "class-transformer";
// import { isEmpty, isInt, max, min } from "class-validator";
// import { BadRequestError, ForbiddenError, Get, InternalServerError, JsonController, QueryParam, Res, Session, UnauthorizedError } from "routing-controllers";

import { AppDataSource } from "@src/data_source";
import { MessagesEntity } from "@src/entities/messages";
import { UsersEntity } from "@src/entities/users";
import { pickProperties } from "@src/utils/pick_properties";
import { instanceToPlain } from "class-transformer";
import { isInt, min, max, isEmpty } from "class-validator";
import { BadRequestError, ForbiddenError, Get, JsonController, QueryParam, Res, Session, UnauthorizedError } from "routing-controllers";

// @JsonController('/api/v1/messages')
// export class MessagesGetController {
//     @Get()
//     async getMessages(@Session() sess: any, @QueryParam('from_user', { required: false }) fromUser: number, @QueryParam('to_user', { required: false }) toUser: number, @QueryParam('page', { required: false }) page: number, @QueryParam('page_size', { required: false }) pageSize: number, @QueryParam('sort', { required: false }) sort: string, @Res() res: any) {
//         const repo = AppDataSource.getRepository(MessagesEntity);


//         if(!sess.user) {
//             throw new UnauthorizedError('You are not logged in.');
//         }

//         if(isEmpty(fromUser) && isEmpty(toUser)) {
//             throw new BadRequestError('Either from_user or to_user must be specified.');
//         }

//         if(!isEmpty(fromUser) && !isEmpty(toUser) && sess.user.user_id !== fromUser && sess.user.user_id !== toUser && sess.user.permission_level >= 200) {
//             throw new ForbiddenError('You do not have permission to access this user\'s messages.');
//         }

//         if(!isEmpty(fromUser)) {
//             if(!isInt(fromUser) || !min(fromUser, 1) || !max(fromUser, 2147483647)) {
//                 throw new BadRequestError('Invalid from user.');
//             }
//         }

//         if(!isEmpty(toUser)) {
//             if(!isInt(toUser) || !min(toUser, 1) || !max(toUser, 2147483647)) {
//                 throw new BadRequestError('Invalid to user.');
//             }
//         }

//         if(!isEmpty(page)) {
//             if(!isInt(page) || !min(page, 1) || !max(page, 2147483647)) {
//                 throw new BadRequestError('Invalid page.');
//             }
//         }
//         page = page ?? 1;

//         if(!isEmpty(pageSize)) {
//             if(!isInt(pageSize) || !min(pageSize, 1) || !max(pageSize, 999999)) {
//                 throw new BadRequestError('Invalid page size.');
//             }
//         }
//         pageSize = pageSize ?? 10;

//         const sortArr = isEmpty(sort) ? [
//             {
//                 full_field: 'send_time',
//                 field: ['send_time'],
//                 order: 'desc'
//             }
//         ] : parse(sort);


//         const query = repo
//             .createQueryBuilder('message')
//             .skip(pageSize * (page - 1))
//             .take(pageSize);

//         if(fromUser && toUser) {
//             query.where('message.from_user = :from_user AND message.to_user = :to_user', { from_user: fromUser, to_user: toUser });
//         } else if(fromUser) {
//             if(sess.user.user_id === fromUser) {
//                 query.where('message.from_user = :from_user', { from_user: fromUser });
//             } else {
//                 query.where('message.from_user = :from_user AND message.to_user = :to_user', { from_user: fromUser, to_user: sess.user.user_id });
//             }
//         } else if(toUser) {
//             if(sess.user.user_id === toUser) {
//                 query.where('message.to_user = :to_user', { to_user: toUser });
//             } else {
//                 query.where('message.from_user = :from_user AND message.to_user = :to_user', { from_user: sess.user.user_id, to_user: toUser });
//             }
//         }

//         // iterate and take args from sortArr
//         for (const s of sortArr) {
//             const { full_field, field, order } = s;
//             if(field.length > 1) {
//                 throw new InternalServerError('Nested sorting is not supported yet.');
//             }
            
//             query.addOrderBy(full_field, order === 'asc' ? 'ASC' : 'DESC');
//         }

//         const result = await query.getMany();

//         const props = ["message_id", "from_user", "to_user", "content", "send_time", "details"];

//         res.statusCode = 200;
//         const messages = result.map(m => pickProperties(instanceToPlain(m), props));

//         return messages;
//     }
// }

@JsonController('/api/v1/messages')
export class MessagesGetController {
    @Get()
    async getMessages(@Session() sess: any, @QueryParam("user", { required: false }) user: number, @Res() res: any) {
        const userRepo = AppDataSource.getRepository(UsersEntity);
        const messageRepo = AppDataSource.getRepository(MessagesEntity);

        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        if(!isEmpty(user) && (!isInt(user) || !min(user, 1) || !max(user, 2147483647))) {
            throw new BadRequestError('Invalid user id.');
        }
        user = user ?? sess.user.user_id;

        if(sess.user.permission_level >= 200 && sess.user.user_id !== user) {
            throw new ForbiddenError('You do not have permission to view this user\'s messages.');
        }

        // find all messages from or to this user
        const result = await messageRepo
            .createQueryBuilder('message')
            .where('message.from_user = :from_user OR message.to_user = :to_user', { from_user: user, to_user: user })
            .getMany();

        const messages = result.map(m => instanceToPlain(m));

        const map = new Map<number, any[]>();
        messages.forEach(m => {
            const other: number = m.from_user === user ? m.to_user : m.from_user;
            if(!map.has(other)) {
                map.set(other, []);
            }
            map.get(other)!.push(m);
        });

        // sort each list in map by send_time asc
        map.forEach((value, key) => {
            value.sort((a, b) => a.send_time - b.send_time);
        });

        const basicProps = ['user_id', 'username', 'permission_level', 'profile_visibility'];
        const privateProps = ["nickname", "email", "create_time", "update_time", "experience", "level", "icon_url", "gender", "birthday", "phone", "address", "details"];
        
        const arr = [];
        for(const [key, value] of map) {
            
            // search user with user_id = key
            const other = await userRepo
            .createQueryBuilder('user')
            .where('user.user_id = :user_id', { user_id: key })
            .getOne();
            if(!other) {
                continue;
            }

            const props = sess.user.permission_level < 200 || sess.user.user_id == other || other.profile_visibility ? [...basicProps, ...privateProps] : basicProps;

            arr.push({ with: pickProperties(instanceToPlain(other), props), messages: value });
        }

        res.statusCode = 200;
        return arr;
    }
}