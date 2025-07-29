#!/usr/bin/env python3
"""
ShadowLens AI Backend
Flask application for privacy threat analysis
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Configuration
class Config:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    MISTRAL_MODEL_PATH = os.getenv('MISTRAL_MODEL_PATH', 'mistralai/Mistral-7B-Instruct-v0.2')
    USE_GEMINI = bool(GEMINI_API_KEY)
    USE_MISTRAL = not USE_GEMINI
    MAX_TEXT_LENGTH = 3000
    RISK_THRESHOLDS = {
        'safe': 3,
        'caution': 6,
        'dangerous': 7
    }

# Initialize AI models
class AIAnalyzer:
    def __init__(self):
        self.config = Config()
        self.gemini_model = None
        self.mistral_model = None
        self.mistral_tokenizer = None
        
        if self.config.USE_GEMINI:
            self.init_gemini()
        elif self.config.USE_MISTRAL:
            self.init_mistral()
    
    def init_gemini(self):
        """Initialize Gemini Pro model"""
        try:
            genai.configure(api_key=self.config.GEMINI_API_KEY)
            # Try different model names
            try:
                self.gemini_model = genai.GenerativeModel('gemini-1.5-pro')
                logger.info("✅ Gemini 1.5 Pro initialized successfully")
            except:
                try:
                    self.gemini_model = genai.GenerativeModel('gemini-1.0-pro')
                    logger.info("✅ Gemini 1.0 Pro initialized successfully")
                except:
                    self.gemini_model = genai.GenerativeModel('gemini-pro')
                    logger.info("✅ Gemini Pro initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            self.config.USE_GEMINI = False
            self.config.USE_MISTRAL = True
    
    def init_mistral(self):
        """Initialize Mistral model for offline analysis"""
        try:
            logger.info("🔄 Loading Mistral model...")
            self.mistral_tokenizer = AutoTokenizer.from_pretrained(self.config.MISTRAL_MODEL_PATH)
            self.mistral_model = AutoModelForCausalLM.from_pretrained(
                self.config.MISTRAL_MODEL_PATH,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            logger.info("✅ Mistral model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load Mistral model: {e}")
            logger.info("⚠️ Falling back to rule-based analysis")
    
    def analyze_with_gemini(self, data):
        """Analyze data using Gemini Pro"""
        try:
            prompt = self.build_gemini_prompt(data)
            response = self.gemini_model.generate_content(prompt)
            
            # Parse structured response
            analysis = self.parse_ai_response(response.text)
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Gemini analysis failed: {e}")
            return self.fallback_analysis(data)
    
    def analyze_with_mistral(self, data):
        """Analyze data using Mistral model"""
        try:
            prompt = self.build_mistral_prompt(data)
            
            # Tokenize and generate
            inputs = self.mistral_tokenizer(prompt, return_tensors="pt")
            with torch.no_grad():
                outputs = self.mistral_model.generate(
                    **inputs,
                    max_new_tokens=500,
                    temperature=0.7,
                    do_sample=True
                )
            
            response = self.mistral_tokenizer.decode(outputs[0], skip_special_tokens=True)
            analysis = self.parse_ai_response(response)
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Mistral analysis failed: {e}")
            return self.fallback_analysis(data)
    
    def build_gemini_prompt(self, data):
        """Build prompt for Gemini analysis"""
        return f"""
You are ShadowLens, an AI privacy guardian for EdTech platforms. Analyze this website data for privacy threats and brand impersonation.

WEBSITE DATA:
URL: {data.get('url', 'Unknown')}
Forms: {len(data.get('forms', []))} forms detected
Sensitive Fields: {self.count_sensitive_fields(data.get('forms', []))}
Text Length: {len(data.get('text', ''))} characters
Images: {len(data.get('images', []))} images
Risk Indicators: {len(data.get('riskIndicators', []))} indicators

FORM DETAILS:
{self.format_forms(data.get('forms', []))}

TEXT CONTENT (first 1000 chars):
{data.get('text', '')[:1000]}

RISK INDICATORS:
{self.format_risk_indicators(data.get('riskIndicators', []))}

