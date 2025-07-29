#!/usr/bin/env python3
"""
ShadowLens Dashboard Server
Simple Flask server to serve the dashboard
"""

from flask import Flask, send_from_directory, jsonify
import os
import json

app = Flask(__name__)

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

# API endpoint to get dashboard data
@app.route('/api/dashboard-data')
def get_dashboard_data():
    try:
        # Try to load dashboard_data.json
        if os.path.exists('dashboard_data.json'):
            with open('dashboard_data.json', 'r') as f:
                data = json.load(f)
                return jsonify(data)
        else:
            # Return empty data if file doesn't exist
            return jsonify({
                "websiteHistory": [],
                "message": "No analysis data available"
            })
    except Exception as e:
        return jsonify({
            "error": f"Error loading dashboard data: {str(e)}",
            "websiteHistory": []
        }), 500

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "ShadowLens Dashboard",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    print("🔒 ShadowLens Dashboard Server")
    print("=" * 40)
    print("Starting dashboard server...")
    print("Dashboard will be available at: http://localhost:8080")
    print("=" * 40)
    
    # Check if dashboard files exist
    if not os.path.exists('index.html'):
        print("⚠️  Warning: index.html not found in current directory")
    if not os.path.exists('dashboard.js'):
        print("⚠️  Warning: dashboard.js not found in current directory")
    
    # Start the server
    app.run(host='0.0.0.0', port=8080, debug=True) 