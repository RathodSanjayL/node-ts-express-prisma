import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  console.error(err);
  
  // Default error status
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = undefined;
  
  // Handle specific error types
  if (err instanceof ZodError) {
    // Validation errors
    statusCode = 400;
    message = 'Validation error';
    errors = err.errors;
  } else if (err instanceof PrismaClientKnownRequestError) {
    // Prisma errors
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Resource already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
  } else if ('statusCode' in err && err.statusCode) {
    // Custom application errors
    statusCode = err.statusCode;
    message = err.message;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};