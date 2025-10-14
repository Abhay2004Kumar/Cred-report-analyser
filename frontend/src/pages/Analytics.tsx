import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertTriangle,
  PieChart,
  Activity,
  Target,
  Award,
  FileText,
  Lightbulb,
  Clock
} from 'lucide-react';
import { creditReportApi, type SummaryData, type ReportListItem } from '../services/api';
import { formatCurrency, formatPhoneNumber, getCreditScoreColor, getCreditScoreLabel } from '../lib/utils';
import { Card, CardContent } from '../components/ui/card';

interface AnalyticsData extends SummaryData {
  recentReports: ReportListItem[];
  creditScoreDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  accountTypeDistribution: {
    active: number;
    closed: number;
    defaulted: number;
  };
  trends: {
    reportsGrowth: number;
    averageScoreChange: number;
    balanceChange: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch summary data
      const summaryResponse = await creditReportApi.getSummary();
      
      // Fetch recent reports for additional analytics
      const reportsResponse = await creditReportApi.getAllReports(1, 20);
      
      if (summaryResponse.success && reportsResponse.success && summaryResponse.data) {
        const summary = summaryResponse.data;
        const reports = reportsResponse.data?.reports || [];
        
        // Calculate credit score distribution
        const scoreDistribution = reports.reduce(
          (acc, report) => {
            const score = report.creditScore;
            if (!score) return acc;
            
            if (score >= 750) acc.excellent++;
            else if (score >= 700) acc.good++;
            else if (score >= 650) acc.fair++;
            else acc.poor++;
            
            return acc;
          },
          { excellent: 0, good: 0, fair: 0, poor: 0 }
        );

        // Mock trends data (in a real app, this would come from historical data)
        const trends = {
          reportsGrowth: 12.5,
          averageScoreChange: 8.2,
          balanceChange: -5.3
        };

        setAnalyticsData({
          ...summary,
          recentReports: reports,
          creditScoreDistribution: scoreDistribution,
          accountTypeDistribution: {
            active: summary.totalActiveAccounts,
            closed: summary.totalClosedAccounts,
            defaulted: 0 // This would come from the summary in a real implementation
          },
          trends
        });
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Error Loading Analytics</h2>
        <p className="text-gray-400 mb-6">{error || 'Analytics data not available'}</p>
        <button
          onClick={fetchAnalyticsData}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalScoreReports = Object.values(analyticsData.creditScoreDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="h-8 w-8 text-blue-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Comprehensive insights into credit report data</p>
        </div>
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Reports</p>
                <p className="text-3xl font-bold mt-2">{analyticsData.totalReports}</p>
                <div className="flex items-center mt-3 text-blue-200">
                  <TrendingUp className="h-4 w-4 mr-1 animate-bounce" />
                  <span className="text-sm font-medium">+{analyticsData.trends.reportsGrowth}%</span>
                </div>
              </div>
              <Users className="h-12 w-12 text-blue-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg Credit Score</p>
                <p className="text-3xl font-bold mt-2">{analyticsData.averageCreditScore || 'N/A'}</p>
                <div className="flex items-center mt-3 text-green-200">
                  <TrendingUp className="h-4 w-4 mr-1 animate-bounce" />
                  <span className="text-sm font-medium">+{analyticsData.trends.averageScoreChange}%</span>
                </div>
              </div>
              <Award className="h-12 w-12 text-green-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-pink-700 border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Accounts</p>
                <p className="text-3xl font-bold mt-2">{analyticsData.totalActiveAccounts}</p>
                <div className="flex items-center mt-3 text-purple-200">
                  <Activity className="h-4 w-4 mr-1 animate-pulse" />
                  <span className="text-sm font-medium">Currently active</span>
                </div>
              </div>
              <CreditCard className="h-12 w-12 text-purple-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-red-700 border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Outstanding</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(analyticsData.totalOutstandingBalance)}</p>
                <div className="flex items-center mt-3 text-orange-200">
                  <TrendingDown className="h-4 w-4 mr-1 animate-bounce" />
                  <span className="text-sm font-medium">{analyticsData.trends.balanceChange}%</span>
                </div>
              </div>
              <Target className="h-12 w-12 text-orange-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credit Score Distribution */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <PieChart className="h-6 w-6 text-blue-400 mr-3 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-100">Credit Score Distribution</h2>
            </div>
          
          {totalScoreReports > 0 ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-gray-200 font-medium">Excellent (750+)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-green-400 text-lg">{analyticsData.creditScoreDistribution.excellent}</span>
                    <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded-md">
                      {((analyticsData.creditScoreDistribution.excellent / totalScoreReports) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-gray-200 font-medium">Good (700-749)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-blue-400 text-lg">{analyticsData.creditScoreDistribution.good}</span>
                    <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded-md">
                      {((analyticsData.creditScoreDistribution.good / totalScoreReports) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-gray-200 font-medium">Fair (650-699)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-yellow-400 text-lg">{analyticsData.creditScoreDistribution.fair}</span>
                    <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded-md">
                      {((analyticsData.creditScoreDistribution.fair / totalScoreReports) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-gray-200 font-medium">Poor (&lt;650)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-red-400 text-lg">{analyticsData.creditScoreDistribution.poor}</span>
                    <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded-md">
                      {((analyticsData.creditScoreDistribution.poor / totalScoreReports) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Visual bars */}
              <div className="space-y-3 mt-8">
                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${(analyticsData.creditScoreDistribution.excellent / totalScoreReports) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${(analyticsData.creditScoreDistribution.good / totalScoreReports) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${(analyticsData.creditScoreDistribution.fair / totalScoreReports) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${(analyticsData.creditScoreDistribution.poor / totalScoreReports) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <PieChart className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-lg">No credit score data available</p>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Account Status Overview */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-purple-400 mr-3 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-100">Account Status Overview</h2>
            </div>
          
            <div className="space-y-6">
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-200 font-medium">Active Accounts</span>
                  <span className="font-bold text-green-400 text-lg">{analyticsData.totalActiveAccounts}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ 
                      width: `${analyticsData.totalActiveAccounts > 0 ? 
                        (analyticsData.totalActiveAccounts / (analyticsData.totalActiveAccounts + analyticsData.totalClosedAccounts)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-200 font-medium">Closed Accounts</span>
                  <span className="font-bold text-gray-400 text-lg">{analyticsData.totalClosedAccounts}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ 
                      width: `${analyticsData.totalClosedAccounts > 0 ? 
                        (analyticsData.totalClosedAccounts / (analyticsData.totalActiveAccounts + analyticsData.totalClosedAccounts)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-600/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/20 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-green-400 mb-1">
                      {analyticsData.totalActiveAccounts + analyticsData.totalClosedAccounts}
                    </p>
                    <p className="text-sm text-gray-300">Total Accounts</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-blue-400 mb-1">
                      {analyticsData.totalActiveAccounts > 0 ? 
                        ((analyticsData.totalActiveAccounts / (analyticsData.totalActiveAccounts + analyticsData.totalClosedAccounts)) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-gray-300">Active Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-indigo-400 mr-3 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-100">Recent Credit Reports</h2>
          </div>
        
        {analyticsData.recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="bg-gray-700/30 rounded-lg p-1 border border-gray-600/30">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600/50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Mobile Phone</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">PAN</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Credit Score</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Accounts</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Balance</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-200">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recentReports.slice(0, 10).map((report) => (
                    <tr key={report.id} className="border-b border-gray-600/30 hover:bg-gray-700/30 transition-colors duration-200">
                      <td className="py-4 px-6 font-medium text-gray-100">{report.name}</td>
                      <td className="py-4 px-6 text-gray-300 font-mono">
                        {report.mobilePhone ? formatPhoneNumber(report.mobilePhone) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-mono">{report.pan}</td>
                      <td className="py-4 px-6">
                        {report.creditScore ? (
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getCreditScoreColor(report.creditScore)}`}>
                              {report.creditScore}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCreditScoreColor(report.creditScore)} bg-opacity-20 border border-current border-opacity-30`}>
                              {getCreditScoreLabel(report.creditScore)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-medium">{report.totalAccounts}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400">{formatCurrency(report.totalBalance)}</td>
                      <td className="py-4 px-6 text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg">No recent reports available</p>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border-indigo-700/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-6 w-6 text-yellow-400 mr-3 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-100">Key Insights & Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-gray-100">Credit Health</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {analyticsData.averageCreditScore && analyticsData.averageCreditScore > 700 
                  ? "Overall credit scores are healthy. Continue monitoring payment patterns."
                  : "Focus on improving payment history and reducing utilization ratios."
                }
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="flex items-center mb-3">
                <Activity className="h-5 w-5 text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-gray-100">Account Activity</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {analyticsData.totalActiveAccounts > analyticsData.totalClosedAccounts
                  ? "Active accounts outnumber closed accounts, indicating healthy credit usage."
                  : "Consider diversifying credit portfolio with different account types."
                }
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="flex items-center mb-3">
                <Target className="h-5 w-5 text-purple-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-gray-100">Risk Assessment</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Monitor accounts with high utilization ratios and past due amounts for potential risk factors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;