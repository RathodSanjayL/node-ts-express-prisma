import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { createTodoSchema, updateTodoSchema, todoQuerySchema } from '../schemas/todo.schema';

export const getTodos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse and validate query parameters
    const query = todoQuerySchema.parse(req.query);
    const { page, limit, completed, priority, search } = query;
    
    // Build filter conditions
    const where: any = {
      userId: req.user!.id,
    };
    
    if (completed !== undefined) {
      where.completed = completed;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get todos with count
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        include: {
          tags: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.todo.count({ where }),
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data: todos,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const todo = await prisma.todo.findUnique({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        tags: true,
      },
    });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }
    
    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

export const createTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = createTodoSchema.parse(req.body);
    
    // Extract tags if provided
    const { tags } = req.body;
    
    // Create todo
    const todo = await prisma.todo.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
        ...(tags && {
          tags: {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });
    
    return res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = updateTodoSchema.parse(req.body);
    
    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id,
        userId: req.user!.id,
      },
    });
    
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }
    
    // Extract tags if provided
    const { tags } = req.body;
    
    // Update todo
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...validatedData,
        ...(tags && {
          tags: {
            set: [], // Remove existing tags
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });
    
    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id,
        userId: req.user!.id,
      },
    });
    
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }
    
    // Delete todo
    await prisma.todo.delete({
      where: { id },
    });
    
    return res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};