ANALYSIS REQUIREMENTS:
1. Identify privacy threats (excessive data collection, vague terms)
2. Detect brand impersonation (fake logos, unauthorized claims)
3. Assess data collection practices
4. Calculate risk score (1-10)
5. Provide recommendation (Safe/Caution/Dangerous)
6. List specific red flags

RESPONSE FORMAT (JSON):
{{
    "summary": "Brief analysis summary",
    "risk_score": <1-10>,
    "recommendation": "Safe|Caution|Dangerous",
    "red_flags": ["flag1", "flag2", ...],
    "privacy_threats": ["threat1", "threat2", ...],
    "brand_impersonation": ["impersonation1", "impersonation2", ...],
    "data_collection_analysis": "Analysis of data collection practices"
}}
"""
    
    def build_mistral_prompt(self, data):
        """Build prompt for Mistral analysis"""
        return f"""<s>[INST] You are ShadowLens, an AI privacy guardian for EdTech platforms. Analyze this website data for privacy threats and brand impersonation.

WEBSITE DATA:
URL: {data.get('url', 'Unknown')}
Forms: {len(data.get('forms', []))} forms detected
Sensitive Fields: {self.count_sensitive_fields(data.get('forms', []))}
Text Length: {len(data.get('text', ''))} characters
Images: {len(data.get('images', []))} images
Risk Indicators: {len(data.get('riskIndicators', []))} indicators

FORM DETAILS:
{self.format_forms(data.get('forms', []))}

TEXT CONTENT (first 1000 chars):
{data.get('text', '')[:1000]}

RISK INDICATORS:
{self.format_risk_indicators(data.get('riskIndicators', []))}

ANALYSIS REQUIREMENTS:
1. Identify privacy threats (excessive data collection, vague terms)
2. Detect brand impersonation (fake logos, unauthorized claims)
3. Assess data collection practices
4. Calculate risk score (1-10)
5. Provide recommendation (Safe/Caution/Dangerous)
6. List specific red flags

