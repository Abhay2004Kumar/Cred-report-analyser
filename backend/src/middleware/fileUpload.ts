import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

// Get current directory
const currentDir = __dirname;

// Ensure uploads directory exists
const uploadsDir = path.join(currentDir, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `credit-report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for XML files only
const fileFilter = (req: any, file: any, cb: any): void => {
  // Check file extension
  const allowedExtensions = ['.xml'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    cb(new Error('Only XML files are allowed'));
    return;
  }

  // Check MIME type
  if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only XML files are allowed'));
    return;
  }

  cb(null, true);
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 10MB by default
    files: 1 // Only one file at a time
  }
});

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          error: 'File too large',
          message: `File size must be less than ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
        return;
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Only one file is allowed per upload'
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'File must be uploaded in the "xmlFile" field'
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: 'Upload error',
          message: error.message
        });
        return;
    }
  }

  if (error.message) {
    res.status(400).json({
      success: false,
      error: 'Upload validation failed',
      message: error.message
    });
    return;
  }

  next(error);
};

// Cleanup uploaded file helper
export const cleanupFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup file: ${filePath}`, error);
  }
};

// Validate file content middleware
export const validateFileContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload an XML file'
      });
      return;
    }

    // Read file content
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    
    // Basic XML validation
    if (!fileContent.includes('<?xml') && !fileContent.includes('<INProfileResponse>')) {
      cleanupFile(req.file.path);
      res.status(400).json({
        success: false,
        error: 'Invalid XML file',
        message: 'The uploaded file does not appear to be a valid XML credit report'
      });
      return;
    }

    // Check for required XML structure
    const requiredElements = ['INProfileResponse', 'CAIS_Account'];
    const missingElements = requiredElements.filter(element => !fileContent.includes(element));
    
    if (missingElements.length > 0) {
      cleanupFile(req.file.path);
      res.status(400).json({
        success: false,
        error: 'Invalid credit report format',
        message: `Missing required elements: ${missingElements.join(', ')}`
      });
      return;
    }

    // Attach file content to request for processing
    req.body.xmlContent = fileContent;
    next();
  } catch (error) {
    if (req.file) {
      cleanupFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'File validation failed',
      message: 'Unable to validate uploaded file'
    });
  }
};