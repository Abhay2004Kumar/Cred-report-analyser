// Test setup file
process.env['NODE_ENV'] = 'test';
process.env['MONGODB_TEST_URI'] = 'mongodb://localhost:27017/credit_report_analyzer_test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities can be added here