RESPONSE FORMAT (JSON):
{{
    "summary": "Brief analysis summary",
    "risk_score": <1-10>,
    "recommendation": "Safe|Caution|Dangerous",
    "red_flags": ["flag1", "flag2", ...],
    "privacy_threats": ["threat1", "threat2", ...],
    "brand_impersonation": ["impersonation1", "impersonation2", ...],
    "data_collection_analysis": "Analysis of data collection practices"
}}
[/INST]</s>"""
    
    def count_sensitive_fields(self, forms):
        """Count sensitive fields across all forms"""
        count = 0
        for form in forms:
            for field in form.get('fields', []):
                if field.get('sensitive', False):
                    count += 1
        return count
    
    def format_forms(self, forms):
        """Format forms for prompt"""
        if not forms:
            return "No forms detected"
        
        formatted = []
        for i, form in enumerate(forms):
            fields = []
            for field in form.get('fields', []):
                field_info = f"{field.get('type', 'unknown')}: {field.get('name', 'unnamed')}"
                if field.get('sensitive'):
                    field_info += " (SENSITIVE)"
                fields.append(field_info)
            
            formatted.append(f"Form {i+1}: {', '.join(fields)}")
        
        return "\n".join(formatted)
    
    def format_risk_indicators(self, indicators):
        """Format risk indicators for prompt"""
        if not indicators:
            return "No risk indicators detected"
        
        formatted = []
        for indicator in indicators:
            formatted.append(f"- {indicator.get('type', 'unknown')}: {indicator.get('term', 'unknown')} ({indicator.get('risk', 'unknown')} risk)")
        
        return "\n".join(formatted)
    
    def parse_ai_response(self, response_text):
        """Parse AI response and extract structured data"""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                analysis = json.loads(json_str)
                
                # Validate required fields
                required_fields = ['summary', 'risk_score', 'recommendation', 'red_flags']
                for field in required_fields:
                    if field not in analysis:
                        analysis[field] = self.get_default_value(field)
                
                return analysis
            else:
                # Fallback parsing
                return self.parse_fallback_response(response_text)
                
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse AI response: {e}")
            return self.parse_fallback_response(response_text)
    
    def parse_fallback_response(self, response_text):
        """Parse response when JSON parsing fails"""
        # Simple keyword-based parsing
        risk_score = 5  # Default
        recommendation = "Caution"
        red_flags = []
        
        # Extract risk score
        if "risk_score" in response_text.lower():
            import re
            score_match = re.search(r'risk_score["\s]*:["\s]*(\d+)', response_text, re.IGNORECASE)
            if score_match:
                risk_score = int(score_match.group(1))
        
        # Extract recommendation
        if "dangerous" in response_text.lower():
            recommendation = "Dangerous"
            risk_score = max(risk_score, 7)
        elif "safe" in response_text.lower():
            recommendation = "Safe"
            risk_score = min(risk_score, 3)
        
        # Extract red flags
        if "red_flags" in response_text.lower() or "flag" in response_text.lower():
            # Simple extraction of potential flags
            lines = response_text.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['privacy', 'data', 'collection', 'brand', 'fake', 'unauthorized']):
                    red_flags.append(line.strip())
        
        return {
            "summary": "AI analysis completed",
            "risk_score": risk_score,
            "recommendation": recommendation,
            "red_flags": red_flags[:5],  # Limit to 5 flags
            "privacy_threats": [],
            "brand_impersonation": [],
            "data_collection_analysis": "Analysis completed"
        }
    
    def get_default_value(self, field):
        """Get default value for missing fields"""
        defaults = {
            'summary': 'Analysis completed',
            'risk_score': 5,
            'recommendation': 'Caution',
            'red_flags': [],
            'privacy_threats': [],
            'brand_impersonation': [],
            'data_collection_analysis': 'Analysis completed'
        }
        return defaults.get(field, '')
    
    def fallback_analysis(self, data):
        """Enhanced rule-based fallback analysis with website type detection"""
        risk_score = 1
        red_flags = []
        privacy_threats = []
        brand_impersonation = []
        
        url = data.get('url', '').lower()
        text = data.get('text', '').lower()
        forms = data.get('forms', [])
        indicators = data.get('riskIndicators', [])
        is_legal_document = data.get('isLegalDocument', False)
        document_type = data.get('documentType', '')
        
        # Special analysis for legal documents
        if is_legal_document:
            print(f"📋 Analyzing legal document: {document_type}")
            
            # Base risk for legal documents
            if 'privacy' in document_type:
                risk_score += 2  # Privacy policies have inherent data collection
                red_flags.append("Privacy policy detected - data collection practices")
            elif 'terms' in document_type:
                risk_score += 1  # Terms of service have user rights implications
                red_flags.append("Terms of service detected - user rights analysis")
            
            # Analyze legal document content
            legal_risk_terms = [
                'disclaim all liability', 'not responsible', 'use at your own risk',
                'no warranty', 'as is', 'without limitation', 'broad rights',
                'perpetual license', 'irrevocable', 'transferable', 'sublicensable',
                'right to modify', 'right to terminate', 'right to suspend',
                'arbitration clause', 'class action waiver', 'governing law'
            ]
            
            for term in legal_risk_terms:
                if term in text:
                    risk_score += 2
                    red_flags.append(f"Concerning legal term: '{term}'")
            
            # Data sharing analysis for legal documents
            sharing_terms = [
                'share with third parties', 'sell your data', 'data brokers',
                'advertising partners', 'marketing partners', 'analytics partners'
            ]
            
            for term in sharing_terms:
                if term in text:
                    risk_score += 3
                    privacy_threats.append(f"Data sharing clause: '{term}'")
            
            # User rights analysis
            user_rights_terms = [
                'right to delete', 'right to access', 'data portability',
                'opt-out', 'withdraw consent', 'data subject rights'
            ]
            
            positive_rights = 0
            for term in user_rights_terms:
                if term in text:
                    positive_rights += 1
            
            if positive_rights >= 3:
                risk_score -= 1  # Good user rights reduce risk
                red_flags.append(f"Good user rights protection: {positive_rights} rights found")
        
        # Website type detection
        website_type = self.detect_website_type(url, text)
        
        # Base risk based on website type (for non-legal documents)
        if not is_legal_document:
            if 'social' in website_type or 'instagram' in url or 'facebook' in url or 'twitter' in url:
                risk_score += 3  # Social media sites have higher privacy risks
                red_flags.append("Social media platform detected - high data collection risk")
            elif 'educational' in website_type or 'course' in website_type or 'learn' in website_type:
                risk_score += 1  # Educational sites typically have moderate risks
            elif 'banking' in website_type or 'financial' in website_type:
                risk_score += 4  # Financial sites have very high risks
                red_flags.append("Financial website detected - extremely sensitive data")
            elif 'shopping' in website_type or 'ecommerce' in website_type:
                risk_score += 2  # Shopping sites have moderate-high risks
                red_flags.append("E-commerce website detected - payment data collection")
        
        # Analyze forms more intelligently
        sensitive_fields = 0
        payment_fields = 0
        personal_info_fields = 0
        
        for form in forms:
            for field in form.get('fields', []):
                field_name = field.get('name', '').lower()
                field_type = field.get('type', '').lower()
                
                if field.get('sensitive', False):
                    sensitive_fields += 1
                    
                    # Categorize sensitive fields
                    if any(term in field_name for term in ['card', 'credit', 'payment', 'paypal', 'stripe']):
                        payment_fields += 1
                        privacy_threats.append(f"Payment information field detected: {field_name}")
                    elif any(term in field_name for term in ['ssn', 'social', 'security', 'id', 'passport']):
                        personal_info_fields += 1
                        privacy_threats.append(f"Government ID field detected: {field_name}")
                    elif field_type == 'password':
                        privacy_threats.append("Password field detected")
                    elif field_type == 'email':
                        privacy_threats.append("Email collection field detected")
        
        # Adjust risk based on field types
        if payment_fields > 0:
            risk_score += min(payment_fields * 3, 6)
            red_flags.append(f"Found {payment_fields} payment-related fields")
        
        if personal_info_fields > 0:
            risk_score += min(personal_info_fields * 4, 8)
            red_flags.append(f"Found {personal_info_fields} government ID fields")
        
        if sensitive_fields > 0:
            risk_score += min(sensitive_fields, 3)
        
        # Analyze risk indicators with context
        if indicators:
            risk_score += len(indicators)
            for indicator in indicators:
                if indicator.get('type') == 'privacy_term':
                    privacy_threats.append(f"Privacy term found: {indicator.get('term')}")
                elif indicator.get('type') == 'brand_impersonation':
                    brand_impersonation.append(f"Brand impersonation: {indicator.get('term')}")
                elif indicator.get('type') == 'concerning_legal_term':
                    red_flags.append(f"Concerning legal term: {indicator.get('term')}")
                elif indicator.get('type') == 'data_sharing':
                    privacy_threats.append(f"Data sharing clause: {indicator.get('term')}")
        
        # Analyze text content for suspicious patterns
        suspicious_patterns = [
            'urgent', 'limited time', 'act now', 'exclusive offer',
            'guaranteed', '100% free', 'no risk', 'instant access',
            'government grant', 'tax refund', 'inheritance'
        ]
        
        for pattern in suspicious_patterns:
            if pattern in text:
                risk_score += 1
                red_flags.append(f"Suspicious language detected: '{pattern}'")
        
        # Check for excessive data collection
        text_length = len(data.get('text', ''))
        if text_length > 5000:
            risk_score += 1
            red_flags.append("Extensive content detected - potential data mining")
        
        # Check for third-party tracking indicators
        tracking_indicators = ['google analytics', 'facebook pixel', 'tracking', 'cookies']
        for indicator in tracking_indicators:
            if indicator in text:
                risk_score += 1
                privacy_threats.append(f"Third-party tracking detected: {indicator}")
        
        # Determine recommendation with more granularity
        if risk_score >= 8:
            recommendation = "Dangerous"
        elif risk_score >= 6:
            recommendation = "High Risk"
        elif risk_score >= 4:
            recommendation = "Caution"
        elif risk_score >= 2:
            recommendation = "Moderate"
        else:
            recommendation = "Safe"
        
        analysis_summary = f"Enhanced analysis completed"
        if is_legal_document:
            analysis_summary += f" - Legal document type: {document_type}"
        else:
            analysis_summary += f" - Website type: {website_type}"
        
        return {
            "summary": analysis_summary,
            "risk_score": min(risk_score, 10),
            "recommendation": recommendation,
            "red_flags": red_flags,
            "privacy_threats": privacy_threats,
            "brand_impersonation": brand_impersonation,
            "data_collection_analysis": f"Detected {sensitive_fields} sensitive fields, {len(indicators)} risk indicators",
            "website_type": website_type,
            "document_type": document_type if is_legal_document else None,
            "is_legal_document": is_legal_document
        }
    
    def detect_website_type(self, url, text):
        """Detect the type of website based on URL and content"""
        url_lower = url.lower()
        text_lower = text.lower()
        
        # Social media detection
        if any(social in url_lower for social in ['instagram', 'facebook', 'twitter', 'tiktok', 'snapchat', 'linkedin']):
            return "social_media"
        
        # Educational detection
        if any(edu in url_lower for edu in ['coursera', 'edx', 'khanacademy', 'udemy', 'mit.edu', 'stanford.edu', 'harvard.edu', 'course', 'learn', 'education']):
            return "educational"
        
        # Financial detection
        if any(fin in url_lower for fin in ['bank', 'chase', 'wellsfargo', 'paypal', 'stripe', 'financial', 'credit', 'loan']):
            return "financial"
        
        # E-commerce detection
        if any(shop in url_lower for shop in ['amazon', 'ebay', 'shop', 'store', 'buy', 'purchase', 'cart']):
            return "ecommerce"
        
        # Government detection
        if any(gov in url_lower for gov in ['gov', 'government', 'irs', 'ssa']):
            return "government"
        
        # Healthcare detection
        if any(health in url_lower for health in ['health', 'medical', 'doctor', 'hospital', 'clinic']):
            return "healthcare"
        
        # Content analysis for type detection
        if any(term in text_lower for term in ['course', 'lesson', 'learn', 'education', 'university', 'college']):
            return "educational"
        elif any(term in text_lower for term in ['shop', 'buy', 'purchase', 'price', 'sale', 'discount']):
            return "ecommerce"
        elif any(term in text_lower for term in ['bank', 'account', 'payment', 'credit', 'loan']):
            return "financial"
        
        return "general"

# Initialize AI analyzer
analyzer = AIAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ai_model': 'gemini' if Config.USE_GEMINI else 'mistral' if analyzer.mistral_model else 'rule-based'
    })

@app.route('/analyze', methods=['POST'])
def analyze_website():
    """Main analysis endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        logger.info(f"🔍 Analyzing website: {data.get('url', 'Unknown')}")
        
        # Validate required fields
        required_fields = ['url', 'forms', 'text']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Truncate text if too long
        if len(data.get('text', '')) > Config.MAX_TEXT_LENGTH:
            data['text'] = data['text'][:Config.MAX_TEXT_LENGTH]
        
        # Perform AI analysis
        if Config.USE_GEMINI and analyzer.gemini_model:
            analysis = analyzer.analyze_with_gemini(data)
        elif Config.USE_MISTRAL and analyzer.mistral_model:
            analysis = analyzer.analyze_with_mistral(data)
        else:
            analysis = analyzer.fallback_analysis(data)
        
        # Add metadata
        analysis['timestamp'] = datetime.now().isoformat()
        analysis['url'] = data.get('url')
        analysis['ai_model'] = 'gemini' if Config.USE_GEMINI else 'mistral' if analyzer.mistral_model else 'rule-based'
        
        logger.info(f"✅ Analysis complete - Risk Score: {analysis.get('risk_score', 0)}/10")
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/config', methods=['GET'])
def get_config():
    """Get current configuration"""
    return jsonify({
        'use_gemini': Config.USE_GEMINI,
        'use_mistral': Config.USE_MISTRAL,
        'gemini_available': bool(analyzer.gemini_model),
        'mistral_available': bool(analyzer.mistral_model),
        'max_text_length': Config.MAX_TEXT_LENGTH,
        'risk_thresholds': Config.RISK_THRESHOLDS
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting ShadowLens AI Backend on port {port}")
    logger.info(f"🤖 AI Model: {'Gemini Pro' if Config.USE_GEMINI else 'Mistral' if Config.USE_MISTRAL else 'Rule-based'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 