import axios, { type AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface CreditReport {
  id: string;
  reportNumber: string;
  reportDate: string;
  reportTime: string;
  version: string;
  basicDetails: {
    name: string;
    firstName: string;
    lastName: string;
    mobilePhone: string;
    pan: string;
    dateOfBirth: string;
    gender?: string;
  };
  creditScore: {
    score?: number;
    confidence?: string;
  };
  reportSummary: {
    accounts: {
      total: number;
      active: number;
      closed: number;
      default: number;
    };
    outstandingBalance: {
      secured: number;
      unsecured: number;
      total: number;
    };
    enquiries: {
      last7Days: number;
      last30Days: number;
      last90Days: number;
      last180Days: number;
    };
  };
  creditAccounts: Array<{
    subscriberName: string;
    accountNumber: string;
    accountType: string;
    portfolioType: string;
    openDate: string;
    creditLimit?: number;
    highestCredit?: number;
    currentBalance: number;
    amountPastDue: number;
    accountStatus: string;
    paymentRating: string;
    dateReported: string;
    dateClosed?: string;
    address: {
      firstLine: string;
      secondLine?: string;
      thirdLine?: string;
      city: string;
      state: string;
      pinCode: string;
      country: string;
    };
    accountHistory: Array<{
      year: number;
      month: number;
      daysPastDue: number;
      assetClassification?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListItem {
  id: string;
  reportNumber: string;
  reportDate: string;
  name: string;
  pan: string;
  mobilePhone: string;
  creditScore?: number;
  totalAccounts: number;
  totalBalance: number;
  createdAt: string;
}

export interface ReportsListResponse {
  reports: ReportListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SummaryData {
  totalReports: number;
  averageCreditScore: number | null;
  totalActiveAccounts: number;
  totalClosedAccounts: number;
  totalOutstandingBalance: number;
}

// API Functions
export const creditReportApi = {
  // Upload XML file
  uploadXMLFile: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('xmlFile', file);

    const response: AxiosResponse<ApiResponse> = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get all reports
  getAllReports: async (page: number = 1, limit: number = 10): Promise<ApiResponse<ReportsListResponse>> => {
    const response: AxiosResponse<ApiResponse<ReportsListResponse>> = await api.get('/reports', {
      params: { page, limit },
    });

    return response.data;
  },

  // Get report by ID
  getReportById: async (id: string): Promise<ApiResponse<CreditReport>> => {
    const response: AxiosResponse<ApiResponse<CreditReport>> = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Delete report
  deleteReport: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Get summary statistics
  getSummary: async (): Promise<ApiResponse<SummaryData>> => {
    const response: AxiosResponse<ApiResponse<SummaryData>> = await api.get('/summary');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get('/health');
    return response.data;
  },
};

export default api;