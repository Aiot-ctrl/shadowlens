// ShadowLens Dashboard JavaScript
let websiteData = [];
let filteredData = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 ShadowLens Dashboard: Initializing...');
    loadDashboardData();
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterWebsites();
        });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            filterWebsites();
        });
    });
}

function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    
    // Try to load from dashboard_data.json first
    fetch('dashboard_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Dashboard data loaded:', data);
            if (data && data.websiteHistory) {
                websiteData = data.websiteHistory;
                updateDashboard();
            } else {
                console.warn('No website history found in data');
                showNoDataMessage();
            }
        })
        .catch(error => {
            console.error('❌ Error loading dashboard data:', error);
            showNoDataMessage();
        });
}

function updateDashboard() {
    console.log('🔄 Updating dashboard with', websiteData.length, 'websites');
    
    // Update statistics
    updateStatistics();
    
    // Update risk distribution chart
    updateRiskDistribution();
    
    // Display websites
    displayWebsites();
}

function updateStatistics() {
    const totalWebsites = websiteData.length;
    const avgRisk = totalWebsites > 0 ? 
        (websiteData.reduce((sum, site) => sum + (site.riskScore || 0), 0) / totalWebsites).toFixed(1) : 0;
    const highRiskSites = websiteData.filter(site => (site.riskScore || 0) >= 6).length;
    const totalThreats = websiteData.reduce((sum, site) => sum + (site.privacyThreats ? site.privacyThreats.length : 0), 0);

    // Update stat cards
    updateElement('total-websites', totalWebsites);
    updateElement('avg-risk', avgRisk);
    updateElement('high-risk', highRiskSites);
    updateElement('total-threats', totalThreats);
}

function updateRiskDistribution() {
    const safeCount = websiteData.filter(site => (site.riskScore || 0) <= 3).length;
    const moderateCount = websiteData.filter(site => (site.riskScore || 0) > 3 && (site.riskScore || 0) <= 5).length;
    const cautionCount = websiteData.filter(site => (site.riskScore || 0) > 5 && (site.riskScore || 0) <= 7).length;
    const dangerousCount = websiteData.filter(site => (site.riskScore || 0) > 7).length;

    updateElement('safe-count', safeCount);
    updateElement('moderate-count', moderateCount);
    updateElement('caution-count', cautionCount);
    updateElement('dangerous-count', dangerousCount);
}

function displayWebsites() {
    const container = document.getElementById('websites-container');
    if (!container) return;

    if (websiteData.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>No website analyses found</p>
                <p>Start analyzing websites to see data here</p>
            </div>
        `;
        return;
    }

    // Apply current filters
    filterWebsites();
}

function filterWebsites() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    console.log('🔍 Filtering websites:', { searchTerm, activeFilter });

    filteredData = websiteData.filter(site => {
        // Search filter
        const matchesSearch = !searchTerm || 
            site.url.toLowerCase().includes(searchTerm) ||
            (site.websiteType && site.websiteType.toLowerCase().includes(searchTerm));

        // Risk filter
        let matchesRisk = true;
        const riskScore = site.riskScore || 0;
        
        switch (activeFilter) {
            case 'safe':
                matchesRisk = riskScore <= 3;
                break;
            case 'moderate':
                matchesRisk = riskScore > 3 && riskScore <= 5;
                break;
            case 'caution':
                matchesRisk = riskScore > 5 && riskScore <= 7;
                break;
            case 'dangerous':
                matchesRisk = riskScore > 7;
                break;
            default: // 'all'
                matchesRisk = true;
        }

        return matchesSearch && matchesRisk;
    });

    renderWebsites();
}

function renderWebsites() {
    const container = document.getElementById('websites-container');
    if (!container) return;

    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>No websites match the current filters</p>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    const websitesHTML = filteredData.map(site => createWebsiteCard(site)).join('');
    container.innerHTML = `
        <div class="websites-grid">
            ${websitesHTML}
        </div>
    `;
}

function createWebsiteCard(site) {
    const riskScore = site.riskScore || 0;
    const riskLevel = getRiskLevel(riskScore);
    const riskClass = `risk-${riskLevel.toLowerCase()}`;
    
    const timestamp = site.timestamp ? new Date(site.timestamp).toLocaleString() : 'Unknown';
    const threats = site.privacyThreats || [];
    const forms = site.forms || 0;
    const sensitiveFields = site.sensitiveFields || 0;
    const websiteType = site.websiteType || 'general';

    return `
        <div class="website-card">
            <div class="website-header">
                <div class="website-url">${truncateUrl(site.url)}</div>
                <div class="risk-badge ${riskClass}">${riskLevel}</div>
            </div>
            
            <div class="website-details">
                <div class="detail-row">
                    <span class="detail-label">Risk Score:</span>
                    <span>${riskScore}/10</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Website Type:</span>
                    <span>${formatWebsiteType(websiteType)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Forms:</span>
                    <span>${forms} (${sensitiveFields} sensitive)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Threats:</span>
                    <span>${threats.length}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Analyzed:</span>
                    <span>${timestamp}</span>
                </div>
            </div>
            
            ${threats.length > 0 ? `
                <div class="threats-list">
                    <strong>Privacy Threats:</strong>
                    ${threats.slice(0, 3).map(threat => `
                        <div class="threat-item">${threat}</div>
                    `).join('')}
                    ${threats.length > 3 ? `<div class="threat-item">... and ${threats.length - 3} more</div>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

function getRiskLevel(riskScore) {
    if (riskScore <= 3) return 'Safe';
    if (riskScore <= 5) return 'Moderate';
    if (riskScore <= 7) return 'Caution';
    return 'Dangerous';
}

function formatWebsiteType(type) {
    const types = {
        'educational': 'Educational',
        'social_media': 'Social Media',
        'financial': 'Financial',
        'ecommerce': 'E-commerce',
        'general': 'General'
    };
    return types[type] || type;
}

function truncateUrl(url) {
    if (!url) return 'Unknown URL';
    if (url.length <= 50) return url;
    return url.substring(0, 47) + '...';
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showNoDataMessage() {
    const container = document.getElementById('websites-container');
    if (container) {
        container.innerHTML = `
            <div class="no-data">
                <p>No analysis data available</p>
                <p>Start analyzing websites to see data here</p>
            </div>
        `;
    }
}

// Auto-refresh data every 30 seconds
setInterval(() => {
    console.log('🔄 Auto-refreshing dashboard data...');
    loadDashboardData();
}, 30000);

console.log('🔒 ShadowLens Dashboard: Ready!'); 