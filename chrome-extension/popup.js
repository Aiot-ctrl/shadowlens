// ShadowLens Chrome Extension Popup
let currentAnalysis = null;

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🔒 ShadowLens Popup: Initializing...');
        
        const loadingElement = document.getElementById('loading');
        const analysisElement = document.getElementById('analysis');
        const errorElement = document.getElementById('error');
        
        if (loadingElement) {
            try { loadingElement.style.display = 'block'; } catch (displayError) { console.error('Error setting loading display:', displayError); }
        }
        if (analysisElement) {
            try { analysisElement.style.display = 'none'; } catch (displayError) { console.error('Error setting analysis display:', displayError); }
        }
        if (errorElement) {
            try { errorElement.style.display = 'none'; } catch (displayError) { console.error('Error setting error display:', displayError); }
        }
        
        try {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                try {
                    if (tabs && tabs[0]) {
                        const currentUrl = tabs[0].url;
                        console.log('🌐 Current URL:', currentUrl);
                        
                        // Display current URL
                        const urlElement = document.getElementById('url-text');
                        const currentUrlDiv = document.getElementById('current-url');
                        if (urlElement) urlElement.textContent = currentUrl;
                        if (currentUrlDiv) currentUrlDiv.classList.remove('hidden');
                        
                        // Trigger analysis
                        try {
                            triggerAnalysis();
                        } catch (triggerError) {
                            console.error('Error triggering analysis:', triggerError);
                            showError('Failed to start analysis');
                        }
                    } else {
                        console.error('No active tab found');
                        showError('No active tab found');
                    }
                } catch (tabError) {
                    console.error('Error processing tabs:', tabError);
                    showError('Unable to access current tab');
                }
            });
        } catch (queryError) {
            console.error('Error querying tabs:', queryError);
            showError('Unable to access browser tabs');
        }
        
        try {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                try {
                    if (message && message.action) {
                        console.log('📨 Popup received message:', message.action);
                        
                        if (message.action === 'analysisComplete') {
                            try {
                                currentAnalysis = message.analysis;
                                displayAnalysis(message.analysis);
                            } catch (displayError) {
                                console.error('Error displaying analysis:', displayError);
                                showError('Error displaying analysis results');
                            }
                        } else if (message.action === 'analysisError') {
                            try {
                                showError(message.error || 'Analysis failed');
                            } catch (errorError) {
                                console.error('Error showing error message:', errorError);
                            }
                        }
                    }
                } catch (messageError) {
                    console.error('Error in popup message listener:', messageError);
                    try { showError('Error processing analysis results'); } catch (showError) { console.error('Error showing error message:', showError); }
                }
            });
        } catch (listenerError) {
            console.error('Error setting up message listener:', listenerError);
        }
        
        // Set up dashboard button
        try {
            const dashboardButton = document.getElementById('dashboard-button');
            if (dashboardButton) {
                dashboardButton.addEventListener('click', function() {
                    try {
                        openDashboard();
                    } catch (dashboardError) {
                        console.error('Error opening dashboard:', dashboardError);
                        showError('Failed to open dashboard');
                    }
                });
            }
        } catch (buttonError) {
            console.error('Error setting up dashboard button:', buttonError);
        }
        
        try {
            setTimeout(() => {
                try {
                    const loadingElement = document.getElementById('loading');
                    if (loadingElement && loadingElement.style.display !== 'none') {
                        console.log('Analysis timeout, showing error');
                        showError('Analysis timed out. Please try again.');
                    }
                } catch (timeoutError) {
                    console.error('Error in timeout handler:', timeoutError);
                }
            }, 10000);
        } catch (timeoutError) {
            console.error('Error setting timeout:', timeoutError);
        }
        
    } catch (initError) {
        console.error('Critical error in popup initialization:', initError);
        try {
            const errorElement = document.getElementById('error');
            const errorMessageElement = document.getElementById('error-message');
            if (errorElement) errorElement.style.display = 'block';
            if (errorMessageElement) errorMessageElement.textContent = 'Extension initialization failed';
        } catch (fallbackError) {
            console.error('Error in fallback error display:', fallbackError);
        }
    }
});

