// ShadowLens Background Script
console.log('🔒 ShadowLens: Background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('🔒 ShadowLens: Extension installed');
    
    // Set default badge
    chrome.action.setBadgeText({ text: '🔒' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'updateBadge') {
            updateBadge(request.riskScore);
        sendResponse({ success: true });
    } else if (request.action === 'getAnalysis') {
        // Forward to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
    }
});
        return true; // Keep message channel open for async response
    }
});

function updateBadge(riskScore) {
    let badgeText = '🔒';
    let badgeColor = '#667eea';
    
    if (riskScore >= 8) {
        badgeText = '🔴';
        badgeColor = '#f44336';
    } else if (riskScore >= 6) {
        badgeText = '🟠';
        badgeColor = '#FF9800';
    } else if (riskScore >= 4) {
        badgeText = '🟡';
        badgeColor = '#FFC107';
    } else {
        badgeText = '🟢';
        badgeColor = '#4CAF50';
    }
    
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

// Handle tab updates to trigger analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a supported website
        const supportedPatterns = [
            /.*\.edu.*/,
            /.*\.school.*/,
            /.*\.education.*/,
            /.*khanacademy\.org.*/,
            /.*duolingo\.com.*/,
            /.*coursera\.org.*/,
            /.*edx\.org.*/,
            /.*privacy.*/,
            /.*terms.*/,
            /.*policy.*/
        ];
        
        const isSupported = supportedPatterns.some(pattern => pattern.test(tab.url));
        
        if (isSupported) {
            console.log('🔒 ShadowLens: Supported website detected, ready for analysis');
            // The content script will automatically detect and analyze
        }
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    console.log('🔒 ShadowLens: Extension icon clicked');
    
    // Open popup (this happens automatically with popup.html)
    // But we can also trigger analysis if needed
    if (tab.url) {
        chrome.tabs.sendMessage(tab.id, { action: 'analyzeCurrentPage' });
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        console.log('🔒 ShadowLens: Storage changed:', changes);
        }
}); 