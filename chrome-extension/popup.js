// ShadowLens Popup JavaScript - Enhanced Features
let currentAnalysis = null;
let privacyLinks = [];

// Initialize popup when opened
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 ShadowLens Popup: Initializing Enhanced Features...');
    
    // Show loading state
    document.getElementById('loading').style.display = 'block';
    document.getElementById('analysis').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    // Get current tab and trigger analysis
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            const currentTab = tabs[0];
            console.log('🌐 Current tab URL from address bar:', currentTab.url);
            
            // Show the URL immediately
            const urlElement = document.getElementById('current-url');
            if (urlElement) {
                urlElement.textContent = currentTab.url;
            }
            
            // Always trigger fresh analysis
            triggerAnalysis(currentTab.id);
        }
    });
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'analysisComplete') {
            console.log('Analysis complete received:', message.analysis);
            currentAnalysis = message.analysis;
            displayAnalysis(currentAnalysis);
        } else if (message.action === 'privacyLinksFound') {
            console.log('Privacy links found:', message.links);
            privacyLinks = message.links;
            displayPrivacyLinks(privacyLinks);
        }
    });
});

function checkForAnalysis(tabId) {
    // Send message to content script to get current analysis
    chrome.tabs.sendMessage(tabId, {action: 'getAnalysis'}, function(response) {
        if (response && response.analysis) {
            console.log('Found existing analysis:', response.analysis);
            currentAnalysis = response.analysis;
            displayAnalysis(currentAnalysis);
        } else {
            // No analysis found, show error
            console.log('No analysis found');
            showError('Analysis not available for this page');
        }
    });
}

function triggerAnalysis(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'analyzeCurrentPage'}, function(response) {
        if (response && response.error) {
            console.error('Analysis error:', response.error);
            showError(response.error);
        } else if (response) {
            console.log('Analysis triggered:', response);
            
            // Check for results immediately
            setTimeout(() => {
                checkForAnalysis(tabId);
            }, 1000); // Reduced wait time
        } else {
            console.log('No response from content script');
            showError('Unable to analyze this page');
        }
    });
}

function displayAnalysis(analysis) {
    // Hide loading and error states
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('analysis').style.display = 'block';
    
    // Display current URL from address bar
    const currentUrl = analysis.url || 'Unknown URL';
    console.log('🌐 Displaying analysis for URL from address bar:', currentUrl);
    
    // Show the URL in the popup
    const urlElement = document.getElementById('current-url');
    if (urlElement) {
        urlElement.textContent = currentUrl;
    }
    
    // Display risk score
    const riskScore = analysis.risk_score || 0;
    const recommendation = analysis.recommendation || 'Unknown';
    
    document.getElementById('risk-number').textContent = riskScore;
    document.getElementById('risk-label').textContent = recommendation;
    
    // Set risk color
    const riskLabel = document.getElementById('risk-label');
    riskLabel.className = 'risk-label';
    
    if (riskScore >= 8) {
        riskLabel.classList.add('risk-dangerous');
        document.getElementById('risk-description').textContent = 'Critical privacy concerns detected';
    } else if (riskScore >= 6) {
        riskLabel.classList.add('risk-caution');
        document.getElementById('risk-description').textContent = 'Significant privacy concerns';
    } else if (riskScore >= 4) {
        riskLabel.classList.add('risk-moderate');
        document.getElementById('risk-description').textContent = 'Some privacy concerns';
    } else {
        riskLabel.classList.add('risk-safe');
        document.getElementById('risk-description').textContent = 'Good privacy practices';
    }
    
    // Display features used
    if (analysis.features_used) {
        const featuresContainer = document.getElementById('features-list');
        featuresContainer.innerHTML = '';
        
        analysis.features_used.forEach(feature => {
            const featureTag = document.createElement('span');
            featureTag.className = 'feature-tag';
            featureTag.textContent = feature;
            featuresContainer.appendChild(featureTag);
        });
        
        document.getElementById('features-used').style.display = 'block';
    }
    
    // Display analysis summary
    const summary = analysis.summary || 'Analysis completed';
    document.getElementById('analysis-summary').textContent = summary;
    
    // Display student-friendly summary
    const studentSummary = analysis.student_summary || 'Student summary not available';
    document.getElementById('student-summary').textContent = studentSummary;
    
    // Display privacy threats
    const privacyThreats = analysis.privacy_threats || [];
    const threatsContainer = document.getElementById('privacy-threats');
    
    if (privacyThreats.length > 0) {
        threatsContainer.innerHTML = '';
        privacyThreats.forEach(threat => {
            const threatElement = document.createElement('div');
            threatElement.className = 'threat-item';
            threatElement.textContent = threat;
            threatsContainer.appendChild(threatElement);
        });
    } else {
        threatsContainer.innerHTML = '<div class="detail-item">No privacy threats detected</div>';
    }
    
    // Display form analysis
    const forms = analysis.forms || [];
    const totalFields = forms.reduce((count, form) => count + (form.fields ? form.fields.length : 0), 0);
    const sensitiveFields = forms.reduce((count, form) => {
        return count + (form.fields ? form.fields.filter(f => f.sensitive).length : 0);
    }, 0);
    
    const formAnalysis = `Found ${forms.length} forms with ${totalFields} fields (${sensitiveFields} sensitive)`;
    document.getElementById('form-analysis').textContent = formAnalysis;
    
    // Update badge
    updateBadge(riskScore);
}

function displayPrivacyLinks(links) {
    if (links.length > 0) {
        const linksContainer = document.getElementById('links-list');
        linksContainer.innerHTML = '';
        
        links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.className = 'link-item';
            linkElement.href = link.href;
            linkElement.textContent = `${link.text} (${link.type})`;
            linkElement.target = '_blank';
            linksContainer.appendChild(linkElement);
        });
        
        document.getElementById('privacy-links').style.display = 'block';
    }
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('analysis').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-message').textContent = message;
    
    // Auto-retry after 5 seconds
    setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                triggerAnalysis(tabs[0].id);
            }
        });
    }, 5000);
}

function retryAnalysis() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('error').style.display = 'none';
            document.getElementById('analysis').style.display = 'none';
            
            triggerAnalysis(tabs[0].id);
            }
    });
}

function refreshAnalysis() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('analysis').style.display = 'none';
            
            triggerAnalysis(tabs[0].id);
        }
    });
}

function openCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, {active: true});
            window.close();
        }
    });
}

function updateBadge(riskScore) {
    // Send message to background script to update badge
    chrome.runtime.sendMessage({
        action: 'updateBadge',
        riskScore: riskScore
    });
}

// Handle window focus to refresh analysis
window.addEventListener('focus', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            checkForAnalysis(tabs[0].id);
    }
    });
}); 