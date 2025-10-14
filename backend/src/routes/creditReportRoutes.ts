import { Router } from 'express';
import { CreditReportController } from '../controllers/creditReportController';
import { upload, handleUploadError, validateFileContent } from '../middleware/fileUpload';
import { validateRequest } from '../middleware/validation';

const router = Router();
const creditReportController = new CreditReportController();

// Upload and process XML file
router.post(
  '/upload',
  upload.single('xmlFile'),
  handleUploadError,
  validateFileContent,
  creditReportController.uploadAndProcess
);

// Get all credit reports (with pagination)
router.get('/reports', creditReportController.getAllReports);

// Get credit report by ID
router.get('/reports/:id', creditReportController.getReportById);

// Delete credit report by ID
router.delete('/reports/:id', creditReportController.deleteReport);

// Get summary statistics
router.get('/summary', creditReportController.getReportSummary);

export default router;