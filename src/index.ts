import 'reflect-metadata';
import { runServer } from './server';
import { runDatabase } from './database';

console.log('App start');
console.log('NODE_ENV: ', process.env.NODE_ENV);

runDatabase();
runServer();
