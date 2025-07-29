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
        try {
            if (message.action === 'analysisComplete') {
                console.log('Analysis complete received:', message.analysis);
                currentAnalysis = message.analysis;
                displayAnalysis(currentAnalysis);
            } else if (message.action === 'analysisError') {
                console.error('Analysis error received:', message.error);
                showError(`Analysis failed: ${message.error}`);
            } else if (message.action === 'privacyLinksFound') {
                console.log('Privacy links found:', message.links);
                privacyLinks = message.links;
                displayPrivacyLinks(privacyLinks);
            }
        } catch (error) {
            console.error('Error in popup message listener:', error);
            showError('Error processing analysis results');
        }
    });
    
    // Add timeout for analysis
    setTimeout(() => {
        const loadingElement = document.getElementById('loading');
        if (loadingElement && loadingElement.style.display !== 'none') {
            console.log('Analysis timeout, showing error');
            showError('Analysis timed out. Please try again.');
        }
    }, 10000); // 10 second timeout
});

function checkForAnalysis(tabId) {
    // Send message to content script to get current analysis
    chrome.tabs.sendMessage(tabId, {action: 'getAnalysis'}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error checking analysis:', chrome.runtime.lastError);
            showError('Unable to get analysis results');
        } else if (response && response.analysis) {
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
    // Check if content script is available first
    chrome.tabs.sendMessage(tabId, {action: 'ping'}, function(response) {
        if (chrome.runtime.lastError) {
            console.log('Content script not ready, injecting...');
            // Inject content script if not available
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['content.js']
            }, function() {
                if (chrome.runtime.lastError) {
                    console.error('Failed to inject content script:', chrome.runtime.lastError);
                    showError('Unable to analyze this page');
                } else {
                    // Try analysis again after injection
                    setTimeout(() => {
                        performAnalysis(tabId);
                    }, 500);
                }
            });
        } else {
            // Content script is ready, perform analysis
            performAnalysis(tabId);
        }
    });
}

function performAnalysis(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'analyzeCurrentPage'}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Analysis error:', chrome.runtime.lastError);
            showError('Unable to analyze this page');
        } else if (response && response.error) {
            console.error('Analysis error:', response.error);
            showError(response.error);
        } else if (response) {
            console.log('Analysis triggered:', response);
            
            // Check for results immediately
            setTimeout(() => {
                checkForAnalysis(tabId);
            }, 1000);
        } else {
            console.log('No response from content script');
            showError('Unable to analyze this page');
        }
    });
}

