import * as path from 'path';
import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.NODE_ENV === 'prod' ? "postgres" : "localhost",
    port: 5432,
    username: "tabletap",
    password: "tbtp",
    database: "tabletap",
    synchronize: true,
    logging: process.env.NODE_ENV === 'prod' ? false : true,
    entities: [path.join(__dirname, 'entities/**/*.{ts,js}')],
    subscribers: [],
    migrations: []
});