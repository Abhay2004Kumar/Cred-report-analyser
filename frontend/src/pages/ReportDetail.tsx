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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4 mb-6 lg:mb-0">
          <button
            onClick={() => onBack()}
            className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-700/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Credit Report Details</h1>
            <p className="text-gray-300 text-lg mt-2">Report #{report.reportNumber}</p>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600">
              <Share className="h-4 w-4 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-900/20 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all duration-200 border border-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Basic Details Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-6">
        <div className="flex items-center mb-6">
          <User className="h-6 w-6 text-blue-400 mr-3 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-100">Basic Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <p className="text-lg font-semibold text-gray-900">{report.basicDetails.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Mobile Phone</p>
            <p className="text-lg text-gray-900 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {formatPhoneNumber(report.basicDetails.mobilePhone)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">PAN Number</p>
            <p className="text-lg font-mono text-gray-900">{report.basicDetails.pan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            <p className="text-lg text-gray-900">{formatDate(report.basicDetails.dateOfBirth)}</p>
          </div>
        </div>

        {/* Credit Score Highlight */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Credit Score</p>
              <div className="flex items-center space-x-2">
                <span className={`text-3xl font-bold ${getCreditScoreColor(report.creditScore.score)}`}>
                  {report.creditScore.score || 'N/A'}
                </span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getCreditScoreColor(report.creditScore.score)} bg-opacity-10`}>
                  {getCreditScoreLabel(report.creditScore.score)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Confidence Level</p>
              <p className="text-lg font-semibold text-gray-900">{report.creditScore.confidence || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Report Summary</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{report.reportSummary.accounts.total}</p>
            <p className="text-sm text-gray-600">Total Accounts</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{report.reportSummary.accounts.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">{report.reportSummary.accounts.closed}</p>
            <p className="text-sm text-gray-600">Closed</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{report.reportSummary.accounts.default}</p>
            <p className="text-sm text-gray-600">Default</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg col-span-2">
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(report.reportSummary.outstandingBalance.total)}
            </p>
            <p className="text-sm text-gray-600">Total Outstanding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Outstanding Balances</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Secured:</span>
                <span className="font-medium">{formatCurrency(report.reportSummary.outstandingBalance.secured)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unsecured:</span>
                <span className="font-medium">{formatCurrency(report.reportSummary.outstandingBalance.unsecured)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Credit Enquiries</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last 7 days:</span>
                <span className="font-medium">{report.reportSummary.enquiries.last7Days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 30 days:</span>
                <span className="font-medium">{report.reportSummary.enquiries.last30Days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 90 days:</span>
                <span className="font-medium">{report.reportSummary.enquiries.last90Days}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Report Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(report.reportDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">{report.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processed:</span>
                <span className="font-medium">{formatDate(report.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Accounts Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Credit Accounts Information</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'accounts' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Detailed View
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Credit Cards Summary */}
        {creditCards.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3">Credit Cards Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Credit Cards</p>
                <p className="text-xl font-bold text-purple-600">{creditCards.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Credit Limit</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(creditCards.reduce((sum, card) => sum + card.currentBalance, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.subscriberName}</h3>
                    <p className="text-sm text-gray-600">{account.accountType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountStatusColor(account.accountStatus)}`}>
                    {account.accountStatus}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                  </div>
                  {account.amountPastDue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">Amount Overdue:</span>
                      <span className="font-medium text-red-600">{formatCurrency(account.amountPastDue)}</span>
                    </div>
                  )}
                  {account.creditLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Limit:</span>
                      <span className="font-medium">{formatCurrency(account.creditLimit)}</span>
                    </div>
                  )}
                </div>

                {account.creditLimit && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilization</span>
                      <span className={`font-medium ${getUtilizationColor(calculateAccountUtilization(account.currentBalance, account.creditLimit))}`}>
                        {calculateAccountUtilization(account.currentBalance, account.creditLimit).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          calculateAccountUtilization(account.currentBalance, account.creditLimit) <= 30
                            ? 'bg-green-500'
                            : calculateAccountUtilization(account.currentBalance, account.creditLimit) <= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
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
          <div className="space-y-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{account.subscriberName}</h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Account Number</p>
                          <p className="font-mono font-medium">{account.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Type</p>
                          <p className="font-medium">{account.accountType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Portfolio Type</p>
                          <p className="font-medium">{account.portfolioType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Open Date</p>
                          <p className="font-medium">{formatDate(account.openDate)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Balance</p>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(account.currentBalance)}</p>
                        </div>
                        {account.creditLimit && (
                          <div>
                            <p className="text-gray-600">Credit Limit</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(account.creditLimit)}</p>
                          </div>
                        )}
                      </div>

                      {account.amountPastDue > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-red-600 font-medium">Amount Overdue: {formatCurrency(account.amountPastDue)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address Information
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>{account.address.firstLine}</p>
                      {account.address.secondLine && <p>{account.address.secondLine}</p>}
                      {account.address.thirdLine && <p>{account.address.thirdLine}</p>}
                      <p>{account.address.city}, {account.address.state}</p>
                      <p>{account.address.pinCode}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Recent Activity</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Reported:</span>
                          <span>{formatDate(account.dateReported)}</span>
                        </div>
                        {account.dateClosed && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date Closed:</span>
                            <span>{formatDate(account.dateClosed)}</span>
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
          <div className="space-y-6">
            {creditAccounts.map((account, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {account.subscriberName} - Payment History
                </h3>
                
                {account.accountHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Period</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Days Past Due</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.accountHistory.slice().reverse().map((history, historyIndex) => (
                          <tr key={historyIndex} className="border-b border-gray-100">
                            <td className="py-2 px-3">{history.month}/{history.year}</td>
                            <td className="py-2 px-3">
                              <span className={`font-medium ${history.daysPastDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {history.daysPastDue}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                history.daysPastDue === 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : history.daysPastDue <= 30 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
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
                  <p className="text-gray-500 text-center py-8">No payment history available</p>
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