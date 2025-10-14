import { useState } from 'react';
import { FileText, Upload, BarChart3, Home, Menu, X, Zap } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import ReportsPage from './pages/Reports';
import AnalyticsPage from './pages/Analytics';
import ReportDetailPage from './pages/ReportDetail';
import { cn } from './lib/utils';
import { Toaster } from 'react-hot-toast';


type Page = 'dashboard' | 'upload' | 'reports' | 'analytics' | 'report-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      id: 'dashboard' as Page, 
      icon: Home,
      description: 'Overview & insights'
    },
    { 
      name: 'Upload Report', 
      id: 'upload' as Page, 
      icon: Upload,
      description: 'Import XML files'
    },
    { 
      name: 'All Reports', 
      id: 'reports' as Page, 
      icon: FileText,
      description: 'Browse credit reports'
    },
    { 
      name: 'Analytics', 
      id: 'analytics' as Page, 
      icon: BarChart3,
      description: 'Advanced insights'
    },
  ];

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setCurrentPage('report-detail');
  };

  const handleBackFromDetail = () => {
    setCurrentPage('reports');
    setSelectedReportId(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigateToUpload={() => setCurrentPage('upload')}
            onNavigateToReports={() => setCurrentPage('reports')} 
            onNavigateToAnalytics={() => setCurrentPage('analytics')}
          />
        );
      case 'upload':
        return <UploadPage onUploadSuccess={() => setCurrentPage('reports')} />;
      case 'reports':
        return <ReportsPage onViewReport={handleViewReport} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'report-detail':
        return selectedReportId ? (
          <ReportDetailPage reportId={selectedReportId} onBack={handleBackFromDetail} />
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8">
              <p className="text-gray-400 mb-4">No report selected</p>
              <button
                onClick={handleBackFromDetail}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Back to Reports
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (currentPage === 'report-detail') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          {renderPage()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Enhanced Header with Glass Effect */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Zap className="h-8 w-8 text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    CreditSea Analyzer
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Experian XML Credit Report Processor
                  </p>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>MERN + TypeScript</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Professional Dark Theme
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Enhanced Sidebar with Dark Theme */}
        <nav className={cn(
          "fixed lg:relative z-40 lg:z-auto w-64 h-full lg:h-auto bg-card/50 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-6 space-y-8">
            {/* Navigation Header */}
            <div className="flex items-center justify-between lg:justify-start">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Navigation Items */}
            <ul className="space-y-2">
              {navigation.map((item, index) => (
                <li key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95',
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary border border-primary/20 shadow-lg'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-md'
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg mr-3 transition-colors",
                      currentPage === item.id
                        ? "bg-primary/10 text-primary"
                        : "group-hover:bg-accent"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                    {currentPage === item.id && (
                      <div className="w-1 h-8 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            {/* Sidebar Footer */}
            <div className="pt-8 border-t border-border/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Credit Reports</div>
                    <div className="text-xs text-muted-foreground">XML Processing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Enhanced Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="animate-fade-in">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © 2025 CreditSea Analyzer. Professional Credit Report Processing.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-xs text-muted-foreground">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>React + TypeScript</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Node.js + MongoDB</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Dark Theme UI</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(31 41 55)',
            color: 'rgb(243 244 246)',
            border: '1px solid rgb(75 85 99)',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: 'rgb(34 197 94)',
              secondary: 'rgb(31 41 55)',
            },
          },
          error: {
            iconTheme: {
              primary: 'rgb(239 68 68)',
              secondary: 'rgb(31 41 55)',
            },
          },
        }}
      />
    </div>
  );
}

export default App