function triggerAnalysis() {
    try {
        console.log('🔍 Triggering analysis...');
        
        // Check if content script is available
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            try {
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'ping'}, function(response) {
                        try {
                            if (chrome.runtime.lastError) {
                                console.log('Content script not ready, injecting...');
                                injectContentScript();
                            } else {
                                console.log('Content script ready, triggering analysis');
                                performAnalysis();
                            }
                        } catch (pingError) {
                            console.error('Error in ping response:', pingError);
                            injectContentScript();
                        }
                    });
                }
            } catch (queryError) {
                console.error('Error querying tabs for analysis:', queryError);
                showError('Unable to access current tab');
            }
        });
    } catch (triggerError) {
        console.error('Error triggering analysis:', triggerError);
        showError('Failed to start analysis');
    }
}

function injectContentScript() {
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            try {
                if (tabs && tabs[0]) {
                    chrome.scripting.executeScript({
                        target: {tabId: tabs[0].id},
                        files: ['content.js']
                    }, function() {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('Error injecting content script:', chrome.runtime.lastError);
                                showError('Failed to inject analysis script');
                            } else {
                                console.log('Content script injected, triggering analysis');
                                setTimeout(performAnalysis, 1000);
                            }
                        } catch (injectError) {
                            console.error('Error in injection callback:', injectError);
                            showError('Failed to inject analysis script');
                        }
                    });
                }
            } catch (queryError) {
                console.error('Error querying tabs for injection:', queryError);
                showError('Unable to access current tab');
            }
        });
    } catch (injectError) {
        console.error('Error injecting content script:', injectError);
        showError('Failed to inject analysis script');
    }
}

function performAnalysis() {
    try {
        console.log('🔍 Performing analysis...');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            try {
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'analyze'}, function(response) {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('Error sending analyze message:', chrome.runtime.lastError);
                                showError('Analysis failed. Please refresh the page and try again.');
                            }
                        } catch (sendError) {
                            console.error('Error in analyze message callback:', sendError);
                            showError('Analysis failed');
                        }
                    });
                }
            } catch (queryError) {
                console.error('Error querying tabs for analysis:', queryError);
                showError('Unable to access current tab');
            }
        });
    } catch (performError) {
        console.error('Error performing analysis:', performError);
        showError('Failed to perform analysis');
    }
}

function checkForAnalysis() {
    try {
        if (currentAnalysis) {
            try {
                displayAnalysis(currentAnalysis);
            } catch (displayError) {
                console.error('Error displaying cached analysis:', displayError);
                showError('Error displaying analysis');
            }
        } else {
            try {
                triggerAnalysis();
            } catch (triggerError) {
                console.error('Error triggering analysis on check:', triggerError);
                showError('Failed to start analysis');
            }
        }
    } catch (checkError) {
        console.error('Error checking for analysis:', checkError);
        showError('Error checking analysis status');
    }
}

