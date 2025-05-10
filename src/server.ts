import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from './config/db';

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB()
  .then(() => {
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (err) => {
      console.error('UNHANDLED REJECTION:', err);
      // Close server & exit process
      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });