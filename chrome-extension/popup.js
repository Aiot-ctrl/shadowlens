// ShadowLens Popup JavaScript - Enhanced Features
let currentAnalysis = null;
let privacyLinks = [];

// Initialize popup when opened
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 ShadowLens Popup: Initializing Enhanced Features...');
    
    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            const currentTab = tabs[0];
            console.log('Current tab:', currentTab.url);
            
            // Check if we have analysis results
            checkForAnalysis(currentTab.id);
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
            // No analysis yet, trigger one
            console.log('No analysis found, triggering new analysis...');
            triggerAnalysis(tabId);
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
            currentAnalysis = response;
            displayAnalysis(currentAnalysis);
        }
    });
}

function displayAnalysis(analysis) {
    // Hide loading and error states
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('analysis').style.display = 'block';
    
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
    
    // Display deception indicators
    const deceptionIndicators = analysis.deception_indicators || [];
    const deceptionContainer = document.getElementById('deception-indicators');
    
    if (deceptionIndicators.length > 0) {
        deceptionContainer.innerHTML = '';
        deceptionIndicators.forEach(indicator => {
            const indicatorElement = document.createElement('div');
            indicatorElement.className = 'deception-item';
            indicatorElement.textContent = `${indicator.type}: ${indicator.pattern} (${indicator.matches} matches)`;
            deceptionContainer.appendChild(indicatorElement);
        });
    } else {
        deceptionContainer.innerHTML = '<div class="detail-item">No deceptive practices detected</div>';
    }
    
    // Display FERPA compliance issues
    const ferpaIssues = analysis.ferpa_compliance || [];
    const ferpaContainer = document.getElementById('ferpa-compliance');
    
    if (ferpaIssues.length > 0) {
        ferpaContainer.innerHTML = '';
        ferpaIssues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = 'compliance-item';
            issueElement.textContent = issue;
            ferpaContainer.appendChild(issueElement);
        });
    } else {
        ferpaContainer.innerHTML = '<div class="detail-item">No FERPA issues detected</div>';
    }
    
    // Display GDPR compliance issues
    const gdprIssues = analysis.gdpr_compliance || [];
    const gdprContainer = document.getElementById('gdpr-compliance');
    
    if (gdprIssues.length > 0) {
        gdprContainer.innerHTML = '';
        gdprIssues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = 'compliance-item';
            issueElement.textContent = issue;
            gdprContainer.appendChild(issueElement);
        });
    } else {
        gdprContainer.innerHTML = '<div class="detail-item">No GDPR issues detected</div>';
    }
    
    // Display legal concerns (red flags)
    const redFlags = analysis.red_flags || [];
    const legalContainer = document.getElementById('legal-concerns');
    
    if (redFlags.length > 0) {
        legalContainer.innerHTML = '';
        redFlags.forEach(flag => {
            const flagElement = document.createElement('div');
            flagElement.className = 'threat-item';
            flagElement.textContent = flag;
            legalContainer.appendChild(flagElement);
        });
    } else {
        legalContainer.innerHTML = '<div class="detail-item">No legal concerns detected</div>';
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