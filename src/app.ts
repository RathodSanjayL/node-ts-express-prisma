import express, { Express, Request, Response } from "express";
import cors from 'cors';
import helmate from 'helmet';
import todoRoutes from './routes/todo.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express()

app.use(helmate());
app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

export default app;