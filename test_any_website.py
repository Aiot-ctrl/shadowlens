#!/usr/bin/env python3
"""
ShadowLens - Test Any Educational Website
Real-time webscraping and privacy analysis
"""

import requests
import json
import time
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import re
import subprocess
import sys

def print_header():
    print("🔒 ShadowLens - Test Any Educational Website")
    print("=" * 60)
    print("Real-time webscraping and privacy analysis")
    print("=" * 60)
    print()

def install_selenium():
    """Install selenium if not available"""
    try:
        import selenium
        return True
    except ImportError:
        print("📦 Installing selenium for better website analysis...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "selenium", "webdriver-manager"])
        return True

def scrape_website(url):
    """Scrape any educational website and extract data using multiple methods"""
    print(f"🌐 Scraping: {url}")
    print("-" * 40)
    
    # Check if this is a legal document URL
    legal_indicators = ['privacy', 'terms', 'policy', 'legal', 'tos', 'agreement']
    if any(indicator in url.lower() for indicator in legal_indicators):
        print("📋 Detected legal document URL - using specialized analysis...")
        return scrape_legal_documents(url)
    
    try:
        # Try basic requests first
        basic_data = scrape_with_requests(url)
        
        # If basic scraping gets no content, try with selenium
        if not basic_data or len(basic_data.get('text', '')) < 100:
            print("🔄 Basic scraping got limited content, trying with browser simulation...")
            enhanced_data = scrape_with_selenium(url)
            if enhanced_data and len(enhanced_data.get('text', '')) > len(basic_data.get('text', '')):
                basic_data = enhanced_data
        
        if not basic_data:
            print("❌ Failed to scrape website content")
            return None
            
        return basic_data
        
    except Exception as e:
        print(f"❌ Scraping failed: {e}")
        return None

def scrape_with_requests(url):
    """Scrape using requests library"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }
        
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        return extract_data_from_soup(soup, url)
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            print(f"⚠️ Site blocked basic requests (403), trying with browser simulation...")
            return None
        else:
            print(f"❌ HTTP Error: {e}")
            return None
    except Exception as e:
        print(f"❌ Requests scraping failed: {e}")
        return None

def scrape_with_selenium(url):
    """Scrape using Selenium for JavaScript-heavy sites"""
    try:
        install_selenium()
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from webdriver_manager.chrome import ChromeDriverManager
        
        print("🌐 Launching browser for JavaScript content...")
        
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Fix the WebDriver initialization
        driver = webdriver.Chrome(service=webdriver.chrome.service.Service(ChromeDriverManager().install()), options=chrome_options)
        
        try:
            driver.get(url)
            time.sleep(5)  # Wait for JavaScript to load
            
            # Try to wait for content to load
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
            except:
                pass
            
            # Get the page source after JavaScript execution
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            return extract_data_from_soup(soup, url)
            
        finally:
            driver.quit()
            
    except Exception as e:
        print(f"❌ Selenium scraping failed: {e}")
        return None

def scrape_legal_documents(url):
    """Specialized scraping for privacy policies and terms of service"""
    print(f"📋 Analyzing Legal Documents: {url}")
    print("-" * 50)
    
    try:
        # Enhanced headers for legal document sites
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract comprehensive legal text
        legal_text = ""
        
        # Look for common legal document containers
        legal_selectors = [
            'main', 'article', '.content', '.legal-content', '.terms', '.privacy',
            '.policy', '.document', '.text-content', '.body-content'
        ]
        
        for selector in legal_selectors:
            elements = soup.select(selector)
            for element in elements:
                legal_text += element.get_text() + " "
        
        # If no specific containers found, get all text
        if len(legal_text.strip()) < 500:
            legal_text = soup.get_text()
        
        # Clean up the text
        legal_text = re.sub(r'\s+', ' ', legal_text).strip()
        legal_text = legal_text[:15000]  # Increased limit for legal documents
        
        # Extract forms (if any)
        forms = []
        for form in soup.find_all('form'):
            fields = []
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                field_name = input_tag.get('name') or input_tag.get('id') or input_tag.get('placeholder') or input_tag.get('type', 'text')
                field_type = input_tag.get('type', 'text')
                field_placeholder = input_tag.get('placeholder', '')
                
                # Enhanced sensitive field detection for legal documents
                sensitive_patterns = [
                    r'email', r'password', r'phone', r'mobile', r'address',
                    r'ssn', r'social', r'security', r'id', r'student',
                    r'name', r'first', r'last', r'birth', r'age',
                    r'income', r'salary', r'financial', r'bank', r'credit',
                    r'card', r'payment', r'paypal', r'stripe', r'venmo',
                    r'account', r'login', r'username', r'passport', r'driver',
                    r'consent', r'agreement', r'accept', r'opt-in', r'opt-out'
                ]
                
                is_sensitive = any(re.search(pattern, field_name.lower()) for pattern in sensitive_patterns)
                is_sensitive = is_sensitive or any(re.search(pattern, field_placeholder.lower()) for pattern in sensitive_patterns)
                is_sensitive = is_sensitive or field_type in ['password', 'email', 'tel', 'date', 'file', 'number', 'checkbox']
                
                fields.append({
                    'name': field_name,
                    'type': field_type,
                    'placeholder': field_placeholder,
                    'sensitive': is_sensitive
                })
            
            if fields:
                forms.append({'fields': fields})
        
        # Enhanced risk indicator detection for legal documents
        risk_indicators = []
        legal_text_lower = legal_text.lower()
        
        # Privacy and data collection terms specific to legal documents
        privacy_terms = [
            'personal information', 'data collection', 'tracking', 'cookies',
            'third party', 'advertising', 'marketing', 'analytics',
            'social security', 'ssn', 'income', 'financial',
            'privacy policy', 'terms of service', 'data sharing',
            'personal data', 'user data', 'profile', 'account',
            'consent', 'opt-in', 'opt-out', 'data retention',
            'data processing', 'data transfer', 'international transfer',
            'right to delete', 'right to access', 'data portability',
            'automated decision making', 'profiling', 'surveillance'
        ]
        
        # Concerning legal terms
        concerning_terms = [
            'disclaim all liability', 'not responsible', 'use at your own risk',
            'no warranty', 'as is', 'without limitation', 'broad rights',
            'perpetual license', 'irrevocable', 'transferable', 'sublicensable',
            'right to modify', 'right to terminate', 'right to suspend',
            'arbitration clause', 'class action waiver', 'governing law',
            'jurisdiction', 'venue', 'choice of law', 'binding arbitration'
        ]
        
        # Data sharing and third-party terms
        sharing_terms = [
            'share with third parties', 'sell your data', 'data brokers',
            'advertising partners', 'marketing partners', 'analytics partners',
            'social media integration', 'third-party cookies', 'tracking pixels',
            'beacons', 'fingerprinting', 'cross-site tracking'
        ]
        
        # Check for privacy terms
        for term in privacy_terms:
            if term in legal_text_lower:
                risk_indicators.append({
                    'type': 'privacy_term',
                    'term': term,
                    'risk': 'high'
                })
        
        # Check for concerning legal terms
        for term in concerning_terms:
            if term in legal_text_lower:
                risk_indicators.append({
                    'type': 'concerning_legal_term',
                    'term': term,
                    'risk': 'high'
                })
        
        # Check for data sharing terms
        for term in sharing_terms:
            if term in legal_text_lower:
                risk_indicators.append({
                    'type': 'data_sharing',
                    'term': term,
                    'risk': 'high'
                })
        
        # Document type detection
        document_type = detect_document_type(url, legal_text)
        
        scraped_data = {
            'url': url,
            'forms': forms,
            'text': legal_text,
            'images': [],  # Legal documents typically don't have relevant images
            'riskIndicators': risk_indicators,
            'documentType': document_type,
            'isLegalDocument': True
        }
        
        print(f"✅ Legal Document Analysis Complete!")
        print(f"   📄 Document type: {document_type}")
        print(f"   📝 Text length: {len(legal_text)} characters")
        print(f"   ⚠️ Risk indicators: {len(risk_indicators)}")
        print(f"   📋 Forms found: {len(forms)}")
        
        return scraped_data
        
    except Exception as e:
        print(f"❌ Legal document scraping failed: {e}")
        return None

def detect_document_type(url, text):
    """Detect the type of legal document"""
    url_lower = url.lower()
    text_lower = text.lower()
    
    # Privacy policy detection
    if any(term in url_lower for term in ['privacy', 'privacy-policy', 'privacy_policy']):
        return "privacy_policy"
    elif any(term in text_lower for term in ['privacy policy', 'data protection', 'personal information']):
        return "privacy_policy"
    
    # Terms of service detection
    if any(term in url_lower for term in ['terms', 'terms-of-service', 'terms_of_service', 'tos']):
        return "terms_of_service"
    elif any(term in text_lower for term in ['terms of service', 'terms and conditions', 'user agreement']):
        return "terms_of_service"
    
    # Cookie policy detection
    if any(term in url_lower for term in ['cookie', 'cookies']):
        return "cookie_policy"
    elif any(term in text_lower for term in ['cookie policy', 'cookie notice', 'tracking']):
        return "cookie_policy"
    
    # Data processing agreement
    if any(term in text_lower for term in ['data processing agreement', 'dpa', 'gdpr']):
        return "data_processing_agreement"
    
    # General legal document
    if any(term in text_lower for term in ['legal', 'law', 'agreement', 'contract', 'policy']):
        return "legal_document"
    
    return "unknown_document"

def extract_data_from_soup(soup, url):
    """Extract comprehensive data from BeautifulSoup object"""
    
    # Extract forms with detailed analysis
    forms = []
    for form in soup.find_all('form'):
        fields = []
        for input_tag in form.find_all(['input', 'textarea', 'select']):
            field_name = input_tag.get('name') or input_tag.get('id') or input_tag.get('placeholder') or input_tag.get('type', 'text')
            field_type = input_tag.get('type', 'text')
            field_placeholder = input_tag.get('placeholder', '')
            
            # Enhanced sensitive field detection
            sensitive_patterns = [
                r'email', r'password', r'phone', r'mobile', r'address',
                r'ssn', r'social', r'security', r'id', r'student',
                r'name', r'first', r'last', r'birth', r'age',
                r'income', r'salary', r'financial', r'bank', r'credit',
                r'card', r'payment', r'paypal', r'stripe', r'venmo',
                r'account', r'login', r'username', r'passport', r'driver'
            ]
            
            is_sensitive = any(re.search(pattern, field_name.lower()) for pattern in sensitive_patterns)
            is_sensitive = is_sensitive or any(re.search(pattern, field_placeholder.lower()) for pattern in sensitive_patterns)
            is_sensitive = is_sensitive or field_type in ['password', 'email', 'tel', 'date', 'file', 'number']
            
            fields.append({
                'name': field_name,
                'type': field_type,
                'placeholder': field_placeholder,
                'sensitive': is_sensitive
            })
        
        if fields:
            forms.append({'fields': fields})
    
    # Extract comprehensive text content
    text_elements = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'li', 'a', 'button', 'label', 'title', 'meta'])
    text = ' '.join([elem.get_text().strip() for elem in text_elements if elem.get_text().strip()])
    
    # Also extract meta descriptions and titles
    meta_description = soup.find('meta', attrs={'name': 'description'})
    if meta_description:
        text += ' ' + meta_description.get('content', '')
    
    title = soup.find('title')
    if title:
        text += ' ' + title.get_text()
    
    text = text[:8000]  # Increased limit for comprehensive analysis
    
    # Extract images with alt text
    images = []
    for img in soup.find_all('img'):
        if img.get('alt') or img.get('src'):
            images.append({
                'alt': img.get('alt', ''),
                'src': img.get('src', ''),
                'filename': img.get('src', '').split('/')[-1] if img.get('src') else ''
            })
    
    # Enhanced risk indicator detection
    risk_indicators = []
    page_text_lower = text.lower()
    
    # Privacy and data collection terms
    privacy_terms = [
        'personal information', 'data collection', 'tracking', 'cookies',
        'third party', 'advertising', 'marketing', 'analytics',
        'social security', 'ssn', 'income', 'financial',
        'privacy policy', 'terms of service', 'data sharing',
        'personal data', 'user data', 'profile', 'account'
    ]
    
    # Brand impersonation and scam indicators
    brand_terms = [
        'google certified', 'microsoft certified', 'apple certified',
        'official partner', 'verified by', 'endorsed by',
        'government grant', 'tax refund', 'inheritance',
        'urgent', 'limited time', 'act now', 'exclusive offer',
        'guaranteed', '100% free', 'no risk', 'instant access',
        'click here', 'claim now', 'limited spots'
    ]
    
    # Payment and financial terms
    payment_terms = [
        'credit card', 'debit card', 'bank account', 'routing number',
        'account number', 'paypal', 'stripe', 'venmo', 'zelle',
        'bitcoin', 'cryptocurrency', 'wallet'
    ]
    
    # Check for privacy terms
    for term in privacy_terms:
        if term in page_text_lower:
            risk_indicators.append({
                'type': 'privacy_term',
                'term': term,
                'risk': 'high'
            })
    
    # Check for brand impersonation
    for term in brand_terms:
        if term in page_text_lower:
            risk_indicators.append({
                'type': 'brand_impersonation',
                'term': term,
                'risk': 'high'
            })
    
    # Check for payment terms
    for term in payment_terms:
        if term in page_text_lower:
            risk_indicators.append({
                'type': 'payment_collection',
                'term': term,
                'risk': 'high'
            })
    
    # Website type detection
    website_type = detect_website_type(url, text)
    
    scraped_data = {
        'url': url,
        'forms': forms,
        'text': text,
        'images': images,
        'riskIndicators': risk_indicators,
        'websiteType': website_type
    }
    
    print(f"✅ Scraping complete!")
    print(f"   📝 Forms found: {len(forms)}")
    print(f"   📄 Text length: {len(text)} characters")
    print(f"   🖼️ Images found: {len(images)}")
    print(f"   ⚠️ Risk indicators: {len(risk_indicators)}")
    print(f"   🌐 Website type: {website_type}")
    
    return scraped_data

def detect_website_type(url, text):
    """Detect website type based on URL and content"""
    url_lower = url.lower()
    text_lower = text.lower()
    
    # Social media detection
    if any(social in url_lower for social in ['instagram', 'facebook', 'twitter', 'tiktok', 'snapchat', 'linkedin', 'youtube']):
        return "social_media"
    
    # Educational detection
    if any(edu in url_lower for edu in ['coursera', 'edx', 'khanacademy', 'udemy', 'mit.edu', 'stanford.edu', 'harvard.edu', 'course', 'learn', 'education', 'university']):
        return "educational"
    
    # Financial detection
    if any(fin in url_lower for fin in ['bank', 'chase', 'wellsfargo', 'paypal', 'stripe', 'financial', 'credit', 'loan', 'mortgage']):
        return "financial"
    
    # E-commerce detection
    if any(shop in url_lower for shop in ['amazon', 'ebay', 'shop', 'store', 'buy', 'purchase', 'cart', 'walmart', 'target']):
        return "ecommerce"
    
    # Government detection
    if any(gov in url_lower for gov in ['gov', 'government', 'irs', 'ssa', '.gov']):
        return "government"
    
    # Healthcare detection
    if any(health in url_lower for health in ['health', 'medical', 'doctor', 'hospital', 'clinic', 'pharmacy']):
        return "healthcare"
    
    # Content analysis for type detection
    if any(term in text_lower for term in ['course', 'lesson', 'learn', 'education', 'university', 'college', 'student', 'academic']):
        return "educational"
    elif any(term in text_lower for term in ['shop', 'buy', 'purchase', 'price', 'sale', 'discount', 'cart', 'checkout']):
        return "ecommerce"
    elif any(term in text_lower for term in ['bank', 'account', 'payment', 'credit', 'loan', 'mortgage', 'financial']):
        return "financial"
    elif any(term in text_lower for term in ['post', 'share', 'follow', 'like', 'comment', 'profile', 'feed']):
        return "social_media"
    
    return "general"

def analyze_with_backend(scraped_data):
    """Send scraped data to backend for AI analysis"""
    print(f"\n🧠 Analyzing with AI Backend")
    print("-" * 30)
    
    try:
        response = requests.post(
            'http://localhost:5000/analyze',
            json=scraped_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Analysis complete!")
            print(f"   🎯 Risk Score: {result.get('risk_score', 'N/A')}/10")
            print(f"   📋 Recommendation: {result.get('recommendation', 'N/A')}")
            
            if result.get('red_flags'):
                print(f"   🚩 Red Flags ({len(result['red_flags'])}):")
                for i, flag in enumerate(result['red_flags'][:5], 1):
                    print(f"      {i}. {flag}")
            
            if result.get('privacy_threats'):
                print(f"   🔒 Privacy Threats ({len(result['privacy_threats'])}):")
                for threat in result['privacy_threats'][:3]:
                    print(f"      • {threat}")
            
            if result.get('brand_impersonation'):
                print(f"   🎭 Brand Impersonation ({len(result['brand_impersonation'])}):")
                for impersonation in result['brand_impersonation'][:3]:
                    print(f"      • {impersonation}")
            
            return result
        else:
            print(f"❌ Backend error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return None

def show_detailed_results(scraped_data, analysis_result):
    """Show detailed analysis results"""
    print(f"\n📊 Detailed Analysis Results")
    print("=" * 50)
    
    # Website type detection
    if analysis_result and 'website_type' in analysis_result:
        website_type = analysis_result['website_type']
        print(f"\n🌐 Website Type: {website_type.upper()}")
        
        # Show type-specific information
        if 'social_media' in website_type:
            print(f"   ⚠️ Social media platforms typically collect extensive personal data")
        elif 'educational' in website_type:
            print(f"   📚 Educational sites usually have moderate privacy risks")
        elif 'financial' in website_type:
            print(f"   💰 Financial sites handle extremely sensitive data")
        elif 'ecommerce' in website_type:
            print(f"   🛒 E-commerce sites collect payment and personal information")
    
    # Document type for legal documents
    if analysis_result and 'document_type' in analysis_result and analysis_result['document_type']:
        document_type = analysis_result['document_type']
        print(f"\n📄 Document Type: {document_type.upper()}")
        
        if 'privacy_policy' in document_type:
            print(f"   📋 Privacy policies detail how your data is collected and used")
        elif 'terms_of_service' in document_type:
            print(f"   📜 Terms of service outline user rights and obligations")
        elif 'cookie_policy' in document_type:
            print(f"   🍪 Cookie policies explain tracking and data collection")
    
    # Form analysis
    print(f"\n📝 Form Analysis:")
    total_fields = sum(len(form['fields']) for form in scraped_data['forms'])
    sensitive_fields = sum(
        sum(1 for field in form['fields'] if field['sensitive'])
        for form in scraped_data['forms']
    )
    
    print(f"   • Total forms: {len(scraped_data['forms'])}")
    print(f"   • Total fields: {total_fields}")
    print(f"   • Sensitive fields: {sensitive_fields}")
    
    if sensitive_fields > 0:
        print(f"   ⚠️ WARNING: {sensitive_fields} sensitive fields detected!")
        
        # Show specific sensitive field types
        payment_fields = 0
        personal_info_fields = 0
        for form in scraped_data['forms']:
            for field in form['fields']:
                if field['sensitive']:
                    field_name = field['name'].lower()
                    if any(term in field_name for term in ['card', 'credit', 'payment', 'paypal']):
                        payment_fields += 1
                    elif any(term in field_name for term in ['ssn', 'social', 'security', 'id']):
                        personal_info_fields += 1
        
        if payment_fields > 0:
            print(f"      💳 Payment fields: {payment_fields}")
        if personal_info_fields > 0:
            print(f"      🆔 Government ID fields: {personal_info_fields}")
    
    # Text analysis
    print(f"\n📄 Content Analysis:")
    print(f"   • Text length: {len(scraped_data['text'])} characters")
    print(f"   • Risk indicators: {len(scraped_data['riskIndicators'])}")
    
    # Detailed risk indicator analysis
    if scraped_data['riskIndicators']:
        print(f"\n⚠️ DETAILED RISK INDICATORS FOUND:")
        print("-" * 40)
        
        # Categorize risk indicators
        privacy_terms = []
        concerning_legal = []
        data_sharing = []
        suspicious_language = []
        payment_terms = []
        
        for indicator in scraped_data['riskIndicators']:
            indicator_type = indicator.get('type', '')
            term = indicator.get('term', '')
            
            if indicator_type == 'privacy_term':
                privacy_terms.append(term)
            elif indicator_type == 'concerning_legal_term':
                concerning_legal.append(term)
            elif indicator_type == 'data_sharing':
                data_sharing.append(term)
            elif indicator_type == 'suspicious_language':
                suspicious_language.append(term)
            elif indicator_type == 'payment_collection':
                payment_terms.append(term)
        
        # Display categorized indicators with explanations
        if privacy_terms:
            print(f"\n🔒 PRIVACY & DATA COLLECTION TERMS ({len(privacy_terms)}):")
            for term in privacy_terms:
                if 'cookies' in term:
                    print(f"   • {term} - Tracks your browsing behavior")
                elif 'marketing' in term:
                    print(f"   • {term} - Uses your data for advertising")
                elif 'analytics' in term:
                    print(f"   • {term} - Monitors your usage patterns")
                elif 'user data' in term or 'personal data' in term:
                    print(f"   • {term} - Collects your personal information")
                elif 'profile' in term:
                    print(f"   • {term} - Creates detailed user profiles")
                else:
                    print(f"   • {term}")
        
        if concerning_legal:
            print(f"\n⚖️ CONCERNING LEGAL TERMS ({len(concerning_legal)}):")
            for term in concerning_legal:
                if 'disclaim' in term or 'not responsible' in term:
                    print(f"   • {term} - Limits company liability")
                elif 'arbitration' in term:
                    print(f"   • {term} - Prevents class action lawsuits")
                elif 'broad rights' in term or 'perpetual license' in term:
                    print(f"   • {term} - Gives extensive rights to your data")
                else:
                    print(f"   • {term}")
        
        if data_sharing:
            print(f"\n📤 DATA SHARING CLAUSES ({len(data_sharing)}):")
            for term in data_sharing:
                if 'third parties' in term:
                    print(f"   • {term} - Sells data to other companies")
                elif 'data brokers' in term:
                    print(f"   • {term} - Sells to data brokers")
                elif 'advertising partners' in term:
                    print(f"   • {term} - Shares with advertisers")
                else:
                    print(f"   • {term}")
        
        if payment_terms:
            print(f"\n💳 PAYMENT DATA COLLECTION ({len(payment_terms)}):")
            for term in payment_terms:
                print(f"   • {term} - Collects financial information")
        
        if suspicious_language:
            print(f"\n🚨 SUSPICIOUS LANGUAGE ({len(suspicious_language)}):")
            for term in suspicious_language:
                print(f"   • {term} - Potential scam indicators")
    
    # AI Analysis
    if analysis_result:
        print(f"\n🤖 AI Analysis:")
        risk_score = analysis_result.get('risk_score', 0)
        recommendation = analysis_result.get('recommendation', 'Unknown')
        
        print(f"   • Risk Score: {risk_score}/10")
        print(f"   • Recommendation: {recommendation}")
        
        if risk_score >= 8:
            print(f"   🔴 DANGEROUS: This site has critical privacy concerns!")
        elif risk_score >= 6:
            print(f"   🔴 HIGH RISK: This site has significant privacy concerns!")
        elif risk_score >= 4:
            print(f"   🟡 CAUTION: This site has some privacy concerns")
        elif risk_score >= 2:
            print(f"   🟡 MODERATE: This site has minor privacy concerns")
        else:
            print(f"   🟢 SAFE: This site appears to have good privacy practices")
        
        # Show specific threats
        if analysis_result.get('privacy_threats'):
            print(f"\n   🔒 Privacy Threats:")
            for threat in analysis_result['privacy_threats'][:5]:
                print(f"      • {threat}")
        
        if analysis_result.get('brand_impersonation'):
            print(f"\n   🎭 Brand Impersonation:")
            for impersonation in analysis_result['brand_impersonation'][:3]:
                print(f"      • {impersonation}")
    
    print(f"\n" + "=" * 50)

def main():
    print_header()
    
    # Get website URL from user
    url = input("🌐 Enter educational website URL: ").strip()
    
    if not url:
        print("❌ No URL provided")
        return
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    print(f"\n🔍 Starting analysis of: {url}")
    print()
    
    # Step 1: Scrape the website
    scraped_data = scrape_website(url)
    
    if not scraped_data:
        print("❌ Failed to scrape website. Please check the URL and try again.")
        return
    
    # Step 2: Analyze with backend
    analysis_result = analyze_with_backend(scraped_data)
    
    # Step 3: Show detailed results
    show_detailed_results(scraped_data, analysis_result)
    
    # Step 4: Summary
    print(f"\n🎯 Summary:")
    print(f"   Website: {url}")
    print(f"   Risk Level: {analysis_result.get('recommendation', 'Unknown') if analysis_result else 'Analysis Failed'}")
    print(f"   Sensitive Fields: {sum(sum(1 for field in form['fields'] if field['sensitive']) for form in scraped_data['forms'])}")
    print(f"   Risk Indicators: {len(scraped_data['riskIndicators'])}")
    
    print(f"\n🔒 ShadowLens Analysis Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main() 