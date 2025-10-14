import { useState } from 'react';
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  currentPage: 'dashboard' | 'upload' | 'reports' | 'analytics';
  onNavigate: (page: 'dashboard' | 'upload' | 'reports' | 'analytics') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and statistics'
    },
    {
      id: 'upload' as const,
      label: 'Upload Report',
      icon: Upload,
      description: 'Upload XML credit reports'
    },
    {
      id: 'reports' as const,
      label: 'All Reports',
      icon: FileText,
      description: 'View all credit reports'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Detailed insights and trends'
    }
  ];

  const handleNavigation = (pageId: 'dashboard' | 'upload' | 'reports' | 'analytics') => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">CreditSea Analyzer</h1>
              </div>
              <div className="ml-10 flex space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Top bar */}
        <div className="bg-white shadow-lg border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">CreditSea Analyzer</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="bg-white shadow-lg border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumb for current page */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-blue-600 font-medium">
              {navigationItems.find(item => item.id === currentPage)?.label}
            </span>
            <span className="ml-2 text-gray-400">
              {navigationItems.find(item => item.id === currentPage)?.description}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;