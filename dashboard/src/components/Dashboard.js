import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Dashboard = ({ scanData, stats, onRefresh, onExport }) => {
  const [selectedScan, setSelectedScan] = useState(null);

  const getRiskColor = (score) => {
    if (score >= 7) return 'text-red-600 bg-red-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskIcon = (score) => {
    if (score >= 7) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (score >= 4) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname.substring(0, 30) + 
             (urlObj.pathname.length > 30 ? '...' : '');
    } catch {
      return url.substring(0, 40) + (url.length > 40 ? '...' : '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ShadowLens Dashboard</h1>
          <p className="text-gray-600 mt-1">Privacy Guardian for EdTech Platforms</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
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
              <CheckCircle className="h-6 w-6 text-green-600" />
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

      {/* Recent Scans */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Scans</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {scanData.slice(0, 10).map((scan, index) => (
            <div 
              key={index}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedScan(scan)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getRiskIcon(scan.riskScore)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {truncateUrl(scan.url)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(scan.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(scan.riskScore)}`}>
                    {scan.riskScore}/10
                  </span>
                  <span className="text-sm text-gray-600">
                    {scan.recommendation}
                  </span>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {scan.redFlags && scan.redFlags.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Red Flags:</p>
                  <div className="flex flex-wrap gap-1">
                    {scan.redFlags.slice(0, 3).map((flag, flagIndex) => (
                      <span 
                        key={flagIndex}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                      >
                        {flag}
                      </span>
                    ))}
                    {scan.redFlags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{scan.redFlags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {scanData.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No scans yet. Visit an EdTech site to start scanning.</p>
          </div>
        )}
      </div>

      {/* Scan Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Scan Details</h3>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                <p className="text-sm text-gray-600 break-all">{selectedScan.url}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
                <p className="text-sm text-gray-600">{selectedScan.summary}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                  <div className="flex items-center space-x-2">
                    {getRiskIcon(selectedScan.riskScore)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedScan.riskScore)}`}>
                      {selectedScan.riskScore}/10 - {selectedScan.recommendation}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Scan Time</h4>
                  <p className="text-sm text-gray-600">{formatDate(selectedScan.timestamp)}</p>
                </div>
              </div>
              
              {selectedScan.redFlags && selectedScan.redFlags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Red Flags</h4>
                  <div className="space-y-1">
                    {selectedScan.redFlags.map((flag, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-700">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedScan.privacy_threats && selectedScan.privacy_threats.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Privacy Threats</h4>
                  <div className="space-y-1">
                    {selectedScan.privacy_threats.map((threat, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {threat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedScan.brand_impersonation && selectedScan.brand_impersonation.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Brand Impersonation</h4>
                  <div className="space-y-1">
                    {selectedScan.brand_impersonation.map((impersonation, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {impersonation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 