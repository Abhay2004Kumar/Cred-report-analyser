# Credit Report Analyzer - CreditSea Assignment

A full-stack MERN application for processing Experian XML credit reports with comprehensive data extraction and visualization.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd credit-report-analyzer
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup
```bash
# Backend - create .env file in backend folder
cd ../backend
cp .env.example .env
# Update MongoDB connection string and other configurations
```

4. Start the application
```bash
# Terminal 1 - Start backend server
cd backend
npm run dev

# Terminal 2 - Start frontend application
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:5000

## 📁 Project Structure

```
credit-report-analyzer/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── uploads/            # Temporary file uploads
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS/Tailwind styles
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🔧 Features

- **XML File Upload**: Secure upload and validation of Experian XML files
- **Data Extraction**: Comprehensive parsing of credit report data
- **MongoDB Storage**: Structured data persistence with optimized schemas
- **Report Visualization**: Clean, responsive UI for credit report display
- **Error Handling**: Robust validation and error management
- **RESTful API**: Well-designed API endpoints following REST principles

## 📊 Extracted Data

### Basic Details
- Name, Mobile Phone, PAN, Credit Score

### Report Summary
- Total/Active/Closed accounts
- Current balance amounts
- Secured/Unsecured account balances
- Recent credit enquiries

### Credit Accounts
- Credit card information
- Bank details and account numbers
- Outstanding amounts and payment history
- Associated addresses

## 🛠 Technology Stack

### Backend
- **Node.js & Express.js + TypeScript**: Server framework with type safety
- **MongoDB & Mongoose**: Database and ODM with TypeScript support
- **Multer**: Secure file upload handling
- **xml2js**: XML parsing and validation
- **Express Validator**: Input validation and sanitization
- **Jest + Supertest**: Comprehensive testing framework

### Frontend
- **React 18 + TypeScript**: UI framework with type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling with validation
- **React Router**: Client-side routing

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### Endpoints

#### POST /api/upload
Upload and process XML credit report file

#### GET /api/reports
Retrieve all processed credit reports

#### GET /api/reports/:id
Retrieve specific credit report by ID

#### DELETE /api/reports/:id
Delete specific credit report

## 🔒 Security Features

- File type validation
- Input sanitization
- Error handling with appropriate HTTP status codes
- CORS configuration
- Rate limiting (optional)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or configure MongoDB instance
2. Update environment variables
3. Deploy to Heroku, AWS, or preferred platform

### Frontend Deployment
1. Build the React application
2. Deploy to Netlify, Vercel, or preferred platform
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of CreditSea assignment submission.

## 👥 Contact

For questions or support, please reach out to the development team.