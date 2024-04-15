// 引入必要库
import fs from 'fs';
import path from 'path';
import https from 'https';
import { useExpressServer } from 'routing-controllers';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import { TypeormStore } from 'connect-typeorm';
import { AppDataSource } from './data_source';
import cors from 'cors';
import multer from 'multer';

const runExpress = (): void => {
    const sslDir = process.env.NODE_ENV === 'prod' ? '/res/ssl' : path.join(__dirname, '../res/ssl');

    const options = {
        key: fs.readFileSync(path.join(sslDir, 'server.key')),
        cert: fs.readFileSync(path.join(sslDir, 'server.crt')),
    };

    const expressServer = express();
    
    const httpsServer = https.createServer(options, expressServer);

    const corsOptions = {
        origin: 'http://localhost:5173',
        credentials: true,
    };

    expressServer.use(cors()); // Enable CORS
    expressServer.use(morgan("dev"));
    // expressServer.use(multer({ dest: '/res/uploads' }).any());

    expressServer.use(session({
        name: 'sessionid',
        secret: 'tabletap',
        resave: false,
        saveUninitialized: false,
        unset: 'destroy',
        cookie: { sameSite: 'none', secure: true }, // Set samesite = None, secure = true for https
        store: new TypeormStore({
            cleanupLimit: 2,
            limitSubquery: false, // If using MariaDB.
            ttl: 86400
        }).connect(AppDataSource.getRepository("sessions"))
    }));

    const controllerGlob = path.join(__dirname, '/routes/**/*.{ts,js}');
    const middlewareGlob = path.join(__dirname, '/middlewares/**/*.{ts,js}');
    const interceptorGlob = path.join(__dirname, '/interceptors/**/*.{ts,js}');

    useExpressServer(expressServer, {
        controllers: [controllerGlob],
        middlewares: [middlewareGlob],
        interceptors: [interceptorGlob],
        defaultErrorHandler: false,
        // routePrefix: '/api/v1'
    });

    if (process.env.NODE_ENV !== 'prod') {
        expressServer.use('/res/static', express.static(path.join(__dirname, '../res/static')));
        expressServer.use('/res/uploads', express.static(path.join(__dirname, '../res/uploads')));
        expressServer.use('/', express.static('../res/front_end'));
    } else {
        expressServer.use('/res/static', express.static('/res/static'));
        expressServer.use('/res/uploads', express.static('/res/uploads'));
        expressServer.use('/', express.static('/res/front_end'));
    }

    httpsServer.listen(3000, (): void => {
        console.log('HTTPS服务器正在监听端口3000');
    });
};


export const runServer = (): void => {
    console.log('Server starting');
    runExpress();
    console.log('Server started');
}