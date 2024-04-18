import path from 'path';
import multer from "multer";

export const Uploader = (destination: string) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
        }
    });
    return multer({ storage });
}