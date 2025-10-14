import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Download,
  Share,
  Trash2
} from 'lucide-react';
import { creditReportApi, type CreditReport } from '../services/api';
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  getCreditScoreColor,
  getCreditScoreLabel,
  getAccountStatusColor,
  calculateAccountUtilization,
  getUtilizationColor
} from '../lib/utils';

interface ReportDetailPageProps {
  reportId: string;
  onBack: () => void;
}

const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ reportId, onBack }) => {
  const [report, setReport] = useState<CreditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'history'>('overview');

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await creditReportApi.getReportById(reportId);
      
      if (response.success && response.data) {
        setReport(response.data);
      } else {
        setError('Failed to fetch report details');
      }
    } catch (err) {
      setError('Error loading report');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!report || !window.confirm(`Are you sure you want to delete report ${report.reportNumber}?`)) {
      return;
    }

    try {
      const response = await creditReportApi.deleteReport(report.id);
      if (response.success) {
        onBack();
      } else {
        alert('Failed to delete report');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting report');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Credit Report - ${report?.basicDetails.name}`,
        text: `Credit Report #${report?.reportNumber} - Score: ${report?.creditScore.score}`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Report link copied to clipboard!');
      }).catch(() => {
        alert('Sharing not supported on this device');
      });
    }
  };

  const handleExport = () => {
    if (!report) return;
    
    // Create a simple text export
    const exportData = `
Credit Report Details
====================

Report Number: ${report.reportNumber}
Name: ${report.basicDetails.name}
PAN: ${report.basicDetails.pan}
Credit Score: ${report.creditScore.score}
Report Date: ${formatDate(report.reportDate)}

Summary:
- Total Accounts: ${report.reportSummary.accounts.total}
- Active Accounts: ${report.reportSummary.accounts.active}
- Total Outstanding: ${formatCurrency(report.reportSummary.outstandingBalance.total)}

Generated on: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-report-${report.reportNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Error Loading Report</h2>
          <p className="text-gray-400 mb-6">{error || 'Report not found'}</p>
          <button
            onClick={() => onBack()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const creditAccounts = report.creditAccounts || [];
  const creditCards = creditAccounts.filter(account => 
    account.accountType.toLowerCase().includes('credit card') || 
    account.portfolioType === 'Revolving'
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <button
            onClick={() => onBack()}
            className="p-2 sm:p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-700/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
              Credit Report Details
            </h1>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">Report #{report.reportNumber}</p>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 text-sm"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-red-900/20 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all duration-200 border border-red-500/30 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Basic Details Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2 sm:mr-3 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Basic Details</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-400">Full Name</p>
            <p className="text-base sm:text-lg font-semibold text-gray-100 break-words">{report.basicDetails.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-400">Mobile Phone</p>
            <p className="text-base sm:text-lg text-gray-100 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="break-all">{formatPhoneNumber(report.basicDetails.mobilePhone)}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-400">PAN Number</p>
            <p className="text-base sm:text-lg font-mono text-gray-100 break-all">{report.basicDetails.pan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-400">Date of Birth</p>
            <p className="text-base sm:text-lg text-gray-100">{formatDate(report.basicDetails.dateOfBirth)}</p>
          </div>
        </div>

        {/* Credit Score Highlight */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Credit Score</p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <span className={`text-2xl sm:text-3xl font-bold ${getCreditScoreColor(report.creditScore.score)}`}>
                  {report.creditScore.score || 'N/A'}
                </span>
                <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full bg-opacity-20 border border-current border-opacity-30 ${getCreditScoreColor(report.creditScore.score)} w-fit`}>
                  {getCreditScoreLabel(report.creditScore.score)}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">Confidence Level</p>
              <p className="text-base sm:text-lg font-semibold text-gray-100">{report.creditScore.confidence || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Report Summary</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-3 sm:p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <p className="text-lg sm:text-2xl font-bold text-blue-400">{report.reportSummary.accounts.total}</p>
            <p className="text-xs sm:text-sm text-gray-300">Total Accounts</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
            <p className="text-lg sm:text-2xl font-bold text-green-400">{report.reportSummary.accounts.active}</p>
            <p className="text-xs sm:text-sm text-gray-300">Active</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-600/20 border border-gray-500/30 rounded-lg">
            <p className="text-lg sm:text-2xl font-bold text-gray-400">{report.reportSummary.accounts.closed}</p>
            <p className="text-xs sm:text-sm text-gray-300">Closed</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-600/20 border border-red-500/30 rounded-lg">
            <p className="text-lg sm:text-2xl font-bold text-red-400">{report.reportSummary.accounts.default}</p>
            <p className="text-xs sm:text-sm text-gray-300">Default</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg col-span-2 sm:col-span-3 lg:col-span-2">
            <p className="text-base sm:text-xl font-bold text-purple-400 break-all">
              {formatCurrency(report.reportSummary.outstandingBalance.total)}
            </p>
            <p className="text-xs sm:text-sm text-gray-300">Total Outstanding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 border border-gray-600/50 bg-gray-700/30 rounded-lg">
            <h3 className="font-semibold text-gray-100 mb-3">Outstanding Balances</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Secured:</span>
                <span className="font-medium text-gray-100 text-sm">{formatCurrency(report.reportSummary.outstandingBalance.secured)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Unsecured:</span>
                <span className="font-medium text-gray-100 text-sm">{formatCurrency(report.reportSummary.outstandingBalance.unsecured)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-600/50 bg-gray-700/30 rounded-lg">
            <h3 className="font-semibold text-gray-100 mb-3">Credit Enquiries</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 7 days:</span>
                <span className="font-medium text-gray-100">{report.reportSummary.enquiries.last7Days}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 30 days:</span>
                <span className="font-medium text-gray-100">{report.reportSummary.enquiries.last30Days}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 90 days:</span>
                <span className="font-medium text-gray-100">{report.reportSummary.enquiries.last90Days}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-600/50 bg-gray-700/30 rounded-lg">
            <h3 className="font-semibold text-gray-100 mb-3">Report Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Date:</span>
                <span className="font-medium text-gray-100">{formatDate(report.reportDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Version:</span>
                <span className="font-medium text-gray-100">{report.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Processed:</span>
                <span className="font-medium text-gray-100">{formatDate(report.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Accounts Information */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Credit Accounts Information</h2>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 border border-gray-600/50 bg-gray-700/30'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'accounts' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 border border-gray-600/50 bg-gray-700/30'
              }`}
            >
              Detailed View
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'history' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200 border border-gray-600/50 bg-gray-700/30'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Credit Cards Summary */}
        {creditCards.length > 0 && (
          <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
            <h3 className="font-semibold text-gray-100 mb-3">Credit Cards Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Total Credit Cards</p>
                <p className="text-lg sm:text-xl font-bold text-purple-400">{creditCards.length}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Total Credit Limit</p>
                <p className="text-lg sm:text-xl font-bold text-purple-400 break-all">
                  {formatCurrency(creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0))}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Total Outstanding</p>
                <p className="text-lg sm:text-xl font-bold text-purple-400 break-all">
                  {formatCurrency(creditCards.reduce((sum, card) => sum + card.currentBalance, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-600/50 bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-100 break-words">{account.subscriberName}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 break-words">{account.accountType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getAccountStatusColor(account.accountStatus)}`}>
                    {account.accountStatus}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Number:</span>
                    <span className="font-mono text-gray-100 break-all text-right">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="font-medium text-gray-100">{formatCurrency(account.currentBalance)}</span>
                  </div>
                  {account.amountPastDue > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Amount Overdue:</span>
                      <span className="font-medium text-red-400">{formatCurrency(account.amountPastDue)}</span>
                    </div>
                  )}
                  {account.creditLimit && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Credit Limit:</span>
                      <span className="font-medium text-gray-100">{formatCurrency(account.creditLimit)}</span>
                    </div>
                  )}
                </div>

                {account.creditLimit && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-400">Utilization</span>
                      <span className={`font-medium ${getUtilizationColor(calculateAccountUtilization(account.currentBalance, account.creditLimit))}`}>
                        {calculateAccountUtilization(account.currentBalance, account.creditLimit).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          calculateAccountUtilization(account.currentBalance, account.creditLimit) <= 30
                            ? 'bg-green-400'
                            : calculateAccountUtilization(account.currentBalance, account.creditLimit) <= 60
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        }`}
                        style={{
                          width: `${Math.min(calculateAccountUtilization(account.currentBalance, account.creditLimit), 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-4 sm:space-y-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-600/50 bg-gray-700/30 rounded-lg p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-4 break-words">{account.subscriberName}</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-400">Account Number</p>
                          <p className="font-mono font-medium text-gray-100 break-all">{account.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Account Type</p>
                          <p className="font-medium text-gray-100 break-words">{account.accountType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Portfolio Type</p>
                          <p className="font-medium text-gray-100">{account.portfolioType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Open Date</p>
                          <p className="font-medium text-gray-100">{formatDate(account.openDate)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-400">Current Balance</p>
                          <p className="text-base sm:text-lg font-semibold text-gray-100">{formatCurrency(account.currentBalance)}</p>
                        </div>
                        {account.creditLimit && (
                          <div>
                            <p className="text-gray-400">Credit Limit</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-100">{formatCurrency(account.creditLimit)}</p>
                          </div>
                        )}
                      </div>

                      {account.amountPastDue > 0 && (
                        <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-md">
                          <p className="text-red-400 font-medium text-xs sm:text-sm">Amount Overdue: {formatCurrency(account.amountPastDue)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      Address Information
                    </h4>
                    <div className="text-xs sm:text-sm space-y-1 text-gray-300">
                      <p className="break-words">{account.address.firstLine}</p>
                      {account.address.secondLine && <p className="break-words">{account.address.secondLine}</p>}
                      {account.address.thirdLine && <p className="break-words">{account.address.thirdLine}</p>}
                      <p>{account.address.city}, {account.address.state}</p>
                      <p>{account.address.pinCode}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-100 mb-2 text-sm sm:text-base">Recent Activity</h4>
                      <div className="text-xs sm:text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Date Reported:</span>
                          <span className="text-gray-300">{formatDate(account.dateReported)}</span>
                        </div>
                        {account.dateClosed && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Date Closed:</span>
                            <span className="text-gray-300">{formatDate(account.dateClosed)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 sm:space-y-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-600/50 bg-gray-700/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-4 break-words">
                  {account.subscriberName} - Payment History
                </h3>
                
                {account.accountHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-gray-600/50">
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-400">Period</th>
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-400">Days Past Due</th>
                          <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.accountHistory.slice().reverse().map((history, historyIndex) => (
                          <tr key={historyIndex} className="border-b border-gray-600/30">
                            <td className="py-2 px-2 sm:px-3 text-gray-300">{history.month}/{history.year}</td>
                            <td className="py-2 px-2 sm:px-3">
                              <span className={`font-medium ${history.daysPastDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {history.daysPastDue}
                              </span>
                            </td>
                            <td className="py-2 px-2 sm:px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                history.daysPastDue === 0 
                                  ? 'bg-green-600/20 border border-green-500/30 text-green-400' 
                                  : history.daysPastDue <= 30 
                                  ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-400'
                                  : 'bg-red-600/20 border border-red-500/30 text-red-400'
                              }`}>
                                {history.daysPastDue === 0 ? 'On Time' : `${history.daysPastDue} days late`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8 text-sm">No payment history available</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;