function displayAnalysis(analysis) {
    try {
        console.log('📊 Displaying analysis:', analysis);
        
        const loadingElement = document.getElementById('loading');
        const analysisElement = document.getElementById('analysis');
        const errorElement = document.getElementById('error');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
        if (analysisElement) analysisElement.style.display = 'block';
        
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
        const reasonElement = document.getElementById('reason-text');
        const recommendationDiv = document.getElementById('recommendation-reason');
        if (reasonElement && analysis.recommendation_reason) {
            reasonElement.textContent = analysis.recommendation_reason;
            if (recommendationDiv) recommendationDiv.classList.remove('hidden');
        } else if (recommendationDiv) {
            recommendationDiv.classList.add('hidden');
        }
        
        // Display metrics
        const formsCountElement = document.getElementById('forms-count');
        const sensitiveFieldsElement = document.getElementById('sensitive-fields');
        const threatsCountElement = document.getElementById('threats-count');
        const riskLevelElement = document.getElementById('risk-level');
        
        if (formsCountElement) formsCountElement.textContent = analysis.forms || 0;
        if (sensitiveFieldsElement) sensitiveFieldsElement.textContent = analysis.sensitive_fields || 0;
        if (threatsCountElement) threatsCountElement.textContent = analysis.privacy_threats ? analysis.privacy_threats.length : 0;
        if (riskLevelElement) riskLevelElement.textContent = recommendation;
        
        // Display threats
        const threatsContainer = document.getElementById('threats-container');
        const threatsList = document.getElementById('threats-list');
        
        if (threatsContainer && threatsList) {
            if (analysis.privacy_threats && analysis.privacy_threats.length > 0) {
                threatsList.innerHTML = analysis.privacy_threats.map(threat => 
                    `<div class="threat-item">${threat}</div>`
                ).join('');
                threatsContainer.classList.remove('hidden');
            } else {
                threatsContainer.classList.add('hidden');
            }
        }
        
        // Display student summary
        const studentSummaryElement = document.getElementById('student-summary');
        const summaryTextElement = document.getElementById('summary-text');
        
        if (studentSummaryElement && summaryTextElement) {
            if (analysis.student_summary) {
                summaryTextElement.textContent = analysis.student_summary;
                studentSummaryElement.classList.remove('hidden');
            } else {
                studentSummaryElement.classList.add('hidden');
            }
        }
        
        // Display detailed metrics
        const riskMetricsElement = document.getElementById('risk-metrics');
        const metricsListElement = document.getElementById('metrics-list');
        
        if (riskMetricsElement && metricsListElement && analysis.detailed_metrics) {
            const metricsHTML = Object.entries(analysis.detailed_metrics).map(([key, value]) => 
                `<div class="metric-item">
                    <div class="metric-label">${key.replace(/_/g, ' ').toUpperCase()}</div>
                    <div class="metric-value">${value}</div>
                </div>`
            ).join('');
            metricsListElement.innerHTML = metricsHTML;
            riskMetricsElement.classList.remove('hidden');
        } else if (riskMetricsElement) {
            riskMetricsElement.classList.add('hidden');
        }
        
        // Update badge
        try {
            updateBadge(riskScore);
        } catch (badgeError) {
            console.error('Error updating badge:', badgeError);
        }
        
    } catch (displayError) {
        console.error('Error displaying analysis:', displayError);
        showError('Error displaying analysis results');
    }
}

function showError(message) {
    try {
        console.error('❌ Error:', message);
        
        const loadingElement = document.getElementById('loading');
        const analysisElement = document.getElementById('analysis');
        const errorElement = document.getElementById('error');
        const errorMessageElement = document.getElementById('error-message');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (analysisElement) analysisElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        if (errorMessageElement) errorMessageElement.textContent = message;
        
    } catch (errorError) {
        console.error('Error showing error message:', errorError);
    }
}

function updateBadge(riskScore) {
    try {
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            riskScore: riskScore
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error updating badge:', chrome.runtime.lastError);
            }
        });
    } catch (badgeError) {
        console.error('Error updating badge:', badgeError);
    }
}

function openDashboard() {
    try {
        console.log('📊 Opening dashboard...');
        
        // Check if chrome.runtime is available
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('Chrome runtime not available');
            showError('Dashboard not available in this context');
            return;
        }
        
        // Get dashboard URL
        const dashboardUrl = chrome.runtime.getURL('dashboard.html');
        console.log('Dashboard URL:', dashboardUrl);
        
        // Open dashboard HTML file in new tab
        chrome.tabs.create({
            url: dashboardUrl
        }, function(tab) {
            try {
                if (chrome.runtime.lastError) {
                    console.error('Error opening dashboard:', chrome.runtime.lastError);
                    showError('Failed to open dashboard. Please try again.');
                } else {
                    console.log('✅ Dashboard opened successfully');
                }
            } catch (createError) {
                console.error('Error in tab creation callback:', createError);
                showError('Failed to open dashboard');
            }
        });
        
    } catch (dashboardError) {
        console.error('Error opening dashboard:', dashboardError);
        showError('Failed to open dashboard');
    }
}

// Auto-refresh when popup gains focus
window.addEventListener('focus', function() {
    try {
        console.log('🔄 Popup focused, checking for updates...');
        checkForAnalysis();
    } catch (focusError) {
        console.error('Error on popup focus:', focusError);
    }
});

console.log('🔒 ShadowLens Popup: Ready!'); 