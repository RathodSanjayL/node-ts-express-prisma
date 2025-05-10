import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { registerUserSchema, loginUserSchema } from '../schemas/auth.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id: string, email: string) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password, name} = registerUserSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },        
        });

        const token = generateToken(user.id, user.email);

        return res.status(201).json({
            success: true,
            data: {
              user,
              token,
            },
        });
    } catch(err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = loginUserSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
          });

          
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      const token = generateToken(user.id, user.email);

      res.status(200).json({
        success: true,
        data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: user.createdAt,
            },
            token,
          }
        });
        
    } catch(err) {
        next(err);
    }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User is already attached to request from auth middleware
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };