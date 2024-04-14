import { JsonController, Param, Body, Get, Post, Put, Delete, HttpCode, NotFoundError, Res, Session, UnauthorizedError } from 'routing-controllers';
import { AppDataSource } from '@src/data_source';
import { TestEntity } from '@entities/test';

@JsonController('/test')
export class TestController {
    @Post('/db_type_test')
    async dbTypeTest(@Res() res: any) {
        // fetch a line from TestEntity
        const testEntities = await AppDataSource.getRepository(TestEntity).find({ order: { id: 'DESC' }, take: 1 });
        const testEntity = testEntities[0]; // This line is now safe because testEntities will never be undefined
        // log type of TestEntity.create_time
        console.log(testEntity.create_time, typeof testEntity.create_time);
        res.statusCode = 200;
        return testEntity.create_time;
    }

    @Post('/db_test_add')
    async dbTestAdd(@Res() res: any) {
        const testEntity = new TestEntity();
        testEntity.create_time = Date.now();
        await AppDataSource.manager.save(testEntity);
        res.statusCode = 200;
        return testEntity;
    }

    @Get('/me')
    async getMe(@Session() sess: any, @Res() res: any) {
        if(!sess.user) {
            throw new UnauthorizedError('You are not logged in.');
        }

        res.statusCode = 200;
        return sess.user;
    }
}
