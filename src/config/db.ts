import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch(error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
}

// Disconnect from the database
export const disconnectDB = async (): Promise<void> => {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Failed to disconnect from database:', error);
      process.exit(1);
    }
  };