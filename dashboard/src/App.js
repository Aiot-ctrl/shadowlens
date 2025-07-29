import React, { useState, useEffect } from 'react';
import { Shield, Globe, AlertTriangle, BarChart3, Settings, Bell, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import './App.css';

// Dashboard Components
const Overview = ({ stats, recentActivity }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600 mt-1">Security intelligence at a glance</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalScans}</p>
              <p className="text-xs text-gray-500 mt-1">Real-time monitoring</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Safe Sites</p>
              <p className="text-3xl font-bold text-green-600">{stats.safeSites}</p>
              <p className="text-xs text-gray-500 mt-1">Low risk detected</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{stats.highRiskSites}</p>
              <p className="text-xs text-gray-500 mt-1">Threats detected</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRiskScore.toFixed(1)}/10</p>
              <p className="text-xs text-gray-500 mt-1">Based on all scans</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL Valid</span>
              <span className="text-sm font-medium text-gray-900">{stats.sslValid}/{stats.totalScans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Privacy Policy Found</span>
              <span className="text-sm font-medium text-gray-900">{stats.privacyPolicyFound}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Compliance</span>
              <span className="text-sm font-medium text-gray-900">{stats.overallCompliance}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">GDPR</span>
              <span className="text-sm font-medium text-gray-900">{stats.gdprCompliance}/{stats.totalScans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">COPPA</span>
              <span className="text-sm font-medium text-gray-900">{stats.coppaCompliance}/{stats.totalScans}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.site}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.riskScore >= 7 ? 'bg-red-100 text-red-800' :
                    activity.riskScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.riskScore}/10
                  </span>
                  <span className="text-xs text-gray-500">{activity.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Visit educational websites to see real-time scanning</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Monitoring = ({ scanData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time privacy threat monitoring</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Scans</h3>
        <div className="space-y-4">
          {scanData.length > 0 ? (
            scanData.map((scan, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{scan.url}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    scan.riskScore >= 7 ? 'bg-red-100 text-red-800' :
                    scan.riskScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {scan.recommendation}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="ml-2 font-medium">{scan.riskScore}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sensitive Fields:</span>
                    <span className="ml-2 font-medium">{scan.sensitiveFields || 0}</span>
                  </div>
                </div>
                {scan.redFlags && scan.redFlags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Red Flags:</p>
                    <div className="space-y-1">
                      {scan.redFlags.slice(0, 3).map((flag, idx) => (
                        <p key={idx} className="text-xs text-red-600">• {flag}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No active scans</p>
              <p className="text-sm mt-1">The Chrome extension will automatically scan educational websites</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Analytics = ({ stats, scanData }) => {
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
              <BarChart3 className="h-6 w-6 text-yellow-600" />
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
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safe Sites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.safeSites}</p>
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
                  style={{ width: `${Math.max(0, stats.safeSites / Math.max(stats.totalScans, 1) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.safeSites}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Caution (4-6)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(0, (stats.totalScans - stats.safeSites - stats.highRiskSites) / Math.max(stats.totalScans, 1) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.max(0, stats.totalScans - stats.safeSites - stats.highRiskSites)}
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
              <span className="text-sm font-medium text-gray-900">{stats.highRiskSites}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Compliance = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
        <p className="text-gray-600 mt-1">Regulatory compliance monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GDPR Compliance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Processing Consent</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Right to Access</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Portability</span>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Right to Erasure</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">COPPA Compliance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Parental Consent</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Age Verification</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Minimization</span>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Privacy Notice</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Compliance Score</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.overallCompliance}%</div>
          <p className="text-gray-600">Compliant with major regulations</p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    safeSites: 0,
    highRiskSites: 0,
    averageRiskScore: 0,
    sslValid: 0,
    privacyPolicyFound: 0,
    overallCompliance: 0,
    gdprCompliance: 0,
    coppaCompliance: 0
  });
  const [scanData, setScanData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('connecting');

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setBackendStatus('connecting');
      
      // First check if backend is healthy
      const healthResponse = await fetch('http://localhost:5000/health');
      if (!healthResponse.ok) {
        setBackendStatus('error');
        throw new Error('Backend not responding');
      }
      
      setBackendStatus('connected');
      
      // Get real scan data from backend (this would come from the Chrome extension)
      // For now, we'll show empty state until real data comes in
      setStats({
        totalScans: 0,
        safeSites: 0,
        highRiskSites: 0,
        averageRiskScore: 0,
        sslValid: 0,
        privacyPolicyFound: 0,
        overallCompliance: 0,
        gdprCompliance: 0,
        coppaCompliance: 0
      });

      setScanData([]);
      setRecentActivity([]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setBackendStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ShadowLens Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ShadowLens</h1>
                <p className="text-sm text-gray-600">EdTech Security Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-green-500' :
                  backendStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {backendStatus === 'connected' ? 'Backend Connected' :
                   backendStatus === 'connecting' ? 'Connecting...' :
                   'Backend Error'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto-refresh</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'monitoring', label: 'Monitoring' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'compliance', label: 'Compliance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <Overview stats={stats} recentActivity={recentActivity} />}
        {activeTab === 'monitoring' && <Monitoring scanData={scanData} />}
        {activeTab === 'analytics' && <Analytics stats={stats} scanData={scanData} />}
        {activeTab === 'compliance' && <Compliance stats={stats} />}
      </main>
    </div>
  );
}

export default App; 