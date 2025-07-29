// ShadowLens Content Script - Enhanced with Dashboard Integration
let currentAnalysis = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 ShadowLens Content Script: Initializing...');
    
    // Get current URL from address bar and analyze
    const currentUrl = window.location.href;
    console.log('🌐 Current URL from address bar:', currentUrl);
    
    // Analyze immediately for faster response
    analyzeCurrentPage();
});

// Simple URL change detection
let lastUrl = window.location.href;
new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        analyzeCurrentPage();
    }
}).observe(document, {subtree: true, childList: true});

// Removed unused functions for cleaner code

function analyzeCurrentPage() {
    console.log('🔍 Starting page analysis...');
    
    // Get URL directly from address bar
    const currentUrl = window.location.href;
    console.log('🌐 Analyzing URL from address bar:', currentUrl);
    
    // Quick analysis for immediate response
    const analysisData = {
        url: currentUrl,
        text: extractPageText(),
        forms: extractForms(),
        riskIndicators: detectRiskIndicators(),
        websiteType: detectWebsiteType(currentUrl, document.body.innerText)
    };
    
    console.log('📊 Analysis data collected:', analysisData);
    
    // Perform immediate local analysis
    const analysis = performLocalAnalysis(analysisData);
    console.log('✅ Local analysis complete:', analysis);
    currentAnalysis = analysis;
    
    // Save to Chrome storage for dashboard
    saveAnalysisToStorage(analysis);
    
    // Notify popup immediately
    chrome.runtime.sendMessage({
        action: 'analysisComplete',
        analysis: analysis
    });
}

function extractPageText() {
    // Faster text extraction - only key elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, title, meta[name="description"]');
    let text = '';
    
    textElements.forEach(element => {
        if (element.textContent && element.textContent.trim()) {
            text += element.textContent.trim() + ' ';
        }
    });
    
    return text.substring(0, 2000); // Shorter text for faster processing
}

function extractForms() {
        const forms = [];
        const formElements = document.querySelectorAll('form');
        
    formElements.forEach((form, index) => {
            const fields = [];
        const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
            const field = {
                name: input.name || input.id || `field_${index}`,
                type: input.type || input.tagName.toLowerCase(),
                sensitive: isSensitiveField(input)
            };
            fields.push(field);
        });
        
        forms.push({
            action: form.action || '',
            method: form.method || 'get',
            fields: fields
        });
        });
        
        return forms;
    }

function isSensitiveField(input) {
        const sensitivePatterns = [
        'password', 'passwd', 'pwd', 'secret', 'key',
        'ssn', 'social', 'security', 'id', 'passport',
        'card', 'credit', 'payment', 'paypal', 'stripe',
        'account', 'login', 'email', 'phone', 'mobile'
    ];
    
    const fieldName = (input.name || input.id || '').toLowerCase();
    const fieldType = (input.type || '').toLowerCase();
    
    return sensitivePatterns.some(pattern => 
        fieldName.includes(pattern) || fieldType.includes(pattern)
    );
}

function extractImages() {
        const images = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach(img => {
        if (img.src) {
                images.push({
                src: img.src,
                    alt: img.alt || '',
                width: img.width || 0,
                height: img.height || 0
                });
            }
        });
        
        return images;
    }

function detectRiskIndicators() {
    const indicators = [];
    const text = document.body.innerText.toLowerCase();
    
    // High-risk privacy terms only
    const privacyTerms = [
        'sell your data', 'data brokers', 'third party advertising',
        'social security number', 'ssn', 'government id'
    ];
    
    privacyTerms.forEach(term => {
        if (text.includes(term)) {
            indicators.push({
                type: 'privacy_term',
                term: term,
                risk: 'high'
            });
        }
    });
    
    return indicators;
}

function detectWebsiteType(url, text) {
    const urlLower = url.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Social media detection
    if (urlLower.includes('facebook') || urlLower.includes('instagram') || 
        urlLower.includes('twitter') || urlLower.includes('linkedin')) {
        return 'social_media';
            }
    
    // Educational detection
    if (urlLower.includes('coursera') || urlLower.includes('edx') || 
        urlLower.includes('khanacademy') || urlLower.includes('udemy') ||
        textLower.includes('course') || textLower.includes('learn') || 
        textLower.includes('education')) {
        return 'educational';
    }
    
    // Financial detection
    if (urlLower.includes('bank') || urlLower.includes('paypal') || 
        urlLower.includes('stripe') || textLower.includes('payment') ||
        textLower.includes('credit') || textLower.includes('financial')) {
        return 'financial';
    }

    // E-commerce detection
    if (urlLower.includes('amazon') || urlLower.includes('ebay') || 
        urlLower.includes('shop') || textLower.includes('buy') ||
        textLower.includes('purchase') || textLower.includes('cart')) {
        return 'ecommerce';
    }
    
    return 'general';
}

