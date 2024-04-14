import multer from "multer";
import { Controller, JsonController, Param, Post, Res, Session, UploadedFile, UseBefore } from "routing-controllers";

@Controller('/api/v1/users/:user_id')
export class UsersUploadIconController {
    @Post('/upload_icon')
    @UseBefore(multer({ dest: 'res/uploads' }).single('file'))
    async uploadIcon(@Session() sess: any, @Param('user_id') user_id: number, @UploadedFile('file') file: any, @Res() res: any) {
        return file;
    }
}