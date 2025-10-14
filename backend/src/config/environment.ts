import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  JWT_SECRET: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  FRONTEND_URL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const config: Config = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '5000', 10),
  MONGODB_URI: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/credit_report_analyzer',
  MONGODB_TEST_URI: process.env['MONGODB_TEST_URI'] || 'mongodb://localhost:27017/credit_report_analyzer_test',
  JWT_SECRET: process.env['JWT_SECRET'] || 'your_super_secure_jwt_secret_key_here',
  MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
  ALLOWED_FILE_TYPES: (process.env['ALLOWED_FILE_TYPES'] || 'application/xml,text/xml').split(','),
  FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar] && !config[envVar as keyof Config]);

if (missingEnvVars.length > 0 && config.NODE_ENV === 'production') {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export { config };