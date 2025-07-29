// ShadowLens Content Script - Enhanced with Dashboard Integration
let currentAnalysis = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 ShadowLens Content Script: Initializing...');
    
    // Auto-detect legal documents and trigger analysis
    autoDetectLegalDocuments();
    
    // Find privacy policy links on non-legal pages
    if (!isLegalDocument(window.location.href)) {
        findPrivacyPolicyLinks();
    }
});

function autoDetectLegalDocuments() {
    const currentUrl = window.location.href.toLowerCase();
    const pageText = document.body.innerText.toLowerCase();
    
    // Check if current page is a legal document
    const legalIndicators = ['privacy', 'terms', 'policy', 'legal', 'conditions'];
    const isLegal = legalIndicators.some(indicator => 
        currentUrl.includes(indicator) || pageText.includes(indicator)
    );
    
    if (isLegal) {
        console.log('📋 Legal document detected, triggering analysis...');
        analyzeCurrentPage();
    }
}

function findPrivacyPolicyLinks() {
    const privacyLinks = [];
    const links = document.querySelectorAll('a[href*="privacy"], a[href*="terms"], a[href*="policy"]');
    
    links.forEach(link => {
        const href = link.href.toLowerCase();
        const text = link.textContent.toLowerCase();
        
        if (href.includes('privacy') || href.includes('terms') || href.includes('policy') ||
            text.includes('privacy') || text.includes('terms') || text.includes('policy')) {
            privacyLinks.push({
                href: link.href,
                text: link.textContent.trim(),
                type: getLinkType(href, text)
            });
        }
    });
    
    if (privacyLinks.length > 0) {
        console.log('🔍 Privacy policy links found:', privacyLinks);
        notifyPrivacyLinksFound(privacyLinks);
    }
}

function getLinkType(href, text) {
    if (href.includes('privacy') || text.includes('privacy')) return 'Privacy Policy';
    if (href.includes('terms') || text.includes('terms')) return 'Terms of Service';
    if (href.includes('policy') || text.includes('policy')) return 'Policy';
    return 'Legal Document';
}

function notifyPrivacyLinksFound(links) {
    chrome.runtime.sendMessage({
        action: 'privacyLinksFound',
        links: links
    });
}

function isLegalDocument(url) {
    const legalPatterns = ['privacy', 'terms', 'policy', 'legal', 'conditions'];
    return legalPatterns.some(pattern => url.toLowerCase().includes(pattern));
}

function analyzeCurrentPage() {
    console.log('🔍 Starting page analysis...');
    
    const analysisData = {
        url: window.location.href,
        text: extractPageText(),
        forms: extractForms(),
        images: extractImages(),
        riskIndicators: detectRiskIndicators(),
        websiteType: detectWebsiteType(window.location.href, document.body.innerText),
        isLegalDocument: isLegalDocument(window.location.href),
        documentType: detectDocumentType(window.location.href, document.body.innerText)
    };
    
    console.log('📊 Analysis data collected:', analysisData);
    
    // Send to backend for analysis
    sendToBackend(analysisData);
}

function extractPageText() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, title, meta');
    let text = '';
    
    textElements.forEach(element => {
        if (element.textContent && element.textContent.trim()) {
            text += element.textContent.trim() + ' ';
        }
    });
    
    // Limit text length to avoid API issues
    return text.substring(0, 15000);
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
    
    // Privacy terms
    const privacyTerms = [
        'privacy policy', 'data collection', 'cookies', 'tracking',
        'personal information', 'user data', 'analytics', 'marketing'
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
    
    // Concerning legal terms
    const legalTerms = [
        'disclaim all liability', 'not responsible', 'use at your own risk',
        'no warranty', 'as is', 'without limitation', 'broad rights'
    ];
    
    legalTerms.forEach(term => {
        if (text.includes(term)) {
            indicators.push({
                type: 'concerning_legal_term',
                term: term,
                risk: 'high'
            });
        }
    });
    
    // Data sharing terms
    const sharingTerms = [
        'share with third parties', 'sell your data', 'data brokers',
        'advertising partners', 'marketing partners'
    ];
    
    sharingTerms.forEach(term => {
        if (text.includes(term)) {
            indicators.push({
                type: 'data_sharing',
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

function sendToBackend(data) {
    fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('✅ Analysis complete:', result);
        currentAnalysis = result;
        
        // Save to Chrome storage for dashboard
        saveAnalysisToStorage(result);
        
        // Notify popup
        chrome.runtime.sendMessage({
            action: 'analysisComplete',
            analysis: result
        });
    })
    .catch(error => {
        console.error('❌ Analysis failed:', error);
        chrome.runtime.sendMessage({
            action: 'analysisError',
            error: error.message
        });
    });
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
    }
});

console.log('🔒 ShadowLens Content Script: Ready!'); 