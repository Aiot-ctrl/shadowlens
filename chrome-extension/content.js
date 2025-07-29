// ShadowLens Content Script
// Automatically activates on educational websites

class ShadowLensScanner {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.scanHistory = [];
        this.consentGiven = false;
        this.init();
    }

    init() {
        // Show consent banner first
        this.showConsentBanner();
        
        // Start scanning after a short delay
        setTimeout(() => {
            this.scanPage();
        }, 1000);
    }

    showConsentBanner() {
        if (this.consentGiven) return;
        
        const banner = document.createElement('div');
        banner.id = 'shadowlens-consent';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        banner.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px;">🔒 ShadowLens Privacy Guardian</h3>
                <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
                    We're scanning this educational website for privacy threats and data collection practices.
                    <strong>No personal data is collected or transmitted.</strong>
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="shadowlens-accept" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Accept & Continue</button>
                    <button id="shadowlens-dismiss" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Handle consent
        document.getElementById('shadowlens-accept').addEventListener('click', () => {
            this.consentGiven = true;
            banner.remove();
            this.scanPage();
        });
        
        document.getElementById('shadowlens-dismiss').addEventListener('click', () => {
            banner.remove();
        });
    }

    async scanPage() {
        if (!this.consentGiven) return;
        
        try {
            const scanData = this.collectPageData();
            const result = await this.sendToBackend(scanData);
            
            if (result) {
                this.handleScanResult(result);
                this.storeScanHistory(result);
            }
        } catch (error) {
            console.error('ShadowLens scan error:', error);
            this.performOfflineAnalysis();
        }
    }

    collectPageData() {
        const url = window.location.href;
        const forms = this.detectForms();
        const text = this.extractVisibleText();
        const images = this.extractImageData();
        const riskIndicators = this.detectRiskIndicators();
        
        return {
            url: url,
            forms: forms,
            text: text,
            images: images,
            riskIndicators: riskIndicators
        };
    }

    detectForms() {
        const forms = [];
        const formElements = document.querySelectorAll('form');
        
        formElements.forEach(form => {
            const fields = [];
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                const fieldName = input.name || input.id || input.type;
                const fieldType = input.type || 'text';
                const isSensitive = this.isSensitiveField(fieldName, fieldType);
                
                fields.push({
                    name: fieldName,
                    type: fieldType,
                    sensitive: isSensitive
                });
            });
            
            if (fields.length > 0) {
                forms.push({ fields: fields });
            }
        });
        
        return forms;
    }

    isSensitiveField(name, type) {
        const sensitivePatterns = [
            /email/i, /password/i, /phone/i, /mobile/i, /address/i,
            /ssn/i, /social/i, /security/i, /id/i, /student/i,
            /name/i, /first/i, /last/i, /birth/i, /age/i,
            /income/i, /salary/i, /financial/i, /bank/i, /credit/i
        ];
        
        const sensitiveTypes = ['password', 'email', 'tel', 'date'];
        
        return sensitiveTypes.includes(type) || 
               sensitivePatterns.some(pattern => pattern.test(name));
    }

    extractVisibleText() {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, li');
        let text = '';
        
        textElements.forEach(element => {
            if (element.offsetParent !== null && element.textContent.trim()) {
                text += element.textContent.trim() + ' ';
            }
        });
        
        // Limit to 3000 characters
        return text.substring(0, 3000);
    }

    extractImageData() {
        const images = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach(img => {
            if (img.alt || img.src) {
                images.push({
                    alt: img.alt || '',
                    filename: img.src.split('/').pop() || ''
                });
            }
        });
        
        return images;
    }

    detectRiskIndicators() {
        const indicators = [];
        const pageText = document.body.innerText.toLowerCase();
        
        // Privacy terms
        const privacyTerms = [
            'personal information', 'data collection', 'tracking', 'cookies',
            'third party', 'advertising', 'marketing', 'analytics',
            'social security', 'ssn', 'income', 'financial'
        ];
        
        // Brand impersonation
        const brandTerms = [
            'google certified', 'microsoft certified', 'apple certified',
            'official partner', 'verified by', 'endorsed by'
        ];
        
        privacyTerms.forEach(term => {
            if (pageText.includes(term)) {
                indicators.push({
                    type: 'privacy_term',
                    term: term,
                    risk: 'high'
                });
            }
        });
        
        brandTerms.forEach(term => {
            if (pageText.includes(term)) {
                indicators.push({
                    type: 'brand_impersonation',
                    term: term,
                    risk: 'high'
                });
            }
        });
        
        return indicators;
    }

    async sendToBackend(data) {
        try {
            const response = await fetch(`${this.backendUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Backend error: ${response.status}`);
            }
        } catch (error) {
            console.error('Backend communication error:', error);
            return null;
        }
    }

    handleScanResult(result) {
        const riskScore = result.risk_score || 0;
        const recommendation = result.recommendation || 'Unknown';
        
        // Show warning for high-risk sites
        if (riskScore >= 7) {
            this.showHighRiskWarning(result);
        }
        
        // Update extension badge
        this.updateBadge(riskScore);
        
        // Store result
        this.storeScanHistory(result);
    }

    showHighRiskWarning(result) {
        const warning = document.createElement('div');
        warning.id = 'shadowlens-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10001;
            max-width: 300px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        warning.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
                <strong>High Risk Detected</strong>
            </div>
            <p style="margin: 0 0 10px 0; font-size: 14px;">
                This site has a risk score of ${result.risk_score}/10
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">
                ${result.red_flags ? result.red_flags.slice(0, 2).join(', ') : 'Multiple privacy concerns detected'}
            </p>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
            ">×</button>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    updateBadge(riskScore) {
        // Send message to background script to update badge
        chrome.runtime.sendMessage({
            action: 'updateBadge',
            riskScore: riskScore
        });
    }

    storeScanHistory(result) {
        const scanRecord = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            riskScore: result.risk_score,
            recommendation: result.recommendation,
            redFlags: result.red_flags || []
        };
        
        this.scanHistory.push(scanRecord);
        
        // Store in chrome.storage
        chrome.storage.local.get(['scanHistory'], (data) => {
            const history = data.scanHistory || [];
            history.push(scanRecord);
            
            // Keep only last 50 scans
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }
            
            chrome.storage.local.set({ scanHistory: history });
        });
    }

    performOfflineAnalysis() {
        // Basic offline analysis when backend is unavailable
        const forms = this.detectForms();
        const sensitiveFields = forms.reduce((count, form) => {
            return count + form.fields.filter(f => f.sensitive).length;
        }, 0);
        
        const riskIndicators = this.detectRiskIndicators();
        const riskScore = Math.min(10, sensitiveFields * 2 + riskIndicators.length * 2);
        
        const offlineResult = {
            risk_score: riskScore,
            recommendation: riskScore >= 7 ? 'Dangerous' : riskScore >= 4 ? 'Caution' : 'Safe',
            red_flags: [
                `Found ${sensitiveFields} sensitive form fields`,
                `Found ${riskIndicators.length} risk indicators`
            ],
            ai_model: 'offline-analysis'
        };
        
        this.handleScanResult(offlineResult);
    }
}

// Initialize scanner when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ShadowLensScanner();
    });
} else {
    new ShadowLensScanner();
} 