function detectDocumentType(url, text) {
    const urlLower = url.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (urlLower.includes('privacy') || textLower.includes('privacy policy')) {
        return 'privacy_policy';
    }
    
    if (urlLower.includes('terms') || textLower.includes('terms of service')) {
        return 'terms_of_service';
    }
    
    if (urlLower.includes('policy') || textLower.includes('policy')) {
        return 'policy';
    }
    
    return 'general';
}

// Removed sendToBackend function - using direct local analysis

function performLocalAnalysis(data) {
    const riskIndicators = data.riskIndicators || [];
    const forms = data.forms || [];
    const websiteType = data.websiteType || 'general';
    
    // Simple risk calculation
    let riskScore = 0;
    let privacyThreats = [];
    
    // Base score by website type
    switch(websiteType) {
        case 'social_media': riskScore = 4; break;
        case 'financial': riskScore = 5; break;
        case 'ecommerce': riskScore = 3; break;
        case 'educational': riskScore = 2; break;
        default: riskScore = 1;
    }
    
    // Add points for risk indicators
    riskIndicators.forEach(indicator => {
        if (indicator.type === 'privacy_term') {
            riskScore += 2;
            privacyThreats.push(`Privacy term found: ${indicator.term}`);
        }
    });
    
    // Add points for sensitive forms
    const sensitiveFields = forms.reduce((sum, form) => 
        sum + (form.fields ? form.fields.filter(f => f.sensitive).length : 0), 0);
    if (sensitiveFields > 0) riskScore += Math.min(sensitiveFields, 2);
    
    // Cap risk score
    riskScore = Math.min(riskScore, 10);
    
    // Determine recommendation
    let recommendation = 'Safe';
    if (riskScore >= 8) recommendation = 'Dangerous';
    else if (riskScore >= 6) recommendation = 'Caution';
    else if (riskScore >= 4) recommendation = 'Moderate';
    
    return {
        risk_score: riskScore,
        recommendation: recommendation,
        privacy_threats: privacyThreats,
        websiteType: websiteType,
        forms: forms,
        features_used: ['Privacy Analysis'],
        summary: `Analysis of ${websiteType} website with ${privacyThreats.length} privacy threats detected`,
        student_summary: riskScore <= 3 ? 'This website appears to have good privacy practices' : 
                        riskScore <= 5 ? 'This website has some privacy concerns to be aware of' :
                        'This website has significant privacy concerns - proceed with caution'
    };
}

function saveAnalysisToStorage(analysis) {
    // Get existing history
    chrome.storage.local.get(['websiteHistory'], function(result) {
        let history = result.websiteHistory || [];
        
        // Add new analysis
        const newEntry = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            riskScore: analysis.risk_score || 0,
            recommendation: analysis.recommendation || 'Unknown',
            privacyThreats: analysis.privacy_threats || [],
            forms: analysis.forms ? analysis.forms.length : 0,
            sensitiveFields: analysis.forms ? analysis.forms.reduce((sum, form) => 
                sum + (form.fields ? form.fields.filter(f => f.sensitive).length : 0), 0) : 0,
            websiteType: analysis.websiteType || 'general',
            analysis: analysis
        };
        
        // Add to beginning of history
        history.unshift(newEntry);
            
        // Keep only last 100 entries
        if (history.length > 100) {
            history = history.slice(0, 100);
            }
            
        // Save to storage
        chrome.storage.local.set({ websiteHistory: history }, function() {
            console.log('💾 Analysis saved to storage');
        });
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getAnalysis') {
        sendResponse({ analysis: currentAnalysis });
    } else if (message.action === 'analyzeCurrentPage') {
        analyzeCurrentPage();
        sendResponse({ status: 'analysis_started' });
    } else if (message.action === 'getCurrentUrl') {
        // Get URL directly from address bar
        const currentUrl = window.location.href;
        console.log('🌐 Getting URL from address bar:', currentUrl);
        sendResponse({ url: currentUrl });
    }
});

console.log('🔒 ShadowLens Content Script: Ready!'); 