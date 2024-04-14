import { JsonController, Get, Post, Put, Delete, Body, Param, QueryParam, Res, Session, NotFoundError, BadRequestError, InternalServerError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { UsersEntity } from '@src/entities/users';
import { plainToClass, classToPlain, instanceToPlain, plainToInstance } from 'class-transformer';

@JsonController('/api/v1/users')
export class TestSessionController {
    @Post('/test-session')
    async testSession(@Session() session: any, @Res() res: any) {
        console.log(session);
        res.statusCode = 200;
        return;
    }
}
