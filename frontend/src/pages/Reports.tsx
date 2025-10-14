import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { creditReportApi, type ReportListItem } from '../services/api';
import { formatCurrency, formatDate, formatPhoneNumber, getCreditScoreColor, getCreditScoreLabel } from '../lib/utils';

interface ReportsPageProps {
  onViewReport?: (reportId: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onViewReport }) => {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const reportsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await creditReportApi.getAllReports(currentPage, reportsPerPage);
      
      if (response.success && response.data) {
        setReports(response.data.reports);
        setTotalPages(response.data.pagination.totalPages);
        setTotalReports(response.data.pagination.totalReports);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string, reportNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete report ${reportNumber}?`)) {
      return;
    }

    try {
      setDeleting(reportId);
      const response = await creditReportApi.deleteReport(reportId);
      
      if (response.success) {
        // Remove from local state
        setReports(reports.filter(report => report.id !== reportId));
        setTotalReports(prev => prev - 1);
      } else {
        alert('Failed to delete report: ' + (response.message || response.error));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting report. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      report.name.toLowerCase().includes(term) ||
      report.pan.toLowerCase().includes(term) ||
      report.reportNumber.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="h-8 w-8 text-blue-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Credit Reports
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            {totalReports} processed reports
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, PAN, or report number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3 animate-pulse" />
          <span className="text-red-300 flex-1">{error}</span>
          <button
            onClick={fetchReports}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-12 text-center">
          <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-medium text-gray-100 mb-2">
            {reports.length === 0 ? 'No reports found' : 'No matching reports'}
          </h3>
          <p className="text-gray-400 mb-6">
            {reports.length === 0 
              ? 'Upload your first XML credit report to get started'
              : 'Try adjusting your search terms'
            }
          </p>
          {reports.length === 0 && (
            <button
              onClick={() => window.location.href = '/upload'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Upload Report
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl overflow-hidden">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden space-y-4 p-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-gray-700/30 rounded-lg border border-gray-600/30 p-4 hover:bg-gray-700/50 transition-colors duration-200">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-100 mb-1">
                        {report.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        PAN: {report.pan}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => onViewReport?.(report.id)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id, report.reportNumber)}
                        disabled={deleting === report.id}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Delete Report"
                      >
                        {deleting === report.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-gray-400">Mobile</div>
                      <div className="text-gray-300">
                        {report.mobilePhone ? formatPhoneNumber(report.mobilePhone) : 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Credit Score</div>
                      <div className={`font-bold ${report.creditScore ? getCreditScoreColor(report.creditScore) : 'text-gray-500'}`}>
                        {report.creditScore || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Accounts</div>
                      <div className="text-gray-300">{report.totalAccounts}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Balance</div>
                      <div className="font-bold text-emerald-400 text-xs">
                        {formatCurrency(report.totalBalance)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-600/30">
                    <div className="text-xs text-gray-500 bg-gray-600/30 px-2 py-1 rounded-md">
                      #{report.reportNumber}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(report.reportDate)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Credit Info
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Accounts
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700/30 divide-y divide-gray-600/30">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-100">
                          {report.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          Mobile: {report.mobilePhone ? formatPhoneNumber(report.mobilePhone) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-300 font-mono">
                          PAN: {report.pan}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-600/30 px-2 py-1 rounded-md inline-block">
                          #{report.reportNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div>
                        {report.creditScore ? (
                          <div className="space-y-1">
                            <div className={`text-lg font-bold ${getCreditScoreColor(report.creditScore)}`}>
                              {report.creditScore}
                            </div>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full bg-opacity-20 ${getCreditScoreColor(report.creditScore)} border border-current border-opacity-30`}>
                              {getCreditScoreLabel(report.creditScore)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No Score</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-100">
                          {report.totalAccounts} accounts
                        </div>
                        <div className="text-sm font-bold text-emerald-400">
                          {formatCurrency(report.totalBalance)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-100 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(report.reportDate)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(report.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => onViewReport?.(report.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id, report.reportNumber)}
                          disabled={deleting === report.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Delete Report"
                        >
                          {deleting === report.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center text-sm text-gray-300">
              Showing <span className="font-medium text-blue-400 mx-1">{((currentPage - 1) * reportsPerPage) + 1}</span> to <span className="font-medium text-blue-400 mx-1">{Math.min(currentPage * reportsPerPage, totalReports)}</span> of <span className="font-medium text-blue-400 mx-1">{totalReports}</span> reports
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;