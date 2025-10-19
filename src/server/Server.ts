import express from 'express';
import { router } from './routes';
import 'dotenv/config';

const server = express();

server.use(express.json());
server.use('/api', router);

export { server };