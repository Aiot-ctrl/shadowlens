// ShadowLens Background Script
console.log('🔒 ShadowLens: Background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    try {
        console.log('🔒 ShadowLens: Extension installed');
        
        // Set default badge
        chrome.action.setBadgeText({ text: '🔒' }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error setting default badge text:', chrome.runtime.lastError);
            }
        });
        
        chrome.action.setBadgeBackgroundColor({ color: '#667eea' }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error setting default badge color:', chrome.runtime.lastError);
            }
        });
    } catch (error) {
        console.error('Error in installation handler:', error);
    }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        console.log('Background received message:', request);
        
        if (request.action === 'updateBadge') {
            updateBadge(request.riskScore);
            sendResponse({ success: true });
            return true; // Keep message channel open
        } else if (request.action === 'getAnalysis') {
            // Forward to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error forwarding message:', chrome.runtime.lastError);
                            sendResponse({ error: 'Content script not available' });
                        } else {
                            sendResponse(response);
                        }
                    });
                } else {
                    sendResponse({ error: 'No active tab found' });
                }
            });
            return true; // Keep message channel open
        }
    } catch (error) {
        console.error('Error in background message listener:', error);
        sendResponse({ error: error.message });
        return true; // Keep message channel open
    }
});

function updateBadge(riskScore) {
    try {
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
        
        chrome.action.setBadgeText({ text: badgeText }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error setting badge text:', chrome.runtime.lastError);
            }
        });
        
        chrome.action.setBadgeBackgroundColor({ color: badgeColor }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error setting badge color:', chrome.runtime.lastError);
            }
        });
    } catch (error) {
        console.error('Error in updateBadge:', error);
    }
}

// Handle tab updates to trigger analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
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
    } catch (error) {
        console.error('Error in tab update listener:', error);
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    try {
        console.log('🔒 ShadowLens: Extension icon clicked');
        
        // Open popup (this happens automatically with popup.html)
        // But we can also trigger analysis if needed
        if (tab.url) {
            chrome.tabs.sendMessage(tab.id, { action: 'analyzeCurrentPage' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message to tab:', chrome.runtime.lastError);
                }
            });
        }
    } catch (error) {
        console.error('Error in extension icon click handler:', error);
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    try {
        if (namespace === 'local') {
            console.log('🔒 ShadowLens: Storage changed:', changes);
        }
    } catch (error) {
        console.error('Error in storage change listener:', error);
    }
}); 