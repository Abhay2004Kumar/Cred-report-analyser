import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FileText, Home, BarChart3, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-100">Credit Report Analyzer</h1>
                <p className="text-sm text-gray-400">CreditSea Assignment - Experian XML Processor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Powered by MERN Stack
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800/50 backdrop-blur-sm shadow-sm min-h-screen border-r border-gray-700/50">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100'
                      )
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-0 bg-transparent">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 Credit Report Analyzer. Built with React, TypeScript, and Tailwind CSS.
            </p>
            <p className="text-sm text-gray-400">
              Backend: Node.js + Express + MongoDB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;