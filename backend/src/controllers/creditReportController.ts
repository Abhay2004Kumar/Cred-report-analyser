import { Request, Response } from 'express';
import { CreditReport, ICreditReport } from '../models/CreditReport';
import { XMLParser } from '../utils/xmlParser';
import { cleanupFile } from '../middleware/fileUpload';

export class CreditReportController {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser();
  }

  public uploadAndProcess = async (req: Request, res: Response): Promise<void> => {
    let filePath: string | undefined;
    
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please upload an XML file'
        });
        return;
      }

      filePath = req.file.path;
      const xmlContent = req.body.xmlContent;

      if (!xmlContent) {
        res.status(400).json({
          success: false,
          error: 'Invalid file content',
          message: 'Unable to read XML content'
        });
        return;
      }

      // Validate XML structure
      if (!this.xmlParser.validateXMLStructure(xmlContent)) {
        res.status(400).json({
          success: false,
          error: 'Invalid XML structure',
          message: 'The uploaded file is not a valid Experian credit report'
        });
        return;
      }

      // Parse XML data
      const parsedData = await this.xmlParser.parseXML(xmlContent);

      // Check if report already exists
      const existingReport = await CreditReport.findOne({ 
        reportNumber: parsedData.reportNumber 
      });

      if (existingReport) {
        res.status(409).json({
          success: false,
          error: 'Report already exists',
          message: `A credit report with number ${parsedData.reportNumber} already exists`,
          reportId: existingReport._id
        });
        return;
      }

      // Create new credit report
      const creditReport = new CreditReport(parsedData);
      const savedReport = await creditReport.save();

      // Cleanup uploaded file
      if (filePath) {
        cleanupFile(filePath);
      }

      res.status(201).json({
        success: true,
        message: 'Credit report processed and saved successfully',
        data: {
          reportId: savedReport._id,
          reportNumber: savedReport.reportNumber,
          reportDate: savedReport.reportDate,
          basicDetails: {
            name: `${savedReport.basicDetails.firstName} ${savedReport.basicDetails.lastName}`,
            pan: savedReport.basicDetails.pan,
            mobilePhone: savedReport.basicDetails.mobilePhone
          },
          summary: {
            totalAccounts: savedReport.reportSummary.totalAccounts,
            creditScore: savedReport.creditScore,
            totalBalance: savedReport.reportSummary.outstandingBalanceAll
          }
        }
      });

    } catch (error) {
      // Cleanup file in case of error
      if (filePath) {
        cleanupFile(filePath);
      }

      console.error('Error processing credit report:', error);

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: 'Processing failed',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Processing failed',
          message: 'An unexpected error occurred while processing the credit report'
        });
      }
    }
  };

  public getAllReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;

      const reports = await CreditReport.find()
        .select('reportNumber reportDate basicDetails.firstName basicDetails.lastName basicDetails.pan basicDetails.mobilePhone creditScore reportSummary.totalAccounts reportSummary.outstandingBalanceAll createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await CreditReport.countDocuments();

      res.json({
        success: true,
        data: {
          reports: reports.map(report => ({
            id: report._id,
            reportNumber: report.reportNumber,
            reportDate: report.reportDate,
            name: `${report.basicDetails.firstName} ${report.basicDetails.lastName}`,
            pan: report.basicDetails.pan,
            mobilePhone: report.basicDetails.mobilePhone,
            creditScore: report.creditScore,
            totalAccounts: report.reportSummary.totalAccounts,
            totalBalance: report.reportSummary.outstandingBalanceAll,
            createdAt: report.createdAt
          })),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalReports: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching credit reports:', error);
      res.status(500).json({
        success: false,
        error: 'Fetch failed',
        message: 'Unable to retrieve credit reports'
      });
    }
  };

  public getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Please provide a valid report ID'
        });
        return;
      }

      const report = await CreditReport.findById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
          message: 'Credit report not found'
        });
        return;
      }

      res.json({
        success: true,
        data: this.formatReportForResponse(report)
      });

    } catch (error) {
      console.error('Error fetching credit report:', error);
      res.status(500).json({
        success: false,
        error: 'Fetch failed',
        message: 'Unable to retrieve credit report'
      });
    }
  };

  public deleteReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Please provide a valid report ID'
        });
        return;
      }

      const deletedReport = await CreditReport.findByIdAndDelete(id);

      if (!deletedReport) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
          message: 'Credit report not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Credit report deleted successfully',
        data: {
          reportId: deletedReport._id,
          reportNumber: deletedReport.reportNumber
        }
      });

    } catch (error) {
      console.error('Error deleting credit report:', error);
      res.status(500).json({
        success: false,
        error: 'Delete failed',
        message: 'Unable to delete credit report'
      });
    }
  };

  public getReportSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalReports = await CreditReport.countDocuments();
      const averageScore = await CreditReport.aggregate([
        { $match: { creditScore: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: '$creditScore' } } }
      ]);

      const accountsSummary = await CreditReport.aggregate([
        {
          $group: {
            _id: null,
            totalActiveAccounts: { $sum: '$reportSummary.activeAccounts' },
            totalClosedAccounts: { $sum: '$reportSummary.closedAccounts' },
            totalOutstandingBalance: { $sum: '$reportSummary.outstandingBalanceAll' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalReports,
          averageCreditScore: averageScore[0]?.avgScore ? Math.round(averageScore[0].avgScore) : null,
          totalActiveAccounts: accountsSummary[0]?.totalActiveAccounts || 0,
          totalClosedAccounts: accountsSummary[0]?.totalClosedAccounts || 0,
          totalOutstandingBalance: accountsSummary[0]?.totalOutstandingBalance || 0
        }
      });

    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({
        success: false,
        error: 'Summary fetch failed',
        message: 'Unable to retrieve summary data'
      });
    }
  };

  private formatReportForResponse(report: ICreditReport): any {
    return {
      id: report._id,
      reportNumber: report.reportNumber,
      reportDate: report.reportDate,
      reportTime: report.reportTime,
      version: report.version,
      basicDetails: {
        name: `${report.basicDetails.firstName} ${report.basicDetails.lastName}`,
        firstName: report.basicDetails.firstName,
        lastName: report.basicDetails.lastName,
        mobilePhone: report.basicDetails.mobilePhone,
        pan: report.basicDetails.pan,
        dateOfBirth: report.basicDetails.dateOfBirth,
        gender: report.basicDetails.gender
      },
      creditScore: {
        score: report.creditScore,
        confidence: report.creditScoreConfidence
      },
      reportSummary: {
        accounts: {
          total: report.reportSummary.totalAccounts,
          active: report.reportSummary.activeAccounts,
          closed: report.reportSummary.closedAccounts,
          default: report.reportSummary.defaultAccounts
        },
        outstandingBalance: {
          secured: report.reportSummary.outstandingBalanceSecured,
          unsecured: report.reportSummary.outstandingBalanceUnsecured,
          total: report.reportSummary.outstandingBalanceAll
        },
        enquiries: {
          last7Days: report.reportSummary.enquiriesLast7Days,
          last30Days: report.reportSummary.enquiriesLast30Days,
          last90Days: report.reportSummary.enquiriesLast90Days,
          last180Days: report.reportSummary.enquiriesLast180Days
        }
      },
      creditAccounts: report.creditAccounts.map(account => ({
        subscriberName: account.subscriberName,
        accountNumber: account.accountNumber,
        accountType: this.getAccountTypeDescription(account.accountType),
        portfolioType: this.getPortfolioTypeDescription(account.portfolioType),
        openDate: account.openDate,
        creditLimit: account.creditLimit,
        highestCredit: account.highestCredit,
        currentBalance: account.currentBalance,
        amountPastDue: account.amountPastDue,
        accountStatus: this.getAccountStatusDescription(account.accountStatus),
        paymentRating: account.paymentRating,
        dateReported: account.dateReported,
        dateClosed: account.dateClosed,
        address: account.address,
        accountHistory: account.accountHistory.slice(-12) // Last 12 months
      })),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };
  }

  private getAccountTypeDescription(type: string): string {
    const typeMap: { [key: string]: string } = {
      '10': 'Credit Card',
      '51': 'Personal Loan',
      '52': 'Home Loan',
      '53': 'Auto Loan',
      '54': 'Business Loan'
    };
    return typeMap[type] || `Account Type ${type}`;
  }

  private getPortfolioTypeDescription(type: string): string {
    const typeMap: { [key: string]: string } = {
      'R': 'Revolving',
      'I': 'Installment',
      'O': 'Open'
    };
    return typeMap[type] || type;
  }

  private getAccountStatusDescription(status: string): string {
    const statusMap: { [key: string]: string } = {
      '11': 'Active',
      '13': 'Closed',
      '53': 'Written Off',
      '71': 'Settled'
    };
    return statusMap[status] || `Status ${status}`;
  }
}