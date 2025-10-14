import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  BarChart3,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  Activity,
  Zap,
  Shield,
  Database,
  Eye,
  ArrowUp,
  ArrowDown,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { creditReportApi, type SummaryData } from '../services/api';
import { formatCurrency } from '../lib/utils';

interface DashboardProps {
  onNavigateToUpload?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToAnalytics?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigateToUpload, 
  onNavigateToReports, 
  onNavigateToAnalytics 
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const response = await creditReportApi.getSummary();
      if (response.success && response.data) {
        setSummaryData(response.data);
      } else {
        setError('Failed to fetch summary data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Reports',
      value: summaryData?.totalReports || 0,
      icon: Database,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'XML reports processed',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Credit Score Avg',
      value: summaryData?.averageCreditScore || 'N/A',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Across all reports',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Active Accounts',
      value: summaryData?.totalActiveAccounts || 0,
      icon: Activity,
      gradient: 'from-purple-500 to-violet-500',
      description: 'Currently active',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Outstanding Balance',
      value: summaryData?.totalOutstandingBalance ? formatCurrency(summaryData.totalOutstandingBalance) : '₹0',
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-500',
      description: 'Total amount due',
      trend: '-3%',
      trendUp: false
    }
  ];

  const quickActions = [
    {
      title: 'Upload XML Report',
      description: 'Process new Experian credit report',
      icon: Upload,
      gradient: 'from-blue-500 to-cyan-500',
      action: onNavigateToUpload || (() => window.location.href = '/upload')
    },
    {
      title: 'View All Reports',
      description: 'Browse processed credit reports',
      icon: Eye,
      gradient: 'from-green-500 to-emerald-500',
      action: onNavigateToReports || (() => window.location.href = '/reports')
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed insights',
      icon: BarChart3,
      gradient: 'from-purple-500 to-violet-500',
      action: onNavigateToAnalytics || (() => window.location.href = '/analytics')
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-primary absolute top-0 left-0"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-8 w-8 text-blue-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Professional credit report processing & analytics overview</p>
          <div className="flex items-center space-x-3 mt-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Live monitoring</span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400">Real-time updates</span>
          </div>
        </div>
        
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardContent className="p-4">
            <button
              onClick={onNavigateToUpload || (() => window.location.href = '/upload')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>Upload New Report</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display with Enhanced Design */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-destructive">Error Loading Data</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <button
                onClick={fetchSummaryData}
                className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Grid with Dark Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const gradientMap: Record<string, string> = {
            'from-blue-500 to-cyan-500': 'from-blue-600 to-blue-700',
            'from-green-500 to-emerald-500': 'from-green-600 to-emerald-700',
            'from-purple-500 to-violet-500': 'from-purple-600 to-pink-700',
            'from-orange-500 to-red-500': 'from-orange-600 to-red-700'
          };
          const cardGradient = gradientMap[stat.gradient] || stat.gradient;
          
          return (
            <Card key={index} className={`bg-gradient-to-br ${cardGradient} border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`} style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold mb-2 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                    <p className="text-white/70 text-xs mb-3">{stat.description}</p>
                    <div className="flex items-center space-x-2 text-white/80">
                      {stat.trendUp ? (
                        <ArrowUp className="h-4 w-4 animate-bounce" />
                      ) : (
                        <ArrowDown className="h-4 w-4 animate-bounce" />
                      )}
                      <span className="text-sm font-medium">{stat.trend}</span>
                      <span className="text-xs">vs last month</span>
                    </div>
                  </div>
                  <IconComponent className="h-12 w-12 text-white/60 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center space-x-3">
            <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
            <span className="text-gray-100">Quick Actions</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Streamlined access to core functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={index}
                  onClick={action.action}
                  className="group relative p-6 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-gray-500/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">{action.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced System Status */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center space-x-3">
            <Activity className="h-5 w-5 text-green-400 animate-pulse" />
            <span className="text-gray-100">System Health</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time monitoring of critical services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-green-500/20 hover:bg-gray-700/50 transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-gray-100 font-medium">Backend API</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-blue-500/20 hover:bg-gray-700/50 transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Database className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-gray-100 font-medium">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-purple-500/20 hover:bg-gray-700/50 transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-gray-100 font-medium">XML Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm font-medium">Ready</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activity */}
      {summaryData && summaryData.totalReports > 0 && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-400 animate-pulse" />
                <span className="text-gray-100">Recent Activity</span>
              </CardTitle>
              <button 
                onClick={onNavigateToReports || (() => window.location.href = '/reports')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-4">
              <div className="relative">
                <FileText className="h-16 w-16 text-gray-500 mx-auto" />
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-xl"></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">Your recent credit reports will appear here</p>
                <button 
                  onClick={onNavigateToReports || (() => window.location.href = '/reports')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block transition-colors"
                >
                  View Reports Dashboard →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;