import { AppDataSource } from './data_source';

export const runDatabase = () => {
    console.log('Database starting');
    AppDataSource.initialize()
        .then(() => {
            // here you can start to work with your database
            console.log("Data Source has been initialized!");
        })
        .catch((error) => console.log(error));
}