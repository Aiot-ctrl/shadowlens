import React from 'react';
import { Shield, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">ShadowLens</h1>
        </div>
        <p className="mt-2 text-sm text-gray-600">Privacy Guardian</p>
      </div>
      
      <nav className="mt-8">
        <div className="px-6">
          <div className="space-y-2">
            <a
              href="/"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            
            <a
              href="/analytics"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </a>
            
            <a
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </div>
        </div>
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900">Privacy Status</h3>
          <p className="text-xs text-blue-700 mt-1">All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 