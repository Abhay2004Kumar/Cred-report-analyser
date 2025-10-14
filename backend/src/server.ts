import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from './config/environment';
import { database } from './config/database';
import creditReportRoutes from './routes/creditReportRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: [config.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // Compression
    this.app.use(compression());

    // Logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        version: process.env['npm_package_version'] || '1.0.0'
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', creditReportRoutes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Credit Report Analyzer API',
        version: '1.0.0',
        endpoints: {
          upload: 'POST /api/upload',
          reports: 'GET /api/reports',
          report: 'GET /api/reports/:id',
          delete: 'DELETE /api/reports/:id',
          summary: 'GET /api/summary',
          health: 'GET /health'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`📍 Environment: ${config.NODE_ENV}`);
        console.log(`🌐 API URL: http://localhost:${this.port}`);
        console.log(`📊 Health Check: http://localhost:${this.port}/health`);
        
        if (config.NODE_ENV === 'development') {
          console.log(`📝 API Documentation: http://localhost:${this.port}/`);
        }
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

// Start server
const server = new Server();

if (require.main === module) {
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server;