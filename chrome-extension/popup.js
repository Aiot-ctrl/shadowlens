// ShadowLens Popup Script
// Handles the extension popup UI

document.addEventListener('DOMContentLoaded', () => {
    loadScanHistory();
    loadStats();
    setupEventListeners();
});

function loadScanHistory() {
    chrome.storage.local.get(['scanHistory'], (data) => {
        const history = data.scanHistory || [];
        displayScanHistory(history);
    });
}

function loadStats() {
    chrome.storage.local.get(['scanHistory'], (data) => {
        const history = data.scanHistory || [];
        updateStats(history);
    });
}

function updateStats(history) {
    const totalScans = history.length;
    const highRiskSites = history.filter(scan => scan.riskScore >= 7).length;
    
    document.getElementById('total-scans').textContent = totalScans;
    document.getElementById('high-risk').textContent = highRiskSites;
}

function displayScanHistory(history) {
    const scanList = document.getElementById('scan-list');
    
    if (history.length === 0) {
        scanList.innerHTML = `
            <div class="empty-state">
                <p>No scans yet</p>
                <p style="font-size: 11px; opacity: 0.7;">
                    Visit educational websites to start scanning
                </p>
            </div>
        `;
        return;
    }
    
    // Show recent scans (last 5)
    const recentScans = history.slice(-5).reverse();
    
    scanList.innerHTML = recentScans.map(scan => {
        const riskClass = getRiskClass(scan.riskScore);
        const timeAgo = getTimeAgo(scan.timestamp);
        const hostname = new URL(scan.url).hostname;
        
        return `
            <div class="scan-item">
                <div class="scan-url">${hostname}</div>
                <div class="scan-details">
                    <span class="risk-score ${riskClass}">${scan.riskScore}/10</span>
                    <span class="recommendation">${scan.recommendation}</span>
                    <span style="font-size: 10px; opacity: 0.7;">${timeAgo}</span>
                </div>
                ${scan.redFlags && scan.redFlags.length > 0 ? `
                    <div class="red-flags">
                        ${scan.redFlags.slice(0, 2).map(flag => 
                            `<div class="red-flag">${flag}</div>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function getRiskClass(riskScore) {
    if (riskScore >= 7) return 'risk-dangerous';
    if (riskScore >= 4) return 'risk-caution';
    return 'risk-safe';
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const scanTime = new Date(timestamp);
    const diffMs = now - scanTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

function setupEventListeners() {
    // Scan current site button
    document.getElementById('scan-current').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab) {
                chrome.scripting.executeScript({
                    target: { tabId: currentTab.id },
                    function: () => {
                        if (window.shadowLensScanner) {
                            window.shadowLensScanner.scanPage();
                        }
                    }
                });
            }
        });
    });
    
    // Export data button
    document.getElementById('export-data').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'exportData' }, (response) => {
            if (response && response.success) {
                showNotification('Data exported successfully!');
            } else {
                showNotification('Export failed. Please try again.');
            }
        });
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 12px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.scanHistory) {
        const history = changes.scanHistory.newValue || [];
        displayScanHistory(history);
        updateStats(history);
    }
}); 