function displayAnalysis(analysis) {
    try {
        // Hide loading and error states
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        const analysisElement = document.getElementById('analysis');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
        if (analysisElement) analysisElement.style.display = 'block';
        
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
        
        const riskNumberElement = document.getElementById('risk-number');
        const riskLabelElement = document.getElementById('risk-label');
        const riskDescriptionElement = document.getElementById('risk-description');
        
        if (riskNumberElement) riskNumberElement.textContent = riskScore;
        if (riskLabelElement) riskLabelElement.textContent = recommendation;
        
        // Set risk color
        if (riskLabelElement) {
            riskLabelElement.className = 'risk-label';
            
            if (riskScore >= 8) {
                riskLabelElement.classList.add('risk-dangerous');
                if (riskDescriptionElement) riskDescriptionElement.textContent = 'Critical privacy concerns detected';
            } else if (riskScore >= 6) {
                riskLabelElement.classList.add('risk-caution');
                if (riskDescriptionElement) riskDescriptionElement.textContent = 'Significant privacy concerns';
            } else if (riskScore >= 4) {
                riskLabelElement.classList.add('risk-moderate');
                if (riskDescriptionElement) riskDescriptionElement.textContent = 'Some privacy concerns';
            } else {
                riskLabelElement.classList.add('risk-safe');
                if (riskDescriptionElement) riskDescriptionElement.textContent = 'Good privacy practices';
            }
        }
        
        // Display recommendation reason
        const recommendationReason = analysis.recommendation_reason || 'Analysis complete';
        const reasonElement = document.getElementById('recommendation-reason');
        if (reasonElement) {
            reasonElement.textContent = recommendationReason;
        }
        
        // Display features used
        if (analysis.features_used) {
            const featuresContainer = document.getElementById('features-list');
            const featuresUsedElement = document.getElementById('features-used');
            
            if (featuresContainer) {
                featuresContainer.innerHTML = '';
                
                analysis.features_used.forEach(feature => {
                    const featureTag = document.createElement('span');
                    featureTag.className = 'feature-tag';
                    featureTag.textContent = feature;
                    featuresContainer.appendChild(featureTag);
                });
            }
            
            if (featuresUsedElement) {
                featuresUsedElement.style.display = 'block';
            }
        }
        
        // Display analysis summary
        const summary = analysis.summary || 'Analysis completed';
        const summaryElement = document.getElementById('analysis-summary');
        if (summaryElement) {
            summaryElement.textContent = summary;
        }
        
        // Display student-friendly summary
        const studentSummary = analysis.student_summary || 'Student summary not available';
        const studentSummaryElement = document.getElementById('student-summary');
        if (studentSummaryElement) {
            studentSummaryElement.textContent = studentSummary;
        }
        
        // Display privacy threats
        const privacyThreats = analysis.privacy_threats || [];
        const threatsContainer = document.getElementById('privacy-threats');
        
        if (threatsContainer) {
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
        }
        
        // Display detailed risk metrics
        if (analysis.detailed_metrics) {
            const metrics = analysis.detailed_metrics;
            const detailedAnalysis = analysis.detailed_analysis || {};
            
            // Update metric values
            const metricElements = {
                'data-monetization': detailedAnalysis.data_monetization_risk || 'Low',
                'sensitive-data': detailedAnalysis.sensitive_data_risk || 'Low',
                'behavioral-tracking': detailedAnalysis.tracking_risk || 'Low',
                'legal-concerns': detailedAnalysis.legal_risk || 'Low',
                'data-retention': detailedAnalysis.retention_risk || 'Low',
                'third-party': detailedAnalysis.third_party_risk || 'Low',
                'international': detailedAnalysis.international_risk || 'Low',
                'form-risks': detailedAnalysis.form_risk || 'Low'
            };
            
            Object.keys(metricElements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = metricElements[id];
                    element.className = 'metric-value';
                    
                    // Add risk color class
                    const riskLevel = metricElements[id].toLowerCase();
                    if (riskLevel === 'critical') {
                        element.classList.add('risk-critical');
                    } else if (riskLevel === 'high') {
                        element.classList.add('risk-high');
                    } else if (riskLevel === 'medium') {
                        element.classList.add('risk-medium');
                    } else {
                        element.classList.add('risk-low');
                    }
                }
            });
        }
        
        // Display form analysis
        const forms = analysis.forms || [];
        const totalFields = forms.reduce((count, form) => count + (form.fields ? form.fields.length : 0), 0);
        const sensitiveFields = forms.reduce((count, form) => {
            return count + (form.fields ? form.fields.filter(f => f.sensitive).length : 0);
        }, 0);
        
        const formAnalysis = `Found ${forms.length} forms with ${totalFields} fields (${sensitiveFields} sensitive)`;
        const formAnalysisElement = document.getElementById('form-analysis');
        if (formAnalysisElement) {
            formAnalysisElement.textContent = formAnalysis;
        }
        
        // Update badge
        updateBadge(riskScore);
    } catch (error) {
        console.error('Error in displayAnalysis:', error);
        showError('Error displaying analysis results');
    }
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
    try {
        const loadingElement = document.getElementById('loading');
        const analysisElement = document.getElementById('analysis');
        const errorElement = document.getElementById('error');
        const errorMessageElement = document.getElementById('error-message');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (analysisElement) analysisElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        if (errorMessageElement) errorMessageElement.textContent = message;
        
        // Auto-retry after 5 seconds
        setTimeout(() => {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    triggerAnalysis(tabs[0].id);
                }
            });
        }, 5000);
    } catch (error) {
        console.error('Error in showError:', error);
    }
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