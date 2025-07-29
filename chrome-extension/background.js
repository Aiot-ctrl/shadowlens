// ShadowLens Background Service Worker
// Handles extension lifecycle and communication

// Educational domain patterns
const EDUCATIONAL_DOMAINS = [
    '*.edu', '*.school', '*.education', '*.academy', '*.institute',
    '*.university', '*.college', '*.campus', '*.learning', '*.study',
    '*.course', '*.tutorial', '*.training', '*.workshop', '*.seminar'
];

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('🔒 ShadowLens installed');
    
    // Set default settings
    chrome.storage.local.set({
        settings: {
            autoScan: true,
            showWarnings: true,
            offlineMode: false
        },
        scanHistory: [],
        totalScans: 0,
        highRiskSites: 0
    });
    
    // Create context menu
    chrome.contextMenus.create({
        id: 'scan-current-site',
        title: '🔒 Scan with ShadowLens',
        contexts: ['page']
    });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'updateBadge':
            updateBadge(request.riskScore);
            break;
            
        case 'getScanHistory':
            getScanHistory().then(sendResponse);
            return true;
            
        case 'getStats':
            getStats().then(sendResponse);
            return true;
            
        case 'exportData':
            exportScanData().then(sendResponse);
            return true;
            
        case 'scanCurrentSite':
            scanCurrentSite(sender.tab.id);
            break;
    }
});

// Update badge based on risk score
function updateBadge(riskScore) {
    let badgeText = '';
    let badgeColor = '#4CAF50'; // Green for safe
    
    if (riskScore >= 7) {
        badgeText = '🔴';
        badgeColor = '#f44336'; // Red for dangerous
    } else if (riskScore >= 4) {
        badgeText = '🟡';
        badgeColor = '#FF9800'; // Orange for caution
    } else {
        badgeText = '🟢';
        badgeColor = '#4CAF50'; // Green for safe
    }
    
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

// Get scan history
async function getScanHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['scanHistory'], (data) => {
            resolve(data.scanHistory || []);
        });
    });
}

// Get statistics
async function getStats() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['scanHistory', 'totalScans', 'highRiskSites'], (data) => {
            const history = data.scanHistory || [];
            const totalScans = history.length;
            const highRiskSites = history.filter(scan => scan.riskScore >= 7).length;
            const safeSites = history.filter(scan => scan.riskScore <= 3).length;
            const averageRiskScore = totalScans > 0 ? 
                history.reduce((sum, scan) => sum + scan.riskScore, 0) / totalScans : 0;
            
            resolve({
                totalScans: totalScans,
                highRiskSites: highRiskSites,
                safeSites: safeSites,
                averageRiskScore: averageRiskScore
            });
        });
    });
}

// Export scan data
async function exportScanData() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['scanHistory'], (data) => {
            const history = data.scanHistory || [];
            const exportData = {
                exportDate: new Date().toISOString(),
                totalScans: history.length,
                scans: history
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: `shadowlens-scan-data-${new Date().toISOString().split('T')[0]}.json`
            });
            
            resolve({ success: true });
        });
    });
}

// Scan current site manually
function scanCurrentSite(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
            // Trigger a new scan
            if (window.shadowLensScanner) {
                window.shadowLensScanner.scanPage();
            }
        }
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'scan-current-site') {
        scanCurrentSite(tab.id);
    }
});

// Inject content script on educational sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        // Check if it's an educational site
        const isEducational = EDUCATIONAL_DOMAINS.some(pattern => {
            if (pattern.startsWith('*.')) {
                const domain = pattern.substring(2);
                return hostname.endsWith(domain);
            }
            return hostname.includes(pattern);
        });
        
        if (isEducational) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
        }
    }
});

// Periodic cleanup of old scan data
setInterval(() => {
    chrome.storage.local.get(['scanHistory'], (data) => {
        const history = data.scanHistory || [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredHistory = history.filter(scan => {
            const scanDate = new Date(scan.timestamp);
            return scanDate > thirtyDaysAgo;
        });
        
        if (filteredHistory.length !== history.length) {
            chrome.storage.local.set({ scanHistory: filteredHistory });
        }
    });
}, 24 * 60 * 60 * 1000); // Run daily 