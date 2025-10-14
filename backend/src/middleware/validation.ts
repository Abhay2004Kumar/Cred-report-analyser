import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map(error => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Please check the provided data',
      validationErrors
    });
    return;
  }

  next();
};

export const createValidationRules = (rules: ValidationChain[]): ValidationChain[] => {
  return rules;
};