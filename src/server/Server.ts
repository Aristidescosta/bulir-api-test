import express from 'express';
import { router } from './routes';
import cors from 'cors';
import 'dotenv/config';

const server = express();

server.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
server.use(express.json());
server.use('/api', router);

export { server };