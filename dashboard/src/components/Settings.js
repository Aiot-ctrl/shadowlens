import React, { useState } from 'react';
import { Settings, Shield, Download, RefreshCw } from 'lucide-react';

const Settings = ({ onRefresh }) => {
  const [settings, setSettings] = useState({
    autoScan: true,
    showWarnings: true,
    offlineMode: false,
    notifications: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure ShadowLens privacy protection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto Scan</h3>
                <p className="text-xs text-gray-500">Automatically scan EdTech sites</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Show Warnings</h3>
                <p className="text-xs text-gray-500">Display privacy warnings on high-risk sites</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showWarnings}
                  onChange={(e) => handleSettingChange('showWarnings', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Offline Mode</h3>
                <p className="text-xs text-gray-500">Use local AI analysis only</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.offlineMode}
                  onChange={(e) => handleSettingChange('offlineMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">Receive privacy alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Data Collection</h3>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                ShadowLens does not collect or store any personal information. All analysis is performed locally or anonymously.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">Compliance</h3>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Fully compliant with COPPA, FERPA, and GDPR regulations for educational use.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-900">Local Storage</h3>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Scan history is stored locally in your browser and can be deleted at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onRefresh}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>

          <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>

          <button className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Shield className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Version</h3>
            <p className="text-sm text-gray-600">ShadowLens v1.0.0</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">Last Updated</h3>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">AI Model</h3>
            <p className="text-sm text-gray-600">Rule-based Analysis</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900">Status</h3>
            <p className="text-sm text-green-600">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 