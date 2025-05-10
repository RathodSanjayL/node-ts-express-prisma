import express, { RequestHandler } from 'express';
import { getTodos, getTodoById, createTodo, updateTodo, deleteTodo } from '../controllers/todo.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes are protected
router.use(authenticate as RequestHandler);

// Routes
router.get('/', getTodos as RequestHandler);
router.get('/:id', getTodoById as RequestHandler);
router.post('/', createTodo as RequestHandler);
router.put('/:id', updateTodo as RequestHandler);
router.delete('/:id', deleteTodo as RequestHandler);

export default router;