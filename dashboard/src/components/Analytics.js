import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const Analytics = ({ scanData, stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Privacy threat analysis and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Sites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highRiskSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRiskScore.toFixed(1)}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safe Sites</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalScans - stats.highRiskSites}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Safe (1-3)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(0, (stats.totalScans - stats.highRiskSites) / Math.max(stats.totalScans, 1) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.max(0, stats.totalScans - stats.highRiskSites)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Caution (4-6)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(0, (stats.totalScans - stats.highRiskSites) / Math.max(stats.totalScans, 1) * 50)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.floor(stats.totalScans * 0.3)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Dangerous (7-10)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(0, stats.highRiskSites / Math.max(stats.totalScans, 1) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.highRiskSites}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {scanData.slice(0, 5).map((scan, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {scan.url ? new URL(scan.url).hostname : 'Unknown Site'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(scan.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scan.riskScore >= 7 ? 'bg-red-100 text-red-800' :
                  scan.riskScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {scan.riskScore}/10
                </span>
                <span className="text-xs text-gray-500">
                  {scan.recommendation}
                </span>
              </div>
            </div>
          ))}
          
          {scanData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No scan data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 