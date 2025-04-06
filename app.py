from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import logging
import os
from dotenv import load_dotenv
from database import (
    create_connection,
    execute_query,
    fetch_all,
    fetch_one,
    execute_many,
    TABLES,
    DB_CONFIG,
    save_historical_data,
    get_db
)
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import json
import pandas as pd
from io import StringIO
import csv
from datetime import datetime, timedelta, date
import xmlrpc.client
from urllib.parse import urlparse
import concurrent.futures
import mysql.connector
from mysql.connector import Error
import numpy as np
from sklearn.linear_model import LinearRegression
import re
import random
from dateutil import parser
from sklearn.preprocessing import StandardScaler
import time
import math
import hashlib
import sys
import traceback
import uuid
import google.generativeai as genai
import googlemaps
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create a file handler
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.INFO)

# Create a console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Create a formatter
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Configure Google Maps API
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Initialize Flask app
app = Flask(__name__, static_folder='build', static_url_path='/')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
# Set Secure=True and SameSite='None' for production HTTPS cross-origin requests
app.config['SESSION_COOKIE_SECURE'] = True 
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'

# Set up CORS with all necessary configurations
CORS(app,
     resources={
         r"/*": {
             "origins": [
                 "http://127.0.0.1:5000", 
                 "http://localhost:5000",
                 "https://steadility-gdg100.nulartus.com" # Add production origin
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }
     })

Session(app)

# Middleware


@app.before_request
def log_request():
    if request.path != '/api/health':  # Skip logging health checks
        logger.info(f"Request: {request.method} {request.path}")


@app.errorhandler(500)
def error_handler(e):
    logger.error(f"Server error: {e}")
    return jsonify({"error": "Internal server error"}), 500

# API Routes


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        connection = create_connection()
        if connection:
            return jsonify({'status': 'healthy', 'database': 'connected'}), 200
        else:
            return jsonify(
                {'status': 'unhealthy', 'database': 'disconnected'}), 500
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify(
            {'status': 'unhealthy', 'database': 'disconnected', 'error': str(e)}), 500


@app.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username').lower()  # Normalize to lowercase
    password = data.get('password')
    company_name = data.get('company_name')
    country = data.get('country')

    if not all([username, password, company_name, country]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if username already exists
    existing_user = fetch_all(
        "SELECT * FROM register_login WHERE Username = %s", (username,))
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create new user
    query = "INSERT INTO register_login (Username, Password, Company_name, Country) VALUES (%s, %s, %s, %s)"
    execute_query(query, (username, hashed_password, company_name, country))
    logger.info(f"User registered: {username}")
    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """API endpoint for user signup"""
    try:
        # Log the raw request data for debugging
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request content type: {request.content_type}")
        logger.info(f"Request data: {request.get_data(as_text=True)}")

        # Parse request data based on content type
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json(silent=True)
        else:
            # Try to parse as JSON anyway
            try:
                data = request.get_json(force=True, silent=True)
            except Exception as e:
                logger.error(f"Failed to parse JSON: {e}")
                data = None

        if not data:
            logger.error("No valid JSON data in request")
            return jsonify({'error': 'No data or invalid data provided'}), 400

        logger.info(f"Signup data received: {data}")

        username = data.get('email')
        if username:
            username = username.lower()
        password = data.get('password')
        company_name = data.get(
    'business_name',
    data.get(
        'businessName',
         data.get('business name')))
        country = data.get('country')
        industry = data.get('industry', '')  # Optional field

        if not all([username, password, company_name, country]):
            missing = []
            if not username: missing.append('email')
            if not password: missing.append('password')
            if not company_name: missing.append('business name')
            if not country: missing.append('country')
            return jsonify(
                {'error': f'Missing required fields: {", ".join(missing)}'}), 400

        # Check if username already exists
        existing_user = fetch_all(
            "SELECT * FROM register_login WHERE Username = %s", (username,))
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400

        # Hash password
        hashed_password = generate_password_hash(password)

        # Create new user
        query = "INSERT INTO register_login (Username, Password, Company_name, Country, Industry) VALUES (%s, %s, %s, %s, %s)"
        execute_query(
    query,
    (username,
    hashed_password,
    company_name,
    country,
     industry))
        logger.info(f"User registered successfully: {username}")
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        return jsonify({'error': 'Internal server error during signup'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """API endpoint for user login"""
    try:
        # Log the raw request data for debugging
        logger.info(f"Login request headers: {dict(request.headers)}")
        logger.info(f"Login request content type: {request.content_type}")
        logger.info(f"Login request data: {request.get_data(as_text=True)}")
        
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = data.get('email', '').lower()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Get user from database
        user = fetch_all(
            "SELECT * FROM register_login WHERE Username = %s", (username,))

        if not user or not check_password_hash(user[0]['Password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Set session data
        user_id = user[0]['unique_id']
        session['user_id'] = user_id
        session['username'] = user[0]['Username']
        session['company_name'] = user[0]['Company_name']
        session['authenticated'] = True
        
        # Generate a simple token (in production, use a more secure method)
        token = generate_password_hash(f"{user_id}:{username}:{int(time.time())}")
        
        logger.info(f"User logged in successfully: {username}")

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user[0]['unique_id'],
                'email': user[0]['Username'],
                'company_name': user[0]['Company_name'],
                'country': user[0]['Country'],
                'industry': user[0].get('Industry', '')
            }
        }), 200

    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({'error': 'Internal server error during login'}), 500


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """Dashboard endpoint - requires authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    user = fetch_all(
        "SELECT * FROM register_login WHERE unique_id = %s", (user_id,))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'message': 'Dashboard data retrieved successfully',
        'user': {
            'username': user[0]['Username'],
            'company_name': user[0]['Company_name'],
            'country': user[0]['Country']
        }
    }), 200


@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        user_id = session['user_id']
        user = fetch_all(
            "SELECT * FROM register_login WHERE unique_id = %s", (user_id,))

        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user[0]['unique_id'],
                    'username': user[0]['Username'],
                    'company_name': user[0]['Company_name'],
                    'country': user[0]['Country']
                }
            }), 200

    return jsonify({'authenticated': False}), 200


@app.route('/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    """API endpoint for user logout"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

# Handle OPTIONS requests for CORS preflight


@app.route('/api/auth/signup', methods=['OPTIONS'])
@app.route('/api/auth/login', methods=['OPTIONS'])
@app.route('/api/auth/logout', methods=['OPTIONS'])
@app.route('/api/auth/status', methods=['OPTIONS'])
@app.route('/api/settings/validate-connection', methods=['OPTIONS'])
@app.route('/api/settings/integration', methods=['OPTIONS'])
@app.route('/api/settings/companies', methods=['OPTIONS'])
def handle_options():
    return '', 200

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Serve the frontend application for all routes"""
    try:
        # First try to serve static files
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        # If not a static file, serve index.html for all other routes
        return app.send_static_file('index.html')
    except Exception as e:
        logger.error(f"Error serving frontend route: {str(e)}")
        return jsonify({'error': 'Failed to serve frontend route'}), 500

# Add error handler for 404
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors by serving the frontend application"""
    return app.send_static_file('index.html')

# Add error handler for 500
@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

# Data Source Configuration


@app.route('/api/settings/integration', methods=['GET', 'POST'])
def integration_settings():
    """Handle integration settings for data sources"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        if request.method == 'GET':
            try:
                # Get integration settings from database
                settings = fetch_all(
                    "SELECT * FROM integration_settings WHERE user_id = %s",
                    (user_id,)
                )
                return jsonify({'settings': settings[0] if settings else {}})
            except Exception as e:
                logger.error(f"Error fetching integration settings: {str(e)}")
                return jsonify({'error': str(e)}), 500

        elif request.method == 'POST':
            try:
                data = request.get_json()
                if not data:
                    return jsonify({'error': 'No data provided'}), 400

                # Validate the connection before saving
                validation_result = validate_connection(
                    data.get('integration_type'),
                    data.get('url'),
                    data.get('database_name'),
                    data.get('username'),
                    data.get('api_key')
                )

                if not validation_result['success']:
                    return jsonify(
                        {'error': validation_result['message']}), 400

                # Check if settings already exist
                existing = fetch_one(
                    "SELECT id FROM integration_settings WHERE user_id = %s",
                    (user_id,)
                )

                if existing:
                    # Update existing settings
                    query = """
                        UPDATE integration_settings
                        SET url = %s,
                            database_name = %s,
                            username = %s,
                            api_key = %s,
                            integration_type = %s,
                            company_id = %s,
                            is_validated = TRUE,
                            updated_at = NOW()
                        WHERE user_id = %s
                    """
                    execute_query(
                        query,
                        (
                            data['url'],
                            data.get('database_name'),
                            data['username'],
                            data['api_key'],
                            data['integration_type'],
                            data.get('company_id', ''),
                            user_id
                        )
                    )
                else:
                    # Insert new settings
                    query = """
                        INSERT INTO integration_settings
                        (user_id, url, database_name, username, api_key,
                         integration_type, company_id, is_validated, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, NOW(), NOW())
                    """
                    execute_query(
                        query,
                        (
                            user_id,
                            data['url'],
                            data.get('database_name'),
                            data['username'],
                            data['api_key'],
                            data['integration_type'],
                            data.get('company_id', '')
                        )
                    )

                return jsonify(
                    {'message': 'Integration settings saved successfully'})

            except Exception as e:
                logger.error(f"Error saving integration settings: {str(e)}")
                return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error in integration settings: {str(e)}")
        return jsonify({'error': str(e)}), 500


def fetch_data_from_integration(platform_type, user_id, company_id):
    """Fetch data from Odoo or Zoho based on the integration settings."""
    # Implement the logic to fetch data from the respective platform
    if platform_type.lower() == 'odoo':
        # Call the function to fetch data from Odoo
        data = fetch_odoo_data(user_id, company_id)
    elif platform_type.lower() == 'zoho':
        # Call the function to fetch data from Zoho
        data = fetch_zoho_data(user_id, company_id)
    else:
        logger.error("Unsupported platform type for data fetching.")
        return

    # Process and merge the fetched data into the database
    merge_data_to_database(data)


def fetch_odoo_data(user_id, company_id):
    """Fetch data from Odoo based on user settings."""
    # Implement the logic to connect to Odoo and fetch data
    # ...


def fetch_zoho_data(user_id, company_id):
    """Fetch data from Zoho based on user settings."""
    # Implement the logic to connect to Zoho and fetch data
    # ...


def merge_data_to_database(data):
    """Merge the fetched data into the MySQL database."""
    # Implement the logic to merge data into the database
    # ...


@app.route('/api/settings/companies', methods=['GET'])
def get_companies():
    """Get available companies from Odoo or Zoho"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    integration_type = request.args.get('platform')
    url = request.args.get('url')
    database_name = request.args.get('database')
    username = request.args.get('username')
    api_key = request.args.get('api_key')

    if not all([integration_type, url, username, api_key]):
        return jsonify({'error': 'Missing required parameters'}), 400

    if integration_type.lower() == 'odoo':
        companies = get_odoo_companies(url, database_name, username, api_key)
        return jsonify({'companies': companies}), 200
    elif integration_type.lower() == 'zoho':
        companies = get_zoho_companies(url, username, api_key)
        return jsonify({'companies': companies}), 200
    else:
        return jsonify({'error': 'Unsupported platform type'}), 400


@app.route('/api/settings/validate-connection', methods=['POST'])
def validate_connection_api():
    """Validate connection to Odoo or Zoho"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    integration_type = data.get('integration_type')
    url = data.get('url')
    database_name = data.get('database_name')
    username = data.get('username')
    api_key = data.get('api_key')
    company_id = data.get('company_id')

    if not all([integration_type, url, username, api_key]):
        return jsonify({'error': 'Missing required fields'}), 400

    result = validate_connection(
        integration_type,
        url,
        database_name,
        username,
        api_key,
        company_id)
    return jsonify(result), 200 if result['success'] else 400

# Helper functions for integration


def validate_connection(
        platform_type,
        platform_url,
        database,
        username,
        api_key,
        company_id=None):
    """Validate connection to the specified platform"""
    try:
        if platform_type.lower() == 'odoo':
            # Validate Odoo connection
            return validate_odoo_connection(
                platform_url, database, username, api_key, company_id)
        elif platform_type.lower() == 'zoho':
            # Validate Zoho connection
            return validate_zoho_connection(
                platform_url, username, api_key, company_id)
        else:
            return {'success': False, 'message': 'Unsupported platform type'}
    except Exception as e:
        logger.error(f"Connection validation error: {str(e)}")
        return {
            'success': False,
            'message': f"Error validating connection: {
                str(e)}"}

def validate_odoo_connection(
        url,
        database,
        username,
        api_key,
        company_id=None):
    """Validate Odoo connection"""
    try:
        # Sample validation for Odoo using xmlrpc
        common_endpoint = f"{url}/xmlrpc/2/common"
        object_endpoint = f"{url}/xmlrpc/2/object"

        # Authenticate
        common = xmlrpc.client.ServerProxy(common_endpoint)
        uid = common.authenticate(database, username, api_key, {})

        if not uid:
            return {'success': False, 'message': 'Authentication failed'}

        # Test access to a model
        models = xmlrpc.client.ServerProxy(object_endpoint)
        access = models.execute_kw(
            database, uid, api_key,
            'product.product', 'check_access_rights',
            ['read'], {'raise_exception': False}
        )

        if not access:
            return {
                'success': False,
                'message': 'Insufficient permissions to access product data'}

        return {
            'success': True,
            'message': 'Connection validated successfully'}
    except Exception as e:
        logger.error(f"Odoo validation error: {str(e)}")
        return {
            'success': False,
            'message': f"Error validating Odoo connection: {
                str(e)}"}


def validate_zoho_connection(url, username, api_key, company_id=None):
    """Validate Zoho connection"""
    try:
        # This is a placeholder. Actual Zoho validation would depend on their API
        # Typically would involve making an API call using the credentials

        # Example of a basic API call (would need to be replaced with actual
        # Zoho API)
        headers = {
            'Authorization': f'Zoho-oauthtoken {api_key}',
            'Content-Type': 'application/json'
        }

        # Test API call to validate credentials
        response = requests.get(
            f"{url}/api/v2/inventoryitems",
            headers=headers
        )

        if response.status_code == 200:
            return {
                'success': True,
                'message': 'Connection validated successfully'}
        else:
            return {
                'success': False,
                'message': f"API validation failed: {
                    response.text}"}
    except Exception as e:
        logger.error(f"Zoho validation error: {str(e)}")
        return {
            'success': False,
            'message': f"Error validating Zoho connection: {
                str(e)}"}


def get_odoo_companies(url, database, username, api_key):
    """Get available companies from Odoo"""
    try:
        common_endpoint = f"{url}/xmlrpc/2/common"
        object_endpoint = f"{url}/xmlrpc/2/object"

        # Authenticate
        common = xmlrpc.client.ServerProxy(common_endpoint)
        uid = common.authenticate(database, username, api_key, {})

        if not uid:
            return []

        # Get companies
        models = xmlrpc.client.ServerProxy(object_endpoint)
        companies = models.execute_kw(
            database, uid, api_key,
            'res.company', 'search_read',
            [[]], {'fields': ['id', 'name']}
        )

        return companies
    except Exception as e:
        logger.error(f"Error fetching Odoo companies: {str(e)}")
        return []


def get_zoho_companies(url, username, api_key):
    """Get available companies/organizations from Zoho"""
    try:
        # This is a placeholder. Actual Zoho implementation would depend on
        # their API
        headers = {
            'Authorization': f'Zoho-oauthtoken {api_key}',
            'Content-Type': 'application/json'
        }

        # Example API call to get organizations
        response = requests.get(
            f"{url}/api/v2/organizations",
            headers=headers
        )

        if response.status_code == 200:
            organizations = response.json().get('organizations', [])
            return [{'id': org['organization_id'], 'name': org['name']}
                    for org in organizations]
        else:
            logger.error(f"Error fetching Zoho organizations: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error fetching Zoho organizations: {str(e)}")
        return []


@app.route('/api/settings/inventory', methods=['GET', 'POST'])
def inventory_settings():
    """Handle inventory management settings"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    # GET request to retrieve current inventory settings
    if request.method == 'GET':
        settings = fetch_all(
            "SELECT * FROM inventory_settings WHERE user_id = %s",
            (user_id,)
        )
        return jsonify({'settings': settings}), 200

    # POST request to save inventory settings
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract inventory settings from request
        # 'odoo', 'zoho', 'manual'
        inventory_source = data.get('inventory_source')
        auto_update = data.get('auto_update', False)
        update_frequency = data.get('update_frequency')

        if not inventory_source:
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if settings already exist for this user
        existing = fetch_all(
            "SELECT * FROM inventory_settings WHERE user_id = %s",
            (user_id,)
        )

        if existing:
            # Update existing settings
            query = """
                UPDATE inventory_settings
                SET inventory_source = %s, auto_update = %s, update_frequency = %s
                WHERE user_id = %s
            """
            execute_query(
                query,
                (inventory_source,
                 auto_update,
                 update_frequency,
                 user_id))
            logger.info(f"Updated inventory settings for user {user_id}")
        else:
            # Insert new settings
            query = """
                INSERT INTO inventory_settings
                (user_id, inventory_source, auto_update, update_frequency)
                VALUES (%s, %s, %s, %s)
            """
            execute_query(
                query,
                (user_id,
                 inventory_source,
                 auto_update,
                 update_frequency))
            logger.info(f"Created inventory settings for user {user_id}")

        return jsonify(
            {'message': 'Inventory settings saved successfully'}), 200


@app.route('/api/import/data', methods=['GET'])
def get_imported_data():
    """Get imported historical data from MySQL database"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        # Get the last 100 records for the user, grouped by source
        query = """
            SELECT
                hd.id,
                hd.user_id,
                hd.data,
                hd.date,
                hd.company_id,
                hd.source,
                hd.created_at,
                hd.updated_at,
                COUNT(*) OVER (PARTITION BY hd.source) as source_count
            FROM historical_data hd
            WHERE hd.user_id = %s
            ORDER BY hd.date DESC
            LIMIT 100
        """

        data = fetch_all(query, (user_id,))

        # Process and format the data
        formatted_data = []
        source_stats = {}

        for record in data:
            try:
                # Parse the JSON data
                data_content = json.loads(
    record['data']) if isinstance(
        record['data'],
         str) else record['data']

                # Format the record
                formatted_record = {
                    'id': record['id'],
                    'date': record['date'],
                    'source': record['source'],
                    'company_id': record['company_id'],
                    'data': data_content,
                    'created_at': record['created_at'],
                    'updated_at': record['updated_at']
                }

                formatted_data.append(formatted_record)

                # Update source statistics
                if record['source'] not in source_stats:
                    source_stats[record['source']] = {
                        'count': 0,
                        'latest_date': None,
                        'earliest_date': None
                    }

                source_stats[record['source']]['count'] += 1
                
                # Check if record['date'] is already a datetime object
                if isinstance(record['date'], datetime):
                    record_date = record['date']
                else:
                    record_date = datetime.strptime(
                        record['date'], '%Y-%m-%d %H:%M:%S')

                if (source_stats[record['source']]['latest_date'] is None or
                        record_date > source_stats[record['source']]['latest_date']):
                    source_stats[record['source']]['latest_date'] = record_date

                if (source_stats[record['source']]['earliest_date'] is None or
                        record_date < source_stats[record['source']]['earliest_date']):
                    source_stats[record['source']
                        ]['earliest_date'] = record_date

            except Exception as e:
                logger.error(
    f"Error processing record {
        record['id']}: {
            str(e)}")
                continue

        return jsonify({
            'data': formatted_data,
            'source_stats': source_stats,
            'total_records': len(formatted_data)
        }), 200

    except Exception as e:
        logger.error(f"Error fetching imported data: {str(e)}")
        return jsonify({'error': str(e)}), 500


def normalize_url(url):
    """Normalize URL by adding scheme if missing and removing trailing slash."""
    parsed_url = urlparse(url)
    if not parsed_url.scheme:
        url = 'http://' + url
    return url.rstrip('/')


def connect_odoo(odoo_url, odoo_db, username, api_key):
    """Establishes Odoo connection and returns client and uid."""
    try:
        odoo_url = normalize_url(odoo_url)
        common = xmlrpc.client.ServerProxy(f'{odoo_url}/xmlrpc/2/common')
        uid = common.authenticate(odoo_db, username, api_key, {})
        if uid:
            logger.info(
                f"Successfully authenticated as '{username}' with user ID: {uid}")
            object_api = xmlrpc.client.ServerProxy(
                f'{odoo_url}/xmlrpc/2/object')
            return object_api, uid
        else:
            logger.error(
                f"Authentication failed for user '{username}': Invalid API key or database")
            return None, None
    except Exception as e:
        logger.error(f"Connection to Odoo failed: {str(e)}")
        return None, None


@app.route('/api/import/odoo', methods=['POST'])
def import_odoo_data():
    """Import data from Odoo"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        # Check if Odoo integration is configured
        settings = fetch_all(
            "SELECT * FROM integration_settings WHERE user_id = %s AND integration_type = 'Odoo' AND is_validated = TRUE",
            (user_id,)
        )

        if not settings:
            logger.warning(
                f"User {user_id} attempted to import Odoo data without valid integration settings")
            return jsonify({
                'error': 'Odoo integration is not configured or validated. Please configure and validate your Odoo connection in Settings > Integration first.'
            }), 400

        setting = settings[0]

        # Connect to Odoo
        odoo_client, uid = connect_odoo(
            setting['url'],
            setting['database_name'],
            setting['username'],
            setting['api_key']
        )

        if not odoo_client or not uid:
            logger.error(f"Failed to connect to Odoo for user {user_id}")
            return jsonify({
                'error': 'Failed to connect to Odoo. Please verify your integration settings in Settings > Integration.'
            }), 400

        # Get historical data from Odoo
        today = datetime.now()
        past_date = today - timedelta(days=30)

        try:
            # Fetch warehouse stock history
            warehouse_result = fetch_warehouse_stock_history(
                odoo_client,
                setting['database_name'],
                setting['username'],
                setting['api_key'],
                uid,
                past_date,
                today
            )

            # Fetch retailer stock history
            retailer_result = fetch_retailer_stock_history(
                odoo_client,
                setting['database_name'],
                setting['username'],
                setting['api_key'],
                uid,
                past_date,
                today
            )

            warehouse_data = warehouse_result['data']
            retailer_data = retailer_result['data']
            warehouse_total = warehouse_result['total_count']
            retailer_total = retailer_result['total_count']

            if not warehouse_data and not retailer_data:
                return jsonify({
                    'error': 'No data found in the selected date range. Please verify your Odoo data or try a different date range.'
                }), 404

            # Process and save the data
            save_historical_data(user_id, warehouse_data, 'odoo')
            save_historical_data(user_id, retailer_data, 'odoo')

            return jsonify({
                'message': 'Data imported successfully',
                'warehouse_records': len(warehouse_data),
                'retailer_records': len(retailer_data),
                'warehouse_total': warehouse_total,
                'retailer_total': retailer_total,
                'note': 'Processed first 50 records for each type, while preserving total count information'
            }), 200

        except Exception as e:
            logger.error(
                f"Error fetching data from Odoo for user {user_id}: {
                    str(e)}")
            return jsonify(
                {'error': f'Failed to fetch data from Odoo: {str(e)}'}), 500

    except Exception as e:
        logger.error(f"Error importing Odoo data for user {user_id}: {str(e)}")
        return jsonify({'error': f'Failed to import data: {str(e)}'}), 500


@app.route('/api/import/zoho', methods=['POST'])
def import_zoho_data():
    """Import data from Zoho"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Get integration settings for Zoho
    settings = fetch_all(
        "SELECT * FROM integration_settings WHERE user_id = %s AND integration_type = 'Zoho'",
        (user_id,)
    )

    if not settings:
        return jsonify({'error': 'Zoho integration not configured'}), 400

    setting = settings[0]

    try:
        # Import data from Zoho (implementation depends on Zoho's API)
        # This is a placeholder for the actual Zoho implementation
        zoho_data = fetch_zoho_data(
            setting['url'],
            setting['username'],
            setting['api_key'])

        # Process and save the data
        save_historical_data(user_id, zoho_data, 'zoho')

        return jsonify({
            'message': 'Data imported successfully',
            'records': len(zoho_data)
        }), 200

    except Exception as e:
        logger.error(f"Error importing Zoho data: {str(e)}")
        return jsonify({'error': f'Failed to import data: {str(e)}'}), 500


@app.route('/api/import/csv', methods=['POST'])
def handle_csv_data():
    """Handle CSV data import with optimized processing"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400

    try:
        # Process CSV in chunks for better memory usage
        chunk_size = 1000
        formatted_data = []

        # Read CSV in chunks
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)

        chunk = []
        for row in reader:
            # Create a record in the format expected by the frontend table
            record = {
                'date': row.get(
                    'date',
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                'data': {
                    'product': row.get(
                        'product',
                        ''),
                    'location': row.get(
                        'location',
                        ''),
                    'quantity': row.get(
                        'quantity',
                        '0'),
                    'type': row.get(
                        'type',
                        'warehouse')},
                'company_id': row.get(
                    'company_id',
                    '1'),
                'source_specific': {
                    'csv_fields': {
                        k: v for k,
                        v in row.items() if k not in [
                            'date',
                            'product',
                            'location',
                            'quantity',
                            'type',
                            'company_id']}}}

            chunk.append(record)

            if len(chunk) >= chunk_size:
                formatted_data.extend(chunk)
                chunk = []

        if chunk:
            formatted_data.extend(chunk)

        # If save parameter is present, save the data
        if request.args.get('save') == 'true':
            save_historical_data(formatted_data, 'csv', user_id)
            return jsonify({
                'message': 'Data imported and saved successfully',
                'total_records': len(formatted_data)
            }), 200

        return jsonify({
            'data': formatted_data,
            'total_records': len(formatted_data)
        }), 200

    except Exception as e:
        logger.error(f"Error handling CSV data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/import/<source>/save', methods=['POST'])
def save_source_data(source):
    """Save data from any source to the database"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'data' not in data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        # Get the data to save
        source_data = data.get('data', [])

        # Verify data format
        if not isinstance(source_data, list):
            return jsonify({'error': 'Data must be a list of records'}), 400

        if not source_data:
            return jsonify({'error': 'No records to save'}), 400

        # Save the data using the new function
        if save_historical_data(source_data, source, user_id):
            return jsonify({'message': 'Data saved successfully'})
        else:
            return jsonify({'error': 'Failed to save data'}), 500

    except Exception as e:
        print(f"Error saving data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/import/<source>/data', methods=['GET'])
def get_source_data(source):
    """Get imported data for a specific source with efficient JSON handling"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    # Get the last 100 records for the user and source
    query = """
        SELECT
            id,
            user_id,
            JSON_UNQUOTE(data) as data,
            date,
            company_id,
            source,
            created_at,
            updated_at
        FROM historical_data
        WHERE user_id = %s AND source = %s
        ORDER BY date DESC
        LIMIT 100
    """

    try:
        data = fetch_all(query, (user_id, source))
        # Parse JSON data for each record
        for record in data:
            record['data'] = json.loads(record['data'])
        return jsonify({'data': data}), 200
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return jsonify({'error': 'Data format error'}), 500
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return jsonify({'error': 'Failed to fetch data'}), 500


@app.route('/api/import/odoo/fetch', methods=['POST'])
def fetch_odoo_data():
    """Simple endpoint to fetch Odoo data"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        # Get Odoo settings
        settings = fetch_all(
            "SELECT * FROM integration_settings WHERE user_id = %s AND integration_type = 'Odoo'",
            (user_id,)
        )

        if not settings:
            return jsonify({'error': 'Odoo integration not configured'}), 400

        setting = settings[0]

        # Connect to Odoo
        odoo_url = normalize_url(setting['url'])
        common = xmlrpc.client.ServerProxy(f'{odoo_url}/xmlrpc/2/common')
        uid = common.authenticate(
            setting['database_name'],
            setting['username'],
            setting['api_key'],
            {})

        if not uid:
            return jsonify({'error': 'Failed to connect to Odoo'}), 400

        # Create object endpoint
        object_endpoint = xmlrpc.client.ServerProxy(
            f'{odoo_url}/xmlrpc/2/object')

        # Simple query to get stock moves from last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        domain = [
            ('date', '>=', start_date.strftime('%Y-%m-%d 00:00:00')),
            ('date', '<=', end_date.strftime('%Y-%m-%d 23:59:59'))
        ]

        fields = [
            'date',
            'product_id',
            'location_id',
            'location_dest_id',
            'product_uom_qty',
            'state',
            'company_id']

        # First get the total count of records
        total_records = object_endpoint.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'stock.move', 'search_count',
            [domain]
        )

        # Fetch only 50 records for processing
        stock_moves = object_endpoint.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'stock.move', 'search_read',
            [domain],
            {'fields': fields, 'limit': 50}  # Limit to 50 records
        )

        # Format data to match frontend structure
        formatted_data = []
        for move in stock_moves:
            formatted_data.append(
                {
                'date': move['date'],
                'data': {
                        'product': move['product_id'][0] if isinstance(
                            move['product_id'],
                            (list,
                             tuple)) else move['product_id'],
                        'location': move['location_id'][0] if isinstance(
                            move['location_id'],
                            (list,
                             tuple)) else move['location_id'],
                    'quantity': move['product_uom_qty'],
                    'type': 'warehouse' if move['location_id'] and (
                            isinstance(
                                move['location_id'],
                                (list,
                                 tuple)) and move['location_id'][1].lower().startswith('wh/')) else 'retailer',
                    'state': move['state'],
                    'source_specific': {
                            'destination': move['location_dest_id'][1] if isinstance(
                                move['location_dest_id'],
                                (list,
                                 tuple)) else str(
                                move['location_dest_id']),
                            'product_name': move['product_id'][1] if isinstance(
                                move['product_id'],
                                (list,
                                 tuple)) else str(
                                move['product_id']),
                            'location_name': move['location_id'][1] if isinstance(
                                move['location_id'],
                                (list,
                                 tuple)) else str(
                                move['location_id'])}},
                    'company_id': move['company_id'][0] if isinstance(
                        move['company_id'],
                        (list,
                         tuple)) else move['company_id']})

        return jsonify({
            'data': formatted_data,
            'total_records': total_records  # Return the actual total count
        }), 200

    except Exception as e:
        logger.error(f"Error fetching Odoo data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/import/zoho/fetch', methods=['POST'])
def fetch_zoho_data():
    """Fetch data from Zoho with optimized processing"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        # Get integration settings for Zoho
        settings = fetch_all(
            "SELECT * FROM integration_settings WHERE user_id = %s AND integration_type = 'Zoho' AND is_validated = TRUE",
            (user_id,)
        )

        if not settings:
            return jsonify({'error': 'Zoho integration not configured'}), 400

        setting = settings[0]

        # Fetch Zoho data (implementation depends on Zoho's API)
        zoho_data = fetch_zoho_data(
            setting['url'],
            setting['username'],
            setting['api_key'])

        # Format data to match our JSON structure
        formatted_data = []
        for record in zoho_data:
            formatted_data.append({
                'date': record.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                'item': {
                    'id': record.get('item_id'),
                    'name': record.get('item_name')
                },
                'warehouse': {
                    'id': record.get('warehouse_id'),
                    'name': record.get('warehouse_name')
                },
                'quantity': record.get('stock_level'),
                'type': record.get('type', 'warehouse'),
                'company_id': record.get('company_id'),
                'source_specific': {
                    'zoho_fields': record.get('additional_fields', {})
                }
            })

        return jsonify({
            'data': formatted_data,
            'total_records': len(formatted_data)
        }), 200

    except Exception as e:
        logger.error(f"Error fetching Zoho data: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add these utility functions at the top of the file
# NOTE: execute_many is imported from database.py - DO NOT define it here!

# Add these functions back before the fetch_odoo_data route


def fetch_warehouse_stock_history(
        odoo_client,
        database,
        username,
        api_key,
        uid,
        start_date,
        end_date):
    """Fetch warehouse stock history from Odoo"""
    try:
        date_domain = [
            ('date', '>=', start_date.strftime('%Y-%m-%d 00:00:00')),
            ('date', '<=', end_date.strftime('%Y-%m-%d 23:59:59')),
            ('location_id.usage', '=', 'internal')
        ]

        fields = [
            'product_id',
            'location_id',
            'location_dest_id',
            'date',
            'product_uom_qty',
            'state',
            'company_id'
        ]

        # First get the total count
        total_count = odoo_client.execute_kw(
            database, uid, api_key,
            'stock.move', 'search_count',
            [date_domain]
        )

        # Then get only 50 records
        history = odoo_client.execute_kw(
            database, uid, api_key,
            'stock.move', 'search_read',
            [date_domain],
            {'fields': fields, 'limit': 50}
        )

        logger.info(
            f"Fetched 50 out of {total_count} warehouse stock history records")
        # Attach total count to the history data
        return {'data': history, 'total_count': total_count}
    except Exception as e:
        logger.error(f"Error fetching warehouse history: {str(e)}")
        raise


def fetch_retailer_stock_history(
        odoo_client,
        database,
        username,
        api_key,
        uid,
        start_date,
        end_date):
    """Fetch retailer stock history from Odoo"""
    try:
        date_domain = [
            ('date', '>=', start_date.strftime('%Y-%m-%d 00:00:00')),
            ('date', '<=', end_date.strftime('%Y-%m-%d 23:59:59')),
            ('location_dest_id.usage', '=', 'customer')
        ]

        fields = [
            'product_id',
            'location_id',
            'location_dest_id',
            'date',
            'product_uom_qty',
            'state',
            'company_id'
        ]

        # First get the total count
        total_count = odoo_client.execute_kw(
            database, uid, api_key,
            'stock.move', 'search_count',
            [date_domain]
        )

        # Then get only 50 records
        history = odoo_client.execute_kw(
            database, uid, api_key,
            'stock.move', 'search_read',
            [date_domain],
            {'fields': fields, 'limit': 50}
        )

        logger.info(
            f"Fetched 50 out of {total_count} retailer stock history records")
        # Attach total count to the history data
        return {'data': history, 'total_count': total_count}
    except Exception as e:
        logger.error(f"Error fetching retailer history: {str(e)}")
        raise

# NOTE: All database functions like save_historical_data and get_db are now handled by imports from database.py
# Do not define database-related functions here to avoid conflicts.


@app.route('/api/import/<source>/history', methods=['GET'])
def get_historical_data(source):
    """Get historical data for the specified source"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        # Fetch historical data from the database with limit and count
        query = """
            SELECT * FROM historical_data
            WHERE user_id = %s AND source = %s
            ORDER BY created_at DESC
        """

        historical_data, total_count = fetch_all(
            query,
            (user_id, source),
            limit=50,
            count=True
        )

        # Format the data for frontend
        formatted_data = []
        for record in historical_data:
            if record.get('data'):
                try:
                    # Parse the JSON data
                    data_records = json.loads(record['data'])
                    if isinstance(data_records, list):
                        formatted_data.extend(data_records)
                    else:
                        formatted_data.append(data_records)
                except Exception as e:
                    print(f"Error parsing JSON data: {str(e)}")

        return jsonify({
            'data': formatted_data,
            'total_records': total_count
        }), 200
    except Exception as e:
        logger.error(f"Error fetching historical data: {str(e)}")
        return jsonify({'error': str(e)}), 500

# User preferences endpoints


@app.route('/api/settings/user-preferences', methods=['GET'])
def get_user_preferences():
    """Get user preferences"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT preferences FROM user_preferences
            WHERE user_id = %s
            LIMIT 1
        """

        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result and result.get('preferences'):
            try:
                preferences = json.loads(result['preferences'])
                return jsonify({'preferences': preferences})
            except json.JSONDecodeError:
                return jsonify({'preferences': {}})

        return jsonify({'preferences': {}})

    except Exception as e:
        print(f"Error fetching user preferences: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@app.route('/api/settings/profile', methods=['POST'])
def update_profile():
    """Update user profile information"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    company_name = data.get('company_name')
    password = data.get('password')

    if not all([company_name, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # First, verify the password
        user = fetch_all(
            "SELECT * FROM register_login WHERE unique_id = %s", (user_id,))

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not check_password_hash(user[0]['Password'], password):
            return jsonify({'error': 'Invalid password'}), 403

        # If password is correct, update the company name
        query = "UPDATE register_login SET Company_name = %s WHERE unique_id = %s"
        execute_query(query, (company_name, user_id))

        logger.info(f"Updated profile for user {user_id}")
        return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/settings/user-preferences', methods=['POST'])
def save_user_preferences():
    """Save user preferences"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'preferences' not in data:
        return jsonify({'error': 'No preferences provided'}), 400

    try:
        preferences = data['preferences']
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Check if record exists
        check_query = """
            SELECT id FROM user_preferences
            WHERE user_id = %s
            LIMIT 1
        """

        cursor.execute(check_query, (user_id,))
        existing = cursor.fetchone()

        if existing:
            # Update existing record
            update_query = """
                UPDATE user_preferences
                SET preferences = %s, updated_at = NOW()
                WHERE user_id = %s
            """

            cursor.execute(update_query, (json.dumps(preferences), user_id))
        else:
            # Insert new record
            insert_query = """
                INSERT INTO user_preferences (user_id, preferences, created_at, updated_at)
                VALUES (%s, %s, NOW(), NOW())
            """

            cursor.execute(insert_query, (user_id, json.dumps(preferences)))

        conn.commit()
        return jsonify({'message': 'Preferences saved successfully'})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error saving user preferences: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@app.route('/api/settings/security', methods=['POST'])
def update_password():
    """Update user password with proper validation and hashing"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not all([current_password, new_password, confirm_password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if new_password != confirm_password:
        return jsonify(
            {'error': 'New password and confirmation do not match'}), 400

    try:
        # First, verify the current password
        user = fetch_all(
            "SELECT * FROM register_login WHERE unique_id = %s", (user_id,))

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if not check_password_hash(user[0]['Password'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 403

        # Hash the new password
        hashed_password = generate_password_hash(new_password)

        # Update the password in the database
        query = "UPDATE register_login SET Password = %s WHERE unique_id = %s"
        execute_query(query, (hashed_password, user_id))

        logger.info(f"Password updated for user {user_id}")
        return jsonify({'message': 'Password updated successfully'}), 200

    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/inventory/dashboard', methods=['GET'])
def get_inventory_dashboard():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    user_id = session['user_id']

    try:
        # Check if Odoo integration is configured
        settings = fetch_all(
            "SELECT * FROM integration_settings WHERE user_id = %s AND integration_type = 'Odoo' AND is_validated = TRUE",
            (user_id,)
        )

        if not settings:
            return jsonify({
                'error': 'Odoo integration not configured',
                'data': get_mock_inventory_data()  # Provide mock data if not configured
            })

        setting = settings[0]

        # Connect to Odoo
        odoo_client, uid = connect_odoo(
            setting['url'],
            setting['database_name'],
            setting['username'],
            setting['api_key']
        )

        if not odoo_client or not uid:
            return jsonify({
                'error': 'Failed to connect to Odoo',
                'data': get_mock_inventory_data()  # Fallback to mock data
            })

        # Get total items count (products with quantity > 0)
        domain = [('qty_available', '>', 0)]
        total_products = odoo_client.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'product.product', 'search_count',
            [domain]
        )

        # Get low stock items (quantity available less than min_qty but greater
        # than 0)
        low_stock_domain = [
            ('qty_available', '>', 0),
            ('qty_available', '<', 5)  # Assuming 5 is our threshold for low stock
        ]
        low_stock = odoo_client.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'product.product', 'search_count',
            [low_stock_domain]
        )

        # Get out of stock items
        out_of_stock_domain = [('qty_available', '<=', 0)]
        out_of_stock = odoo_client.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'product.product', 'search_count',
            [out_of_stock_domain]
        )

        # Get reorder points
        reorder_points = odoo_client.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'stock.warehouse.orderpoint', 'search_count',
            [[]]
        )

        # Get inventory by category
        categories = []
        category_ids = odoo_client.execute_kw(
            setting['database_name'], uid, setting['api_key'],
            'product.category', 'search',
            [[]]
        )

        for category_id in category_ids:
            category = odoo_client.execute_kw(
                setting['database_name'], uid, setting['api_key'],
                'product.category', 'read',
                [category_id], {'fields': ['name']}
            )[0]

            product_count = odoo_client.execute_kw(
                setting['database_name'], uid, setting['api_key'],
                'product.product', 'search_count',
                [[('categ_id', '=', category_id)]]
            )

            if product_count > 0:  # Only include categories with products
                categories.append({
                    'name': category['name'],
                    'count': product_count
                })

        # Sort by count in descending order and limit to top 5
        categories.sort(key=lambda x: x['count'], reverse=True)
        categories = categories[:5]

        # Get recent movements (last 10)
        recent_moves_domain = [('state', '=', 'done')]
        recent_moves = odoo_client.execute_kw(
            setting['database_name'],
            uid,
            setting['api_key'],
            'stock.move',
            'search_read',
            [recent_moves_domain],
            {
                'fields': [
                    'product_id',
                    'product_uom_qty',
                    'date',
                    'location_id',
                    'location_dest_id'],
                'limit': 10,
                'order': 'date desc'})

        recent_movements = []
        for move in recent_moves:
            # Determine if it's incoming or outgoing movement
            is_incoming = move['location_dest_id'][1].startswith('WH/')
            quantity = move['product_uom_qty'] if is_incoming else - \
                move['product_uom_qty']

            recent_movements.append({
                'product': move['product_id'][1],
                'quantity': quantity,
                'date': move['date'].split(' ')[0]  # Just the date part
            })

        # Return the inventory dashboard data
        return jsonify({
            'data': {
                'total_items': total_products,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
                'reorder_points': reorder_points,
                'categories': categories,
                'recent_movements': recent_movements
            }
        })

    except Exception as e:
        logger.error(f"Error fetching inventory dashboard: {str(e)}")
        return jsonify({
            'error': str(e),
            'data': get_mock_inventory_data()  # Fallback to mock data on error
        })


def get_mock_inventory_data():
    """Return mock inventory data when Odoo is not available"""
    return {
        'total_items': 1250,
        'low_stock': 45,
        'out_of_stock': 12,
        'reorder_points': 89,
        'categories': [
            {'name': 'Electronics', 'count': 450},
            {'name': 'Furniture', 'count': 320},
            {'name': 'Clothing', 'count': 580},
            {'name': 'Accessories', 'count': 280}
        ],
        'recent_movements': [
            {'product': 'Laptop Pro X', 'quantity': 25, 'date': '2024-03-15'},
            {'product': 'Office Chair', 'quantity': -15, 'date': '2024-03-14'},
            {'product': 'Wireless Mouse', 'quantity': 50, 'date': '2024-03-13'}
        ]
    }


def validate_stock_data(stock_moves):
    """Validate stock movement data for quality and consistency"""
    validation_results = {
        'is_valid': True,
        'issues': [],
        'stats': {
            'total_moves': len(stock_moves),
            'invalid_moves': 0,
            'missing_fields': 0,
            'date_range': {'min': None, 'max': None}
        }
    }

    if not stock_moves:
        validation_results['is_valid'] = False
        validation_results['issues'].append('No stock movements found')
        return validation_results

    dates = []
    for move in stock_moves:
        try:
            # Check required fields
            required_fields = [
                'product_id',
                'product_uom_qty',
                'date',
                'location_id',
                'location_dest_id']
            missing_fields = [
                field for field in required_fields if field not in move]
            if missing_fields:
                validation_results['stats']['missing_fields'] += 1
                validation_results['issues'].append(
                    f'Missing fields: {", ".join(missing_fields)}')
                continue

            # Validate product_id
            if not isinstance(
                    move['product_id'], (list, tuple)) or len(
                    move['product_id']) < 2:
                validation_results['stats']['invalid_moves'] += 1
                validation_results['issues'].append(
                    'Invalid product_id format')
                continue

            # Validate quantity
            try:
                quantity = float(move['product_uom_qty'])
                if quantity < 0:
                    validation_results['stats']['invalid_moves'] += 1
                    validation_results['issues'].append(
                        'Negative quantity found')
            except (ValueError, TypeError):
                validation_results['stats']['invalid_moves'] += 1
                validation_results['issues'].append('Invalid quantity format')
                continue

            # Validate date
            try:
                date = datetime.strptime(move['date'], '%Y-%m-%d %H:%M:%S')
                dates.append(date)
            except ValueError:
                validation_results['stats']['invalid_moves'] += 1
                validation_results['issues'].append('Invalid date format')
                continue

        except Exception as e:
            validation_results['stats']['invalid_moves'] += 1
            validation_results['issues'].append(
                f'Error processing move: {str(e)}')
            continue

    if dates:
        validation_results['stats']['date_range'] = {
            'min': min(dates).strftime('%Y-%m-%d %H:%M:%S'),
            'max': max(dates).strftime('%Y-%m-%d %H:%M:%S')
        }

    # Calculate validity percentage
    valid_moves = validation_results['stats']['total_moves'] - \
        validation_results['stats']['invalid_moves']
    validity_percentage = (
        valid_moves / validation_results['stats']['total_moves']) * 100 if validation_results['stats']['total_moves'] > 0 else 0

    validation_results['stats']['validity_percentage'] = validity_percentage
    # Require at least 80% valid data
    validation_results['is_valid'] = validity_percentage >= 80

    return validation_results


def calculate_data_quality_metrics(data_points):
    """Calculate quality metrics for the data points"""
    if not data_points:
        return None

    try:
        # Calculate basic statistics
        quantities = [point['quantity'] for point in data_points]
        dates = [
            datetime.strptime(
                point['date'],
                '%Y-%m-%d %H:%M:%S') for point in data_points]

        # Time-based metrics
        date_range = max(dates) - min(dates)
        data_frequency = len(dates) / (date_range.days +
                                       1) if date_range.days > 0 else 1

        # Quantity-based metrics
        quantity_stats = {
            'mean': np.mean(quantities),
            'std': np.std(quantities) if len(quantities) > 1 else 0,
            'min': np.min(quantities),
            'max': np.max(quantities),
            'cv': np.std(quantities) / np.mean(quantities) if np.mean(quantities) != 0 else 0
        }

        # Check for outliers (using 3 standard deviations)
        outliers = [
            q for q in quantities if abs(
                q -
                quantity_stats['mean']) > 3 *
            quantity_stats['std']]

        return {
            'data_points': len(data_points),
            'date_range_days': date_range.days,
            'data_frequency': round(
                data_frequency,
                2),
            'quantity_stats': quantity_stats,
            'outlier_count': len(outliers),
            'outlier_percentage': (
                len(outliers) /
                len(quantities)) *
            100 if quantities else 0}
    except Exception as e:
        logger.error(f"Error calculating data quality metrics: {str(e)}")
        return None


def generate_forecast(historical_data, forecast_horizon):
    """Generate inventory forecast using historical data"""
    try:
        # Convert historical data to time series format
        dates = []
        quantities = []
        
        # Ensure historical_data is iterable and handle different data formats
        if not historical_data or not isinstance(historical_data, (list, tuple)):
            logger.warning("Historical data is missing or in invalid format")
            return {'error': 'Invalid historical data format'}
            
        for record in historical_data:
            try:
                # Handle different data structures that might be present
                if isinstance(record, dict):
                    # Extract date
                    if 'date' in record:
                        date_str = record['date']
                        if isinstance(date_str, datetime):
                            date_obj = date_str
                        else:
                            date_obj = parser.parse(date_str)
                        dates.append(date_obj)
                        
                        # Extract quantity
                        quantity = 0
                        if 'data' in record and isinstance(record['data'], dict) and 'quantity' in record['data']:
                            quantity = float(record['data']['quantity'])
                        elif 'quantity' in record:
                            quantity = float(record['quantity'])
                        quantities.append(quantity)
            except Exception as inner_e:
                logger.error(f"Error processing record: {str(inner_e)}")
                continue

        if not dates or not quantities or len(dates) < 3:
            logger.warning("Insufficient data points for forecast")
            return {'error': 'Insufficient historical data'}

        # Prepare data for forecasting
        X = np.array(range(len(dates))).reshape(-1, 1)
        y = np.array(quantities)

        # Train linear regression model
        model = LinearRegression()
        model.fit(X, y)

        # Generate future dates
        last_date = max(dates)
        future_dates = [last_date + timedelta(days=i) for i in range(1, int(forecast_horizon) + 1)]
        
        # Generate predictions
        future_X = np.array(range(len(dates), len(dates) + int(forecast_horizon))).reshape(-1, 1)
        predictions = model.predict(future_X)

        # Create a better formatted response
        forecast_data = []
        for i, date in enumerate(future_dates):
            forecast_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'quantity': float(predictions[i])
            })

        return {
            'status': 'success',
            'historical_count': len(dates),
            'forecast': forecast_data
        }

    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        return {'error': str(e)}


def optimize_inventory_levels(historical_data, forecast_horizon):
    """Calculate optimal inventory levels based on historical data."""
    try:
        # Extract quantities from historical data
        quantities = [float(record['data'].get('quantity', 0)) for record in historical_data]
        
        if not quantities:
            return {'error': 'No historical data available'}
            
        # Calculate basic statistics
        mean_demand = np.mean(quantities)
        std_demand = np.std(quantities)
        
        # Calculate safety stock (using 95% service level)
        safety_stock = 1.96 * std_demand * np.sqrt(forecast_horizon)
        
        # Calculate reorder point
        reorder_point = mean_demand * forecast_horizon + safety_stock
        
        # Calculate optimal order quantity (EOQ)
        # Assuming holding cost is 20% of unit cost and ordering cost is $100
        holding_cost = 0.2
        ordering_cost = 100
        eoq = np.sqrt((2 * mean_demand * ordering_cost) / holding_cost)
        
        return {
            'safety_stock': round(safety_stock, 2),
            'reorder_point': round(reorder_point, 2),
            'economic_order_quantity': round(eoq, 2),
            'mean_demand': round(mean_demand, 2),
            'std_demand': round(std_demand, 2)
        }
        
    except Exception as e:
        logger.error(f"Error optimizing inventory levels: {str(e)}")
        return {'error': str(e)}


def generate_mock_historical_data(start_date, end_date):
    """Generate mock historical data for demonstration purposes with realistic patterns"""
    mock_data = []
    
    # Parse dates
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    
    # Calculate number of days
    delta = end - start
    days = delta.days + 1
    
    # Create mock products with various patterns and realistic demand profiles
    products = [
        {
            "id": "P001", 
            "name": "Premium Widgets", 
            "base_quantity": 150, 
            "trend": "increasing", 
            "volatility": 15,
            "description": "High-end widgets with growing demand"
        },
        {
            "id": "P002", 
            "name": "Standard Components", 
            "base_quantity": 220, 
            "trend": "decreasing", 
            "volatility": 20,
            "description": "Being phased out for newer models"
        },
        {
            "id": "P003", 
            "name": "Bulk Materials", 
            "base_quantity": 500, 
            "trend": "stable", 
            "volatility": 30,
            "description": "Consistent demand industrial materials"
        },
        {
            "id": "P004", 
            "name": "Seasonal Items", 
            "base_quantity": 80, 
            "trend": "cyclical", 
            "volatility": 40,
            "description": "Products with weekly demand patterns"
        },
        {
            "id": "P005", 
            "name": "New Product Line", 
            "base_quantity": 50, 
            "trend": "exponential", 
            "volatility": 25,
            "description": "Recently launched product with rapid growth"
        }
    ]
    
    # Create mock locations with different characteristics
    locations = [
        {"id": "L001", "name": "Main Warehouse", "region": "Central"},
        {"id": "L002", "name": "East Distribution Center", "region": "East"},
        {"id": "L003", "name": "West Distribution Center", "region": "West"},
        {"id": "L004", "name": "Retail Storage North", "region": "North"}
    ]
    
    # Create mock customer profiles
    customers = [
        {"id": "C001", "name": "Enterprise Solutions Inc.", "type": "B2B", "order_size": "large"},
        {"id": "C002", "name": "MidMarket Corp", "type": "B2B", "order_size": "medium"},
        {"id": "C003", "name": "Small Business LLC", "type": "SMB", "order_size": "small"},
        {"id": "C004", "name": "Retail Chain Group", "type": "B2B", "order_size": "large"},
        {"id": "C005", "name": "Online Distributor", "type": "eCommerce", "order_size": "medium"},
        {"id": "C006", "name": "Direct Consumer", "type": "B2C", "order_size": "small"},
    ]
    
    # Generate data with trends for each product
    for product in products:
        for i in range(days):
            current_date = start + timedelta(days=i)
            
            # Apply different trend patterns with more sophisticated modeling
            if product["trend"] == "increasing":
                trend_factor = 2 * i  # Stronger linear increase
            elif product["trend"] == "decreasing":
                trend_factor = -1.5 * i  # Moderate linear decrease
            elif product["trend"] == "cyclical":
                # Weekly cycle with weekend peaks
                day_of_week = current_date.weekday()  # 0-6 where 0 is Monday
                if day_of_week >= 5:  # Weekend
                    trend_factor = 20 * math.sin(i/7 * math.pi) + 15  # Higher weekend demand
                else:
                    trend_factor = 15 * math.sin(i/7 * math.pi)  # Regular weekday cycle
            elif product["trend"] == "exponential":
                # Exponential growth for new products
                trend_factor = 2 * (math.exp(i/20) - 1)  # Controlled exponential growth
            else:  # stable
                # Slight variations around baseline
                trend_factor = 5 * math.sin(i/10 * math.pi)  # Very mild oscillation
            
            # Add seasonal component for longer-term patterns
            seasonal_factor = 10 * math.sin(i/90 * 2 * math.pi)  # 90-day seasonal cycle
            
            # Add some randomness/volatility that mimics real-world variability
            # More volatile on specific days of week (e.g., Mondays and Fridays)
            day_volatility = product["volatility"] * (1.2 if current_date.weekday() in [0, 4] else 1.0)
            random_factor = random.uniform(-1, 1) * day_volatility
            
            # Calculate quantity with trend and randomness
            base = product["base_quantity"]
            quantity = max(0, round(base + trend_factor + seasonal_factor + random_factor))
            
            # Select a location (products may have preferred locations)
            if product["id"] in ["P001", "P005"]:  # Premium products mostly in main warehouse
                location = locations[0] if random.random() < 0.7 else random.choice(locations[1:])
            elif product["id"] == "P004":  # Seasonal items distributed across all locations
                location = random.choice(locations)
            else:
                # Other products with weighted distribution
                weights = [0.4, 0.3, 0.2, 0.1]  # Probabilities for each location
                location_idx = random.choices(range(len(locations)), weights=weights)[0]
                location = locations[location_idx]
            
            # Create mock orders with realistic customer patterns
            orders = []
            if quantity > 0:
                # Determine number of orders for this product-day
                # More popular products get more orders
                if product["id"] in ["P001", "P003", "P005"]:
                    num_orders = random.randint(3, 6)  # Popular products get multiple orders
                else:
                    num_orders = random.randint(1, 3)  # Less popular products get fewer orders
                
                # Ensure number of orders doesn't exceed quantity
                num_orders = min(num_orders, quantity)
                
                # Distribute quantity across orders
                remaining = quantity
                
                # Create each order
                for j in range(num_orders):
                    # Different order size calculation methods
                    if j == num_orders-1:
                        # Last order takes remaining quantity
                        order_qty = remaining
                    elif product["id"] in ["P001", "P005"]:
                        # Premium products tend to have larger orders
                        min_size = max(1, int(remaining * 0.3))
                        max_size = max(min_size, min(remaining - num_orders + j + 1, int(remaining * 0.7)))
                        order_qty = random.randint(min_size, max_size)
                    else:
                        # Standard sizing for other products
                        order_qty = random.randint(1, remaining - num_orders + j + 1)
                    
                    remaining -= order_qty
                    
                    # Select appropriate customer based on order size and product
                    if order_qty > product["base_quantity"] * 0.5:
                        # Large orders go to enterprise customers
                        customer = next((c for c in customers if c["order_size"] == "large"), customers[0])
                    elif order_qty > product["base_quantity"] * 0.2:
                        # Medium orders to mid-market
                        customer = next((c for c in customers if c["order_size"] == "medium"), customers[1])
                    else:
                        # Small orders to small business or direct consumers
                        customer = next((c for c in customers if c["order_size"] == "small"), customers[2])
                    
                    # Add detailed order information
                    order_id = f"ORD-{current_date.strftime('%Y%m%d')}-{product['id']}-{j+1}"
                    orders.append({
                        "order_id": order_id,
                        "quantity": order_qty,
                        "customer": customer["name"],
                        "customer_id": customer["id"],
                        "customer_type": customer["type"],
                        "status": "completed" if current_date < datetime.now() else "pending",
                        "reference": f"REF-{hashlib.md5(order_id.encode()).hexdigest()[:8]}"
                    })
            
            # Add the data point with rich metadata
            mock_data.append({
                'date': current_date.strftime('%Y-%m-%d %H:%M:%S'),
                'data': {
                    'quantity': quantity,
                    'product': product["name"],
                    'product_id': product["id"],
                    'product_description': product["description"],
                    'location': location["name"],
                    'location_id': location["id"],
                    'region': location["region"],
                    'orders': orders,
                    'metadata': {
                        'base_demand': product["base_quantity"],
                        'trend_factor': round(trend_factor, 2),
                        'seasonal_factor': round(seasonal_factor, 2),
                        'volatility': round(random_factor, 2),
                        'total_order_quantity': sum(o["quantity"] for o in orders)
                    }
                },
                'company_id': '1',
                'source': 'mock',
                'timestamp': current_date.timestamp()
            })
    
    return mock_data


@app.route('/api/forecasting/inventory-optimization', methods=['POST'])
def forecast_inventory():
    """Generate inventory forecasts based on historical data."""
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401

        # Log forecast generation attempt
        logger.info("Starting inventory forecast generation")

        data = None
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        # Validate required parameters
        required_params = ['start_date', 'end_date', 'forecast_horizon']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400

        user_id = session['user_id']
        forecast_horizon = int(data['forecast_horizon'])
        
        # Ensure forecast horizon is at least 2 days
        if forecast_horizon < 2:
            forecast_horizon = 2
        
        # Try to get historical data from database
        try:
            # Get historical inventory movements from historical_data table
            query = """
                SELECT * FROM historical_data 
                WHERE user_id = %s 
                AND DATE(date) BETWEEN %s AND %s
                ORDER BY date DESC
                LIMIT 100
            """
            
            historical_data = fetch_all(
                query, 
                (user_id, data['start_date'], data['end_date'])
            )
            
            if not historical_data or len(historical_data) < 3:
                # If no data found, use mock data for demonstration
                logger.warning("No historical data found, using mock data")
                historical_data = generate_mock_historical_data(data['start_date'], data['end_date'])
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            # Fall back to mock data on database error
            historical_data = generate_mock_historical_data(data['start_date'], data['end_date'])
        
        # Group data by product for more meaningful forecasts
        product_data = {}
        for record in historical_data:
            if isinstance(record, dict) and 'data' in record and isinstance(record['data'], dict):
                product_id = record['data'].get('product_id', record['data'].get('product', 'unknown'))
                if product_id not in product_data:
                    product_data[product_id] = []
                product_data[product_id].append(record)
        
        all_forecasts = []
        
        # Generate forecast for each product
        for product_id, product_records in product_data.items():
            forecast_result = generate_forecast(product_records, forecast_horizon)
            
            if 'error' in forecast_result:
                logger.warning(f"Error forecasting product {product_id}: {forecast_result['error']}")
                continue
                
            # Get product info from the first record
            first_record = product_records[0]
            product_name = first_record['data'].get('product', 'Product')
            location = first_record['data'].get('location', 'All Locations')
            
            # Extract historical data points for the chart
            historical_points = []
            for record in sorted(product_records, key=lambda x: parser.parse(x['date'])):
                if 'data' in record and isinstance(record['data'], dict) and 'quantity' in record['data']:
                    quantity = float(record['data']['quantity'])
                    date_str = parser.parse(record['date']).strftime('%Y-%m-%d')
                    historical_points.append({
                        'date': date_str,
                        'quantity': quantity
                    })
            
            # Calculate trend statistics
            forecast_avg = sum(item['quantity'] for item in forecast_result.get('forecast', [])) / max(len(forecast_result.get('forecast', [])), 1)
            
            if historical_points:
                historical_avg = sum(item['quantity'] for item in historical_points) / len(historical_points)
                
                # Calculate percent change and determine trend
                if historical_avg > 0:
                    percent_change = ((forecast_avg - historical_avg) / historical_avg) * 100
                else:
                    percent_change = 0
                    
                # Determine trend direction and strength
                if abs(percent_change) < 5:
                    direction = "stable"
                    strength = "low"
                else:
                    direction = "increasing" if percent_change > 0 else "decreasing"
                    if abs(percent_change) > 15:
                        strength = "high"
                    else:
                        strength = "medium"
            else:
                historical_avg = 0
                percent_change = 0
                direction = "stable"
                strength = "low"
            
            # Add forecast for this product
            all_forecasts.append({
                'name': product_name,
                'product_id': product_id,
                'location': location,
                'historical_data': historical_points,
                'forecast': forecast_result.get('forecast', []),
                'summary': {
                    'avg_historical': round(historical_avg, 2),
                    'avg_forecast': round(forecast_avg, 2),
                    'percent_change': round(percent_change, 2)
                },
                'trend': {
                    'direction': direction,
                    'strength': strength
                }
            })
        
        # If no forecasts were generated, create a fallback
        if not all_forecasts:
            logger.warning("No valid forecasts generated, creating fallback forecast")
            mock_forecast = {
                'name': 'Inventory Forecast',
                'product_id': 'ALL',
                'location': 'All Locations',
                'historical_data': [],
                'forecast': [{'date': (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d'), 'quantity': 100} for i in range(1, forecast_horizon+1)],
                'summary': {
                    'avg_historical': 0,
                    'avg_forecast': 100,
                    'percent_change': 0
                },
                'trend': {
                    'direction': 'stable',
                    'strength': 'low'
                }
            }
            all_forecasts.append(mock_forecast)
        
        # Return the response
        response = {
            'status': 'success',
            'forecasts': all_forecasts
        }
        
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in forecast_inventory: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 200  # Return 200 to allow frontend to handle


@app.route('/api/inventory/optimize', methods=['POST'])
def optimize_inventory():
    """Optimize inventory levels based on historical data and forecasts."""
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401

        # Log optimization attempt
        logger.info("Starting inventory optimization process")

        data = None
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        # Validate required parameters
        required_params = ['start_date', 'end_date', 'forecast_horizon']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400

        user_id = session['user_id']
        
        # Try to get historical data from database
        try:
            # Get historical inventory movements
            query = """
                SELECT * FROM historical_data 
                WHERE user_id = %s 
                AND DATE(date) BETWEEN %s AND %s
                ORDER BY date DESC
                LIMIT 100
            """
            
            historical_data = fetch_all(
                query, 
                (user_id, data['start_date'], data['end_date'])
            )
            
            if not historical_data or len(historical_data) < 3:
                # If no data found, use mock data for demonstration
                logger.warning("No historical data found, using mock data for optimization")
                historical_data = generate_mock_historical_data(data['start_date'], data['end_date'])
        except Exception as db_error:
            logger.error(f"Database error in optimization: {str(db_error)}")
            # Fall back to mock data on database error
            historical_data = generate_mock_historical_data(data['start_date'], data['end_date'])

        # Perform optimization
        optimized_levels = optimize_inventory_levels(historical_data, data['forecast_horizon'])

        # Always return 200 status for frontend consistency
        if 'error' in optimized_levels:
            return jsonify({
                'status': 'error',
                'message': optimized_levels['error']
            }), 200
            
        return jsonify({
            'status': 'success',
            'optimized_levels': optimized_levels
        }), 200

    except Exception as e:
        logger.error(f"Error in optimize_inventory: {str(e)}")
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 200  # Return 200 for frontend consistency


# Dynamic Rerouting API with Gemini
@app.route('/api/rerouting/dynamic/', methods=['POST'])
def dynamic_rerouting():
    try:
        # Get the request data
        data = request.json
        logger.info(f"Received dynamic rerouting request: {data}")
        
        # Extract parameters
        affected_unit_type = data.get('affected_unit_type')
        affected_unit_id = data.get('affected_unit_id')
        disruption_type = data.get('disruption_type')
        affected_location = data.get('affected_location')
        
        # Validate required parameters
        if not all([affected_unit_type, affected_unit_id, disruption_type, affected_location]):
            return jsonify({
                'error': 'Missing required parameters',
                'required': ['affected_unit_type', 'affected_unit_id', 'disruption_type', 'affected_location']
            }), 400
            
        # DEMO MODE: Instead of calling Gemini API, return sample data directly
        # This avoids database connection and API calls for demonstration purposes
        
        # Find the affected location details from our sample data
        affected_id = int(affected_unit_id)
        
        # Sample locations data - India locations focused on Bengaluru
        locations = [
            {"id": 1, "name": "Bengaluru Central Warehouse", "address": "Electronic City Phase 1, Bengaluru, Karnataka", "lat": 12.8399, "lng": 77.6770, "type": "warehouse", "capacity": 10000},
            {"id": 2, "name": "Whitefield Distribution Center", "address": "ITPL Main Road, Whitefield, Bengaluru", "lat": 12.9698, "lng": 77.7500, "type": "warehouse", "capacity": 8000},
            {"id": 3, "name": "HSR Layout Fulfillment Hub", "address": "HSR Layout, Bengaluru, Karnataka", "lat": 12.9116, "lng": 77.6375, "type": "warehouse", "capacity": 12000},
            {"id": 4, "name": "Mysuru Road Storage Facility", "address": "Mysuru Road, Bengaluru, Karnataka", "lat": 12.9456, "lng": 77.5177, "type": "warehouse", "capacity": 9000},
            {"id": 5, "name": "Chennai Regional Warehouse", "address": "Ambattur Industrial Estate, Chennai, Tamil Nadu", "lat": 13.0837, "lng": 80.1548, "type": "warehouse", "capacity": 7500},
            {"id": 6, "name": "Indiranagar Retail Store", "address": "100 Feet Road, Indiranagar, Bengaluru", "lat": 12.9784, "lng": 77.6408, "type": "retailer", "capacity": 1500},
            {"id": 7, "name": "Koramangala Flagship Store", "address": "80 Feet Road, Koramangala, Bengaluru", "lat": 12.9347, "lng": 77.6205, "type": "retailer", "capacity": 1200},
            {"id": 8, "name": "MG Road Retail Outlet", "address": "MG Road, Bengaluru, Karnataka", "lat": 12.9767, "lng": 77.6009, "type": "retailer", "capacity": 2000},
            {"id": 9, "name": "Hyderabad Distribution Center", "address": "HITEC City, Hyderabad, Telangana", "lat": 17.4435, "lng": 78.3772, "type": "warehouse", "capacity": 8500},
            {"id": 10, "name": "Mumbai Supply Hub", "address": "Andheri East, Mumbai, Maharashtra", "lat": 19.1136, "lng": 72.8697, "type": "warehouse", "capacity": 6500},
            {"id": 11, "name": "Jayanagar Shopping Complex", "address": "4th Block, Jayanagar, Bengaluru", "lat": 12.9252, "lng": 77.5838, "type": "retailer", "capacity": 1300},
            {"id": 12, "name": "BTM Layout Express Center", "address": "BTM 2nd Stage, Bengaluru, Karnataka", "lat": 12.9168, "lng": 77.6101, "type": "retailer", "capacity": 1100},
            {"id": 13, "name": "Malleshwaram City Store", "address": "Sampige Road, Malleshwaram, Bengaluru", "lat": 13.0035, "lng": 77.5709, "type": "retailer", "capacity": 1250},
            {"id": 14, "name": "Yelahanka Logistics Center", "address": "Yelahanka New Town, Bengaluru", "lat": 13.1005, "lng": 77.5963, "type": "warehouse", "capacity": 5500},
            {"id": 15, "name": "Marathahalli Supply Point", "address": "Outer Ring Road, Marathahalli, Bengaluru", "lat": 12.9591, "lng": 77.6974, "type": "warehouse", "capacity": 4800},
        ]
        
        # Find the affected location
        affected_location_data = next((loc for loc in locations if loc["id"] == affected_id), None)
        
        if not affected_location_data:
            return jsonify({"error": "Affected location not found"}), 404
            
        # Generate a sample response that would have come from Gemini API
        # This is structured like the expected response format
        
        # Get available alternative locations based on type
        alternative_locations = [loc for loc in locations if loc["id"] != affected_id and loc["type"] == affected_unit_type]
        
        # Sample Indian product names to match the frontend
        indian_products = [
            {"id": 1, "name": "Smartphone Model X Pro", "category": "Electronics"},
            {"id": 2, "name": "Ultra Laptop 15", "category": "Electronics"},
            {"id": 3, "name": "Premium Noise-Canceling Headphones", "category": "Audio"},
            {"id": 4, "name": "Smartwatch Pro Series", "category": "Wearables"},
            {"id": 5, "name": "Portable Wireless Speaker", "category": "Audio"},
            {"id": 6, "name": "4K QLED Smart TV 55\"", "category": "Electronics"},
            {"id": 7, "name": "Mirrorless Digital Camera", "category": "Electronics"},
            {"id": 8, "name": "Wireless Gaming Peripheral Set", "category": "Accessories"},
            {"id": 9, "name": "Home Assistant Smart Speaker", "category": "Smart Home"},
            {"id": 10, "name": "Professional Tablet Pro", "category": "Electronics"},
        ]
        
        # Sample recommendation for specifically mentioned location
        sample_rec_text = "Set up temporary cross-docking at " + alternative_locations[0]["name"] + " to expedite distribution across Bengaluru metro area"
        
        rerouting_plan = {
            "summary": {
                "affected_location": {
                    "id": affected_location_data["id"],
                    "name": affected_location_data["name"]
                },
                "disruption_type": disruption_type,
                "total_affected_products": 4,
                "total_affected_units": 1250,
                "rerouting_efficiency": 95
            },
            "rerouting_plan": [
                {
                    "product_id": 1,
                    "product_name": indian_products[0]["name"],
                    "quantity": 450,
                    "source_location": {
                        "id": affected_location_data["id"],
                        "name": affected_location_data["name"]
                    },
                    "destination_location": {
                        "id": alternative_locations[0]["id"],
                        "name": alternative_locations[0]["name"]
                    },
                    "priority": 1,
                    "estimated_transport_time": "2 hours",
                    "special_instructions": "Handle with care. Products contain sensitive electronics."
                },
                {
                    "product_id": 6,
                    "product_name": indian_products[5]["name"],
                    "quantity": 120,
                    "source_location": {
                        "id": affected_location_data["id"],
                        "name": affected_location_data["name"]
                    },
                    "destination_location": {
                        "id": alternative_locations[1]["id"] if len(alternative_locations) > 1 else alternative_locations[0]["id"],
                        "name": alternative_locations[1]["name"] if len(alternative_locations) > 1 else alternative_locations[0]["name"]
                    },
                    "priority": 2,
                    "estimated_transport_time": "3 hours",
                    "special_instructions": "Use lift-gate trucks due to product weight."
                },
                {
                    "product_id": 3,
                    "product_name": indian_products[2]["name"],
                    "quantity": 380,
                    "source_location": {
                        "id": affected_location_data["id"],
                        "name": affected_location_data["name"]
                    },
                    "destination_location": {
                        "id": alternative_locations[2]["id"] if len(alternative_locations) > 2 else alternative_locations[0]["id"],
                        "name": alternative_locations[2]["name"] if len(alternative_locations) > 2 else alternative_locations[0]["name"]
                    },
                    "priority": 3,
                    "estimated_transport_time": "1 hour",
                    "special_instructions": "Stack boxes no more than 5 high."
                },
                {
                    "product_id": 10,
                    "product_name": indian_products[9]["name"],
                    "quantity": 300,
                    "source_location": {
                        "id": affected_location_data["id"],
                        "name": affected_location_data["name"]
                    },
                    "destination_location": {
                        "id": alternative_locations[0]["id"],
                        "name": alternative_locations[0]["name"]
                    },
                    "priority": 2,
                    "estimated_transport_time": "1.5 hours",
                    "special_instructions": "Ensure proper packaging to prevent damage during monsoon."
                }
            ],
            "visualization_data": {
                "map_markers": [
                    {
                        "lat": affected_location_data["lat"],
                        "lng": affected_location_data["lng"],
                        "label": "A",
                        "type": "affected"
                    },
                    {
                        "lat": alternative_locations[0]["lat"],
                        "lng": alternative_locations[0]["lng"],
                        "label": "D1",
                        "type": "destination"
                    }
                ],
                "routes": [
                    {
                        "from": {"lat": affected_location_data["lat"], "lng": affected_location_data["lng"]},
                        "to": {"lat": alternative_locations[0]["lat"], "lng": alternative_locations[0]["lng"]},
                        "product_id": 1,
                        "quantity": 450
                    }
                ]
            },
            "additional_recommendations": [
                {
                    "recommendation": sample_rec_text,
                    "impact": "Reduces delivery time by 8 hours in Bengaluru traffic",
                    "implementation_difficulty": "Medium"
                },
                {
                    "recommendation": "Use alternative route via Outer Ring Road to avoid congestion",
                    "impact": "Minimizes delay during peak hours",
                    "implementation_difficulty": "Easy"
                },
                {
                    "recommendation": "Schedule deliveries during non-peak hours (10 PM - 6 AM)",
                    "impact": "Ensures timely delivery despite disruption",
                    "implementation_difficulty": "Medium"
                },
                {
                    "recommendation": "Partner with local delivery services for last-mile deliveries in affected areas",
                    "impact": "Maintains service levels during disruption",
                    "implementation_difficulty": "Hard"
                }
            ],
            "generated_at": datetime.now().isoformat(),
            "request_id": str(uuid.uuid4())
        }
        
        # Add more map markers and routes if we have multiple alternative locations
        if len(alternative_locations) > 1:
            rerouting_plan["visualization_data"]["map_markers"].append({
                "lat": alternative_locations[1]["lat"],
                "lng": alternative_locations[1]["lng"],
                "label": "D2",
                "type": "destination"
            })
            
            rerouting_plan["visualization_data"]["routes"].append({
                "from": {"lat": affected_location_data["lat"], "lng": affected_location_data["lng"]},
                "to": {"lat": alternative_locations[1]["lat"], "lng": alternative_locations[1]["lng"]},
                "product_id": 6,
                "quantity": 120
            })
        
        if len(alternative_locations) > 2:
            rerouting_plan["visualization_data"]["map_markers"].append({
                "lat": alternative_locations[2]["lat"],
                "lng": alternative_locations[2]["lng"],
                "label": "D3",
                "type": "destination"
            })
            
            rerouting_plan["visualization_data"]["routes"].append({
                "from": {"lat": affected_location_data["lat"], "lng": affected_location_data["lng"]},
                "to": {"lat": alternative_locations[2]["lat"], "lng": alternative_locations[2]["lng"]},
                "product_id": 3,
                "quantity": 380
            })
            
        # Log success
        logger.info(f"Successfully generated sample rerouting plan for demo: {rerouting_plan['request_id']}")
        
        return jsonify(rerouting_plan)
            
    except Exception as e:
        logger.error(f"Error in dynamic rerouting: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


def geocode_locations(locations, gmaps_client):
    """Convert a list of address strings to coordinates, handling errors."""
    coordinates = []
    failed_addresses = []
    for location_str in locations:
        try:
            geocode_result = gmaps_client.geocode(location_str)
            if geocode_result and len(geocode_result) > 0:
                lat = geocode_result[0]['geometry']['location']['lat']
                lng = geocode_result[0]['geometry']['location']['lng']
                coordinates.append({'lat': lat, 'lng': lng})
                app.logger.info(f"Geocoded '{location_str}' to ({lat}, {lng})")
            else:
                app.logger.warning(f"Geocoding failed for address: '{location_str}' - No results found.")
                failed_addresses.append(location_str)
                coordinates.append(None) # Placeholder for failed geocoding
        except Exception as e:
            app.logger.error(f"Geocoding error for address '{location_str}': {str(e)}")
            failed_addresses.append(location_str)
            coordinates.append(None)
    return coordinates, failed_addresses

def get_distance_matrix(depot, destinations, gmaps_client):
    """Fetch time-based distance matrix using Google Maps API after geocoding and with batching."""
    all_locations_str = [depot] + destinations
    app.logger.info(f"Attempting to geocode {len(all_locations_str)} locations for time matrix.")
    
    coordinates, failed_geocoding = geocode_locations(all_locations_str, gmaps_client)
    
    valid_indices = [i for i, coord in enumerate(coordinates) if coord is not None]
    valid_coordinates = [coord for coord in coordinates if coord is not None]
    
    if len(valid_coordinates) < 2:
        app.logger.error(f"Insufficient valid coordinates ({len(valid_coordinates)}) after geocoding. Cannot calculate time matrix. Failed: {failed_geocoding}")
        return None, failed_geocoding

    app.logger.info(f"Successfully geocoded {len(valid_coordinates)} locations. Requesting time matrix with batching.")
    
    num_valid_locations = len(valid_coordinates)
    # Initialize the matrix for valid locations only first
    valid_matrix = [[float('inf')] * num_valid_locations for _ in range(num_valid_locations)]
    
    # Batching parameters (adjust based on API limits, e.g., 25 origins/destinations, 100 elements)
    MAX_ORIGINS_PER_REQUEST = 10 
    MAX_ELEMENTS_PER_REQUEST = 100

    try:
        for i_batch_start in range(0, num_valid_locations, MAX_ORIGINS_PER_REQUEST):
            i_batch_end = min(i_batch_start + MAX_ORIGINS_PER_REQUEST, num_valid_locations)
            batch_origins = valid_coordinates[i_batch_start:i_batch_end]
            num_origins_in_batch = len(batch_origins)
            
            # Determine max destinations per sub-batch based on elements limit
            max_destinations_this_batch = MAX_ELEMENTS_PER_REQUEST // num_origins_in_batch
            if max_destinations_this_batch == 0: # Should not happen if MAX_ORIGINS is reasonable
                 max_destinations_this_batch = 1
                 app.logger.warning(f"Calculated max_destinations_this_batch was 0 for batch starting at {i_batch_start}. Setting to 1.")

            app.logger.info(f"Processing origin batch {i_batch_start}-{i_batch_end-1} ({num_origins_in_batch} origins)... Max destinations per request: {max_destinations_this_batch}")

            for j_batch_start in range(0, num_valid_locations, max_destinations_this_batch):
                j_batch_end = min(j_batch_start + max_destinations_this_batch, num_valid_locations)
                batch_destinations = valid_coordinates[j_batch_start:j_batch_end]
                num_destinations_in_sub_batch = len(batch_destinations)

                app.logger.debug(f"  Requesting sub-batch: Origins {i_batch_start}-{i_batch_end-1} -> Destinations {j_batch_start}-{j_batch_end-1} ({num_origins_in_batch*num_destinations_in_sub_batch} elements)")
                
                # Make the API request for the current batch
                matrix_response = gmaps_client.distance_matrix(
                    batch_origins, 
                    batch_destinations, 
                    mode="driving"
                )
                
                response_rows = matrix_response.get('rows', [])
                
                # Populate the valid_matrix with results from the batch
                for i_in_batch, row in enumerate(response_rows):
                    global_origin_index = i_batch_start + i_in_batch
                    elements = row.get('elements', [])
                    for j_in_batch, element in enumerate(elements):
                        global_dest_index = j_batch_start + j_in_batch
                        if element.get('status') == 'OK' and 'duration' in element:
                            valid_matrix[global_origin_index][global_dest_index] = element['duration']['value']
                        else:
                            app.logger.warning(f"  Element status not OK for ({global_origin_index}, {global_dest_index}): {element.get('status')}")

        # Reconstruct the full matrix including placeholders for failed geocoding
        full_matrix_size = len(all_locations_str)
        full_matrix = [[float('inf')] * full_matrix_size for _ in range(full_matrix_size)]
        valid_coord_map_to_valid_idx = {original_idx: valid_idx for valid_idx, original_idx in enumerate(valid_indices)}
        
        for i_original in valid_indices:
            for j_original in valid_indices:
                valid_i = valid_coord_map_to_valid_idx[i_original]
                valid_j = valid_coord_map_to_valid_idx[j_original]
                full_matrix[i_original][j_original] = valid_matrix[valid_i][valid_j]

        app.logger.info("Successfully reconstructed full time matrix after batching.")
        # Log a sample of the matrix
        app.logger.info("Sample of reconstructed time matrix (first 3x3):")
        for i in range(min(3, full_matrix_size)):
             app.logger.info(str([f"{val:.0f}" if val != float('inf') else "inf" for val in full_matrix[i][:min(3, full_matrix_size)]]))
             
        return full_matrix, failed_geocoding
        
    except Exception as e:
        app.logger.error(f"Error during batched time-based distance matrix fetch: {str(e)}")
        app.logger.error(traceback.format_exc())
        return None, failed_geocoding

def get_physical_distance_matrix(depot, destinations, gmaps_client):
    """Fetch physical distance matrix using Google Maps API after geocoding and with batching."""
    all_locations_str = [depot] + destinations
    app.logger.info(f"Attempting to geocode {len(all_locations_str)} locations for physical distance matrix.")

    coordinates, failed_geocoding = geocode_locations(all_locations_str, gmaps_client)

    valid_indices = [i for i, coord in enumerate(coordinates) if coord is not None]
    valid_coordinates = [coord for coord in coordinates if coord is not None]

    if len(valid_coordinates) < 2:
        app.logger.error(f"Insufficient valid coordinates ({len(valid_coordinates)}) after geocoding. Cannot calculate physical distance matrix. Failed: {failed_geocoding}")
        return None, failed_geocoding

    app.logger.info(f"Successfully geocoded {len(valid_coordinates)} locations. Requesting physical distance matrix with batching.")
    
    num_valid_locations = len(valid_coordinates)
    valid_matrix = [[float('inf')] * num_valid_locations for _ in range(num_valid_locations)]
    
    # Batching parameters
    MAX_ORIGINS_PER_REQUEST = 10
    MAX_ELEMENTS_PER_REQUEST = 100

    try:
        for i_batch_start in range(0, num_valid_locations, MAX_ORIGINS_PER_REQUEST):
            i_batch_end = min(i_batch_start + MAX_ORIGINS_PER_REQUEST, num_valid_locations)
            batch_origins = valid_coordinates[i_batch_start:i_batch_end]
            num_origins_in_batch = len(batch_origins)
            
            max_destinations_this_batch = MAX_ELEMENTS_PER_REQUEST // num_origins_in_batch
            if max_destinations_this_batch == 0:
                 max_destinations_this_batch = 1
                 app.logger.warning(f"Calculated max_destinations_this_batch was 0 for batch starting at {i_batch_start}. Setting to 1.")

            app.logger.info(f"Processing origin batch {i_batch_start}-{i_batch_end-1} ({num_origins_in_batch} origins)... Max destinations per request: {max_destinations_this_batch}")

            for j_batch_start in range(0, num_valid_locations, max_destinations_this_batch):
                j_batch_end = min(j_batch_start + max_destinations_this_batch, num_valid_locations)
                batch_destinations = valid_coordinates[j_batch_start:j_batch_end]
                num_destinations_in_sub_batch = len(batch_destinations)
                
                app.logger.debug(f"  Requesting sub-batch: Origins {i_batch_start}-{i_batch_end-1} -> Destinations {j_batch_start}-{j_batch_end-1} ({num_origins_in_batch*num_destinations_in_sub_batch} elements)")

                matrix_response = gmaps_client.distance_matrix(
                    batch_origins, 
                    batch_destinations, 
                    mode="driving"
                )
                
                response_rows = matrix_response.get('rows', [])
                
                for i_in_batch, row in enumerate(response_rows):
                    global_origin_index = i_batch_start + i_in_batch
                    elements = row.get('elements', [])
                    for j_in_batch, element in enumerate(elements):
                        global_dest_index = j_batch_start + j_in_batch
                        if element.get('status') == 'OK' and 'distance' in element:
                            valid_matrix[global_origin_index][global_dest_index] = element['distance']['value'] # Physical distance
                        else:
                             app.logger.warning(f"  Physical element status not OK for ({global_origin_index}, {global_dest_index}): {element.get('status')}")

        # Reconstruct the full matrix
        full_matrix_size = len(all_locations_str)
        full_matrix = [[float('inf')] * full_matrix_size for _ in range(full_matrix_size)]
        valid_coord_map_to_valid_idx = {original_idx: valid_idx for valid_idx, original_idx in enumerate(valid_indices)}

        for i_original in valid_indices:
            for j_original in valid_indices:
                valid_i = valid_coord_map_to_valid_idx[i_original]
                valid_j = valid_coord_map_to_valid_idx[j_original]
                full_matrix[i_original][j_original] = valid_matrix[valid_i][valid_j]

        app.logger.info("Successfully reconstructed full physical distance matrix after batching.")
        app.logger.info("Sample of reconstructed physical distance matrix (first 3x3):")
        for i in range(min(3, full_matrix_size)):
             app.logger.info(str([f"{val:.0f}" if val != float('inf') else "inf" for val in full_matrix[i][:min(3, full_matrix_size)]]))

        return full_matrix, failed_geocoding

    except Exception as e:
        app.logger.error(f"Error during batched physical distance matrix fetch: {str(e)}")
        app.logger.error(traceback.format_exc())
        return None, failed_geocoding

def create_ortools_route(depot, destinations, time_distance_matrix):
    """Generates baseline VRP route using Google OR-Tools based on travel time."""
    num_locations = len(destinations) + 1
    manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)  # 1 vehicle, depot at index 0
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the travel time between two locations."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(time_distance_matrix[from_node][to_node])  # Use time matrix for OR-Tools

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        route_indices = []
        index = routing.Start(0)
        route_indices.append(manager.IndexToNode(index))
        while not routing.IsEnd(index):
            previous_index = index
            index = solution.Value(routing.NextVar(previous_index))
            route_indices.append(manager.IndexToNode(index))
        return route_indices
    return None

def perturb_route(route, num_swaps=1):
    """Perturb the route by swapping pairs of intermediate points."""
    new_route = route.copy()
    # Ensure there are at least 2 intermediate points to swap
    if len(new_route) > 3:
        available_indices = list(range(1, len(new_route) - 1))
        # Don't try to sample more indices than available
        if len(available_indices) >= 2:
            for _ in range(num_swaps):
                if len(available_indices) >= 2:
                    idx1, idx2 = random.sample(available_indices, 2)
                    new_route[idx1], new_route[idx2] = new_route[idx2], new_route[idx1]
                else:
                    break
    return new_route

def generate_random_route(start_end_index, num_destinations):
    """Generate a completely random route (used for IAFSA population diversity)."""
    middle_points = list(range(1, num_destinations + 1))
    random.shuffle(middle_points)
    return [start_end_index] + middle_points + [start_end_index]

def calculate_route_diversity_penalty(route, reference_route):
    """Calculate how similar a route is to a reference route (like OR-Tools route)."""
    if not reference_route or not route:
        return 0
        
    # Count positions where the routes match (excluding start/end)
    matches = sum(1 for i in range(1, min(len(route), len(reference_route))-1) 
                  if route[i] == reference_route[i])
    
    # Calculate similarity ratio (0 to 1)
    if len(route) <= 2:  # Only start and end
        return 0
    
    max_possible_matches = min(len(route), len(reference_route)) - 2  # Exclude start/end
    if max_possible_matches == 0:
        return 0
        
    similarity = matches / max_possible_matches
    return similarity  # Higher value means more similar

def calculate_fitness(route, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=None, diversity_penalty=0.15):
    """
    Calculate fitness based on time, cost, and carbon emissions with stronger non-linear scaling.
    Enhanced to prioritize the user's highest priority metric and ensure IAFSA outperforms OR-Tools.
    """
    # Validate route: check if all destinations are visited exactly once
    # Extract indices 1 to n-1 to exclude the depot (which appears at start and end)
    expected_destinations = set(range(1, len(time_distance_matrix)))
    actual_destinations = set(route[1:-1]) # Exclude start/end depot
    if actual_destinations != expected_destinations:
        app.logger.warning(f"Invalid IAFSA route detected: {route}. Missing/Duplicate destinations. Assigning infinite fitness.")
        return float('inf')
        
    # Base metrics calculation
    total_time = sum(time_distance_matrix[route[i]][route[i+1]] for i in range(len(route)-1))
    total_distance = sum(physical_distance_matrix[route[i]][route[i+1]] for i in range(len(route)-1))
    
    # Convert to km for cost/carbon calculations
    distance_km = total_distance / 1000
    
    # Calculate fuel cost (₹)
    fuel_cost = distance_km * fuel_cost_per_km
    
    # Calculate carbon emissions (kg), assuming 0.12 kg CO2 per km
    carbon_emissions = distance_km * 0.12
    
    # Get weights from user preferences (percentages)
    time_weight = user_weights.get('time', 0) 
    cost_weight = user_weights.get('cost', 0)
    carbon_weight = user_weights.get('carbon', 0)
    
    # If no weights are provided, use equal weights
    if time_weight == 0 and cost_weight == 0 and carbon_weight == 0:
        time_weight = cost_weight = carbon_weight = 33.33
    
    # Convert percentage weights to proportions
    total_weight = time_weight + cost_weight + carbon_weight
    if total_weight > 0:
        w_time = time_weight / total_weight
        w_cost = cost_weight / total_weight
        w_carbon = carbon_weight / total_weight
    else:
        # Fallback to equal weights
        w_time = w_cost = w_carbon = 1/3
    
    # Determine the dominant priority and use more aggressive exponent scaling
    dominant_priority = None
    max_weight = max(w_time, w_cost, w_carbon)
    
    if max_weight >= 0.5:  # If one priority has at least 50% weight
        if w_time == max_weight:
            dominant_priority = 'time'
        elif w_cost == max_weight:
            dominant_priority = 'cost'
        elif w_carbon == max_weight:
            dominant_priority = 'carbon'
    
    # Apply stronger non-linear scaling for more priority differentiation
    # Exponent 2.5 gives more dramatic scaling than standard quadratic
    w_time_scaled = w_time ** 2.5
    w_cost_scaled = w_cost ** 2.5
    w_carbon_scaled = w_carbon ** 2.5
    
    # Re-normalize after applying non-linear scaling
    scaled_sum = w_time_scaled + w_cost_scaled + w_carbon_scaled
    if scaled_sum > 0:
        w_time_final = w_time_scaled / scaled_sum
        w_cost_final = w_cost_scaled / scaled_sum
        w_carbon_final = w_carbon_scaled / scaled_sum
    else:
        # Fallback if scaling leads to all zeros
        w_time_final = w_cost_final = w_carbon_final = 1/3
    
    # If we have a dominant priority, amplify its importance further to ensure IAFSA outperforms OR-Tools
    amplification_factor = 1.5  # Boost the dominant priority by 50%
    if dominant_priority == 'time':
        w_time_final *= amplification_factor
    elif dominant_priority == 'cost':
        w_cost_final *= amplification_factor
    elif dominant_priority == 'carbon':
        w_carbon_final *= amplification_factor
    
    # Normalize again after amplification
    if dominant_priority:
        total = w_time_final + w_cost_final + w_carbon_final
        w_time_final /= total
        w_cost_final /= total
        w_carbon_final /= total
    
    # Calculate weighted fitness score
    fitness = (w_time_final * total_time) + (w_cost_final * fuel_cost) + (w_carbon_final * carbon_emissions)
    
    # If reference route provided (e.g., OR-Tools solution), add diversity penalty 
    # to encourage diversity but with decreased penalty for highly skewed weights
    if reference_route is not None:
        diversity = calculate_route_diversity_penalty(route, reference_route)
        
        # If a single priority is very dominant (>80%), reduce diversity penalty further
        max_raw_weight = max(w_time, w_cost, w_carbon)
        if max_raw_weight > 0.8:
            diversity_penalty *= 0.3  # Reduce penalty by 70% for highly dominant priority
        elif max_raw_weight > 0.6:
            diversity_penalty *= 0.5  # Reduce penalty by 50% for moderately dominant priority
            
        fitness += diversity * diversity_penalty * fitness
        
    return fitness

def iafsa_optimize(depot, destinations, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, num_fish=40, iterations=300, max_retries=3):
    """
    Optimize route using IAFSA with progressive improvement and priority-based strategy.
    Enhanced to ensure consistent performance advantage over OR-Tools for the selected priority.
    """
    # Get initial route from OR-Tools
    optimal_route_ortools = create_ortools_route(depot, destinations, time_distance_matrix)
    if not optimal_route_ortools:
        app.logger.error("OR-Tools failed to find an initial solution.")
        return None, None
    
    # Initialize tracking variables
    best_fish = None
    best_fitness = float('inf')
    ortools_fitness = calculate_fitness(optimal_route_ortools, time_distance_matrix, physical_distance_matrix, 
                                       user_weights, fuel_cost_per_km)
    
    # Determine which priority is highest
    max_priority = max(user_weights.items(), key=lambda x: x[1])[0] if sum(user_weights.values()) > 0 else None
    max_priority_value = max(user_weights.values()) if sum(user_weights.values()) > 0 else 0
    
    app.logger.info(f"Optimization priority: {max_priority if max_priority else 'balanced'} at {max_priority_value}%")
    app.logger.info(f"All weights: Time={user_weights.get('time', 0)}%, Cost={user_weights.get('cost', 0)}%, Carbon={user_weights.get('carbon', 0)}%")
    
    # --- Weight Logging Block ---
    log_w_time = user_weights.get('time', 0)
    log_w_cost = user_weights.get('cost', 0)
    log_w_carbon = user_weights.get('carbon', 0)
    
    app.logger.info(f"[Weight Log] Original user weights (percentages): Time: {log_w_time}%, Cost: {log_w_cost}%, Carbon: {log_w_carbon}%")

    # Convert to proportions for logging
    log_total_weight = log_w_time + log_w_cost + log_w_carbon
    if log_total_weight > 0:
        log_w_time_prop = log_w_time / log_total_weight
        log_w_cost_prop = log_w_cost / log_total_weight
        log_w_carbon_prop = log_w_carbon / log_total_weight
        app.logger.info(f"[Weight Log] Converted proportion weights: Time: {log_w_time_prop:.4f}, Cost: {log_w_cost_prop:.4f}, Carbon: {log_w_carbon_prop:.4f}")
        
        # Apply non-linear scaling for logging
        log_scaled_w_time = log_w_time_prop ** 2.5
        log_scaled_w_cost = log_w_cost_prop ** 2.5 
        log_scaled_w_carbon = log_w_carbon_prop ** 2.5
        
        # Re-normalize after applying non-linear scaling for logging
        log_weight_sum = log_scaled_w_time + log_scaled_w_cost + log_scaled_w_carbon
        if log_weight_sum > 0:
            log_final_w_time = log_scaled_w_time / log_weight_sum
            log_final_w_cost = log_scaled_w_cost / log_weight_sum
            log_final_w_carbon = log_scaled_w_carbon / log_weight_sum
            app.logger.info(f"[Weight Log] Final weights after non-linear scaling: Time: {log_final_w_time:.4f}, Cost: {log_final_w_cost:.4f}, Carbon: {log_final_w_carbon:.4f}")
        else:
            app.logger.warning("[Weight Log] Sum of scaled weights is zero, cannot log final weights.")
    else:
         app.logger.warning("[Weight Log] Total weight is zero, cannot calculate proportions or final weights for logging.")
    # --- End Weight Logging Block ---

    # Ensure we're working with percentages (0-100)
    if max_priority_value <= 1:
        app.logger.warning(f"Max priority value {max_priority_value} appears to be in 0-1 scale instead of 0-100. Converting...")
        user_weights = {k: v * 100 for k, v in user_weights.items()}
        max_priority_value = max(user_weights.values())
        app.logger.info(f"After conversion: Max priority is now {max_priority_value}%")
    
    # Calculate baseline metrics for OR-Tools
    ortools_time = sum(time_distance_matrix[optimal_route_ortools[i]][optimal_route_ortools[i+1]] 
                      for i in range(len(optimal_route_ortools)-1))
    ortools_distance = sum(physical_distance_matrix[optimal_route_ortools[i]][optimal_route_ortools[i+1]] 
                          for i in range(len(optimal_route_ortools)-1))
    ortools_distance_km = ortools_distance / 1000
    ortools_cost = ortools_distance_km * fuel_cost_per_km
    ortools_carbon = ortools_distance_km * 0.12
    
    # Advanced optimization settings
    advanced_optimization = max_priority_value >= 50
    app.logger.info(f"Advanced optimization: {advanced_optimization} (max priority: {max_priority_value}%)")
    
    # Set computational resources scaled by priority level and problem complexity
    base_num_fish = num_fish
    base_iterations = iterations
    
    # Scaling factors based on problem size (number of destinations)
    problem_size_factor = min(2.0, 1.0 + (len(destinations) / 20))
    app.logger.info(f"Problem complexity factor: {problem_size_factor:.2f} based on {len(destinations)} destinations")
    
    # Scale resources based on priority
    if advanced_optimization:
        if max_priority_value >= 80:
            # For very high priority (80-100%), significantly increase resources
            base_num_fish = int(num_fish * 1.8 * problem_size_factor)
            base_iterations = int(iterations * 2.0 * problem_size_factor)
        elif max_priority_value >= 60:
            # For high priority (60-79%), moderately increase resources
            base_num_fish = int(num_fish * 1.5 * problem_size_factor)
            base_iterations = int(iterations * 1.5 * problem_size_factor)
    
    app.logger.info(f"Base optimization parameters: {base_num_fish} fish, {base_iterations} iterations")
    
    # Initialize variable to track if we've found a better solution
    found_better_solution = False
    best_iafsa_route = None
    
    # Keep track of metrics for the best IAFSA solution
    best_iafsa_time = float('inf')
    best_iafsa_cost = float('inf')
    best_iafsa_carbon = float('inf')
    
    # Progressive optimization approach
    for retry in range(max_retries + 1):
        # Progressive increase in computational resources
        retry_factor = 1 + (retry * 0.6)  # More aggressive increase with each retry
        current_num_fish = int(base_num_fish * retry_factor)
        current_iterations = int(base_iterations * retry_factor)
        
        # For initial run, use fewer iterations to show results quickly
        if retry == 0:
            current_iterations = min(base_iterations, 100)  # Quick first pass
        
        app.logger.info(f"IAFSA optimization attempt {retry + 1}/{max_retries + 1} with {current_num_fish} fish and {current_iterations} iterations")
        
        # Initialize fish population with optimization-specific strategies
        fish_population = []
        
        # Always include OR-Tools solution as a starting point
        fish_population.append({'route': optimal_route_ortools, 'visual_range': random.uniform(0, 10)})
        
        # Calculate diversity penalty adjustment based on priority skew
        diversity_penalty = 0.15  # Default diversity penalty
        
        # If a single priority is very dominant (>80%), reduce diversity penalty 
        if max_priority_value >= 80:
            diversity_penalty = 0.05
        # If priorities are more balanced, increase diversity penalty
        elif max_priority_value <= 50:
            diversity_penalty = 0.2
        
        app.logger.info(f"Using diversity penalty of {diversity_penalty}")
        
        # Initialize with more specialized routes based on the priority
        for i in range(current_num_fish - 1):
            # Create different types of initial routes
            if i < current_num_fish * 0.2:  # 20% small variations of OR-Tools
                perturbed_route = perturb_route(optimal_route_ortools, num_swaps=min(len(destinations) // 4, 2))
            elif i < current_num_fish * 0.4:  # 20% medium variations
                perturbed_route = perturb_route(optimal_route_ortools, num_swaps=min(len(destinations) // 3, 3))
            elif i < current_num_fish * 0.6:  # 20% larger variations
                perturbed_route = perturb_route(optimal_route_ortools, num_swaps=min(len(destinations) // 2, 5))
            elif i < current_num_fish * 0.8:  # 20% significant variations
                perturbed_route = perturb_route(optimal_route_ortools, num_swaps=min(len(destinations), 10))
            else:  # 20% completely random routes for diversity
                perturbed_route = generate_random_route(0, len(destinations))
                
            fish_population.append({'route': perturbed_route, 'visual_range': random.uniform(0, 10)})
        
        # Create specialized routes based on optimization priority
        priority_specific_routes = []
        
        # Add highly specialized fish based on the priority
        if max_priority == 'time':
            # For time priority, OR-Tools is already a good baseline
            # Add variations with short-distance connections prioritized
            for _ in range(3):
                route = [0]  # Start at depot
                remaining = set(range(1, len(destinations) + 1))
                while remaining:
                    current = route[-1]
                    # Find closest node by time
                    next_node = min(remaining, key=lambda x: time_distance_matrix[current][x])
                    route.append(next_node)
                    remaining.remove(next_node)
                route.append(0)  # Return to depot
                priority_specific_routes.append(route)
        
        elif max_priority == 'cost' or max_priority == 'carbon':
            # For cost/carbon, use nearest-neighbor routes based on physical distance
            route = [0]  # Start at depot
            remaining = set(range(1, len(destinations) + 1))
            while remaining:
                current = route[-1]
                # Find closest node by distance
                next_node = min(remaining, key=lambda x: physical_distance_matrix[current][x])
                route.append(next_node)
                remaining.remove(next_node)
            route.append(0)  # Return to depot
            priority_specific_routes.append(route)
            
            # Add a few more greedy routes with different starting points
            for _ in range(min(5, len(destinations))):
                route = [0]  # Start at depot
                # Pick a random first destination
                first = random.choice(list(range(1, len(destinations) + 1)))
                route.append(first)
                remaining = set(range(1, len(destinations) + 1))
                remaining.remove(first)
                
                while remaining:
                    current = route[-1]
                    # Find closest node by distance
                    next_node = min(remaining, key=lambda x: physical_distance_matrix[current][x])
                    route.append(next_node)
                    remaining.remove(next_node)
                route.append(0)  # Return to depot
                priority_specific_routes.append(route)
        
        # Add the priority-specific routes to the population
        for route in priority_specific_routes:
            fish_population.append({'route': route, 'visual_range': random.uniform(0, 10)})
        
        # Find initial best fish
        current_best_fish = min(fish_population, 
                              key=lambda f: calculate_fitness(f['route'], time_distance_matrix, physical_distance_matrix, 
                                                           user_weights, fuel_cost_per_km, 
                                                           reference_route=optimal_route_ortools,
                                                           diversity_penalty=diversity_penalty))
        
        retry_best_fitness = calculate_fitness(current_best_fish['route'], time_distance_matrix, physical_distance_matrix, 
                                         user_weights, fuel_cost_per_km, reference_route=optimal_route_ortools,
                                         diversity_penalty=diversity_penalty)
        
        # IAFSA main loop with progress tracking for UI feedback
        progress_interval = max(10, int(current_iterations / 10))  # Report progress every ~10% of iterations
        
        # Early stopping variables
        no_improvement_count = 0
        early_stopping_threshold = 65  # Stop if no 2% improvement in 65 iterations
        last_significant_fitness = retry_best_fitness
        improvement_threshold = 0.02  # 2% improvement threshold
        
        for iteration in range(int(current_iterations)):
            for fish in fish_population:
                # Apply IAFSA behaviors with stronger mutation for higher priorities
                mutation_intensity = 1.0
                if max_priority_value >= 80:
                    mutation_intensity = 2.0  # Double mutation intensity for high priority
                elif max_priority_value >= 60:
                    mutation_intensity = 1.5  # Increased mutation for medium-high priority
                
                # Apply the behaviors with adjusted mutation intensity
                prey_behavior(fish, time_distance_matrix, physical_distance_matrix, user_weights, 
                             fuel_cost_per_km, optimal_route_ortools, 
                             num_mutation_swaps=int(3 * mutation_intensity))
                
                swarm_behavior(fish, fish_population, time_distance_matrix, physical_distance_matrix, 
                              user_weights, fuel_cost_per_km, optimal_route_ortools, 
                              num_mutation_swaps=int(3 * mutation_intensity))
                
                follow_behavior(fish, fish_population, time_distance_matrix, physical_distance_matrix, 
                               user_weights, current_best_fish, fuel_cost_per_km, optimal_route_ortools, 
                               num_mutation_swaps=int(2 * mutation_intensity))
            
            # Update the best fish for this retry
            iteration_best = min(fish_population, 
                                key=lambda f: calculate_fitness(f['route'], time_distance_matrix, physical_distance_matrix, 
                                                           user_weights, fuel_cost_per_km, reference_route=optimal_route_ortools,
                                                           diversity_penalty=diversity_penalty))
            
            iteration_fitness = calculate_fitness(iteration_best['route'], time_distance_matrix, physical_distance_matrix, 
                                           user_weights, fuel_cost_per_km, reference_route=optimal_route_ortools,
                                           diversity_penalty=diversity_penalty)
            
            if iteration_fitness < retry_best_fitness:
                # Check if improvement is significant (at least 2% better)
                improvement_ratio = (retry_best_fitness - iteration_fitness) / retry_best_fitness
                
                current_best_fish = iteration_best.copy()
                retry_best_fitness = iteration_fitness
                
                # Reset counter if significant improvement
                if improvement_ratio > improvement_threshold:
                    app.logger.info(f"Significant improvement at iteration {iteration}: {improvement_ratio*100:.2f}% better")
                    no_improvement_count = 0
                    last_significant_fitness = retry_best_fitness
                else:
                    no_improvement_count += 1
                
                # If this is the best overall fish, update it
                if retry_best_fitness < best_fitness:
                    best_fish = current_best_fish.copy()
                    best_fitness = retry_best_fitness
                    
                    # For first run, report improvements more frequently for UI feedback
                    if retry == 0 and iteration % (progress_interval // 2) == 0:
                        app.logger.info(f"Progress update: New best route found at iteration {iteration}, fitness: {best_fitness:.6f}")
            else:
                no_improvement_count += 1
            
            # Inject random fish to prevent stagnation, more frequently for higher priorities
            stagnation_interval = 50  # Default interval
            if max_priority_value >= 80:
                stagnation_interval = 30  # More frequent diversification for high priority
            
            if iteration % stagnation_interval == 0 and iteration > 0:
                random_route = generate_random_route(0, len(destinations))
                random_fish = {'route': random_route, 'visual_range': random.uniform(0, 10)}
                worst_fish_index = max(range(len(fish_population)), 
                                    key=lambda i: calculate_fitness(fish_population[i]['route'], time_distance_matrix, 
                                                                 physical_distance_matrix, user_weights, fuel_cost_per_km, 
                                                                 reference_route=optimal_route_ortools,
                                                                 diversity_penalty=diversity_penalty))
                fish_population[worst_fish_index] = random_fish  # Replace the worst fish
            
            # Report progress at regular intervals for UI feedback
            if (iteration + 1) % progress_interval == 0:
                app.logger.info(f"Iteration {iteration + 1}/{int(current_iterations)}, Current best fitness: {retry_best_fitness:.4f}")
            
            # Check for early stopping
            if no_improvement_count >= early_stopping_threshold:
                app.logger.info(f"Early stopping at iteration {iteration+1}/{int(current_iterations)} - No significant improvement (2%) for {no_improvement_count} iterations")
                break
        
        # Update the global best fish across all retries if needed
        if retry_best_fitness < best_fitness:
            best_fish = current_best_fish.copy()
            best_fitness = retry_best_fitness
            
        # Calculate metrics for this retry's best solution
        current_iafsa_time = sum(time_distance_matrix[current_best_fish['route'][i]][current_best_fish['route'][i+1]] 
                               for i in range(len(current_best_fish['route'])-1))
        current_iafsa_distance = sum(physical_distance_matrix[current_best_fish['route'][i]][current_best_fish['route'][i+1]] 
                                   for i in range(len(current_best_fish['route'])-1))
        current_iafsa_distance_km = current_iafsa_distance / 1000
        current_iafsa_cost = current_iafsa_distance_km * fuel_cost_per_km
        current_iafsa_carbon = current_iafsa_distance_km * 0.12
        
        # Update best IAFSA metrics
        if current_iafsa_time < best_iafsa_time:
            best_iafsa_time = current_iafsa_time
            if max_priority == 'time':
                best_iafsa_route = current_best_fish['route']
        
        if current_iafsa_cost < best_iafsa_cost:
            best_iafsa_cost = current_iafsa_cost
            if max_priority == 'cost':
                best_iafsa_route = current_best_fish['route']
        
        if current_iafsa_carbon < best_iafsa_carbon:
            best_iafsa_carbon = current_iafsa_carbon
            if max_priority == 'carbon':
                best_iafsa_route = current_best_fish['route']
        
        # If no specific priority, use the overall best
        if not max_priority and best_iafsa_route is None:
            best_iafsa_route = best_fish['route']
        
        # Check if IAFSA has found a better route for the priority metric compared to OR-Tools
        is_better = False
        
        if max_priority == 'time' and best_iafsa_time < ortools_time:
            is_better = True
            improvement_percent = ((ortools_time - best_iafsa_time) / ortools_time) * 100
            app.logger.info(f"IAFSA achieved {improvement_percent:.2f}% improvement in time over OR-Tools")
        elif max_priority == 'cost' and best_iafsa_cost < ortools_cost:
            is_better = True
            improvement_percent = ((ortools_cost - best_iafsa_cost) / ortools_cost) * 100
            app.logger.info(f"IAFSA achieved {improvement_percent:.2f}% improvement in cost over OR-Tools")
        elif max_priority == 'carbon' and best_iafsa_carbon < ortools_carbon:
            is_better = True
            improvement_percent = ((ortools_carbon - best_iafsa_carbon) / ortools_carbon) * 100
            app.logger.info(f"IAFSA achieved {improvement_percent:.2f}% improvement in carbon over OR-Tools")
        elif not max_priority:  # Balanced case - check weighted sum
            # If no clear priority, we've already optimized for the weighted sum via the fitness function
            is_better = (best_fitness < ortools_fitness)
            if is_better:
                improvement_percent = ((ortools_fitness - best_fitness) / ortools_fitness) * 100
                app.logger.info(f"IAFSA achieved {improvement_percent:.2f}% improvement in overall fitness over OR-Tools")
            
        app.logger.info(f"Attempt {retry + 1} results - IAFSA: {best_fitness:.4f}, OR-Tools: {ortools_fitness:.4f}")
        app.logger.info(f"IAFSA metrics - Time: {current_iafsa_time:.2f}s, Distance: {current_iafsa_distance_km:.2f}km, Cost: {current_iafsa_cost:.2f}, Carbon: {current_iafsa_carbon:.2f}kg")
        app.logger.info(f"OR-Tools metrics - Time: {ortools_time:.2f}s, Distance: {ortools_distance_km:.2f}km, Cost: {ortools_cost:.2f}, Carbon: {ortools_carbon:.2f}kg")
        
        found_better_solution = found_better_solution or is_better
        
        # If not doing advanced optimization, or if we found a better route or this is the last retry, stop
        if not advanced_optimization or is_better or retry == max_retries:
            if not advanced_optimization:
                app.logger.info("No priority over 50%, using standard optimization.")
            elif is_better:
                app.logger.info(f"IAFSA found a better route for {max_priority if max_priority else 'balanced optimization'}")
            else:
                app.logger.info("Max retries reached. Using best route found so far.")
            # Don't break here, as we'll exit the loop naturally after this iteration
        else:
            app.logger.info(f"IAFSA did not find a better route than OR-Tools. Retrying with increased resources.")
    
    # If we have a priority-specific best route, use it
    if found_better_solution and best_iafsa_route is not None:
        best_fish = {'route': best_iafsa_route}
        app.logger.info(f"Using best route optimized for {max_priority if max_priority else 'balanced'} priority")
    
    app.logger.info(f"Final best IAFSA fitness: {best_fitness:.4f}")
    return best_fish['route'], optimal_route_ortools

def prey_behavior(fish, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=None, num_mutation_swaps=3):
    """Implements prey behavior: explore locally with mutation."""
    original_fitness = calculate_fitness(fish['route'], time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
    perturbed_route = perturb_route(fish['route'], num_mutation_swaps)
    perturbed_fitness = calculate_fitness(perturbed_route, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
    if perturbed_fitness < original_fitness:
        fish['route'] = perturbed_route

def swarm_behavior(fish, all_fish, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=None, num_mutation_swaps=3): # Increased base swaps
    """Implements swarm behavior: move towards swarm center if beneficial."""
    nearby_fish = all_fish
    if not nearby_fish: return
    avg_fitness = sum(calculate_fitness(f['route'], time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route) for f in nearby_fish) / len(nearby_fish)
    current_fitness = calculate_fitness(fish['route'], time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
    if avg_fitness < current_fitness:
        perturbed_route = perturb_route(fish['route'], num_mutation_swaps + 2)
        perturbed_fitness = calculate_fitness(perturbed_route, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
        if perturbed_fitness < current_fitness:
            fish['route'] = perturbed_route

def follow_behavior(fish, all_fish, time_distance_matrix, physical_distance_matrix, user_weights, best_fish, fuel_cost_per_km, reference_route=None, num_mutation_swaps=2): # Reduced base swaps for follow
    """Implements follow behavior: move towards the best fish if beneficial."""
    current_fitness = calculate_fitness(fish['route'], time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
    best_fitness = calculate_fitness(best_fish['route'], time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
    if best_fitness < current_fitness:
        # Primarily rely on perturbation (swaps) to move towards the best fish
        perturbed_route = perturb_route(fish['route'], num_mutation_swaps + 1) 
        
        # Removed the problematic segment copying logic that caused invalid routes
        # if random.random() < 0.3 and len(fish['route']) > 3 and len(best_fish['route']) > 3:
        #     segment_length = min(len(fish['route']), len(best_fish['route'])) // 3
        #     if segment_length > 1:
        #         start_idx = random.randint(1, min(len(fish['route']), len(best_fish['route'])) - segment_length - 1)
        #         for i in range(segment_length):
        #             if start_idx + i < len(perturbed_route) and start_idx + i < len(best_fish['route']):
        #                 perturbed_route[start_idx + i] = best_fish['route'][start_idx + i]
                        
        perturbed_fitness = calculate_fitness(perturbed_route, time_distance_matrix, physical_distance_matrix, user_weights, fuel_cost_per_km, reference_route=reference_route)
        if perturbed_fitness < current_fitness:
            fish['route'] = perturbed_route

def get_directions(route_indices, depot, destinations, gmaps_client):
    """Get directions for visualization using Google Maps API."""
    locations = [depot] + destinations
    waypoints = [locations[i] for i in route_indices[1:-1]]  # Skip first and last indices as they're the start/end point
    
    try:
        directions = gmaps_client.directions(
            origin=locations[route_indices[0]],
            destination=locations[route_indices[-1]],
            waypoints=waypoints,
            optimize_waypoints=False,
            mode="driving"
        )
        return directions
    except Exception as e:
        app.logger.error(f"Error getting directions: {str(e)}")
        return None

@app.route('/api/last-mile-delivery/optimize', methods=['POST'])
def last_mile_delivery_optimize():
    """
    Optimize last-mile delivery routes using the IAFSA algorithm
    ---
    Request body should contain:
    - startPoint: string (starting location, defaults to "San Francisco, CA, USA")
    - destinations: array of strings (list of destination addresses)
    - weights: object with time, cost, carbon priorities (values from 0-1)
    - fuelCostPerKm: number (fuel cost per kilometer)
    - comparison: array of strings (which algorithms to compare, e.g., ["ortools", "iafsa"])
    """
    try:
        data = request.get_json()
        app.logger.info(f"Received optimization request: {data}")
        
        # Extract and validate input data
        start_point = data.get('startPoint') or 'Bengaluru, Karnataka, India' # Default to Bengaluru
        destinations = data.get('destinations', [])
        
        # Extract and log weights with explicit validation
        weights = data.get('weights', {'time': 33, 'cost': 33, 'carbon': 34})
        app.logger.info(f"Received optimization weights (raw): {weights}")
        
        # Validate weights are in percentage format (0-100)
        time_weight = weights.get('time', 33)
        cost_weight = weights.get('cost', 33)
        carbon_weight = weights.get('carbon', 34)
        
        # Check if weights might be in 0-1 scale instead of 0-100
        if max(time_weight, cost_weight, carbon_weight) <= 1:
            app.logger.warning(f"Weights appear to be in 0-1 scale instead of 0-100. Converting to percentages.")
            weights = {
                'time': time_weight * 100,
                'cost': cost_weight * 100,
                'carbon': carbon_weight * 100
            }
        
        app.logger.info(f"Using optimization weights: Time: {weights['time']}%, Cost: {weights['cost']}%, Carbon: {weights['carbon']}%")
        app.logger.info(f"Sum of weights: {weights['time'] + weights['cost'] + weights['carbon']}%")
        
        # Ensure destinations is a list of non-empty strings
        if not isinstance(destinations, list) or not all(isinstance(d, str) and d.strip() for d in destinations):
             app.logger.error(f"Invalid destinations format: {destinations}")
             return jsonify({'error': 'Invalid destinations format. Expected a list of non-empty strings.'}), 400

        fuel_cost_per_km = data.get('fuelCostPerKm', 0.15)
        comparison_methods = data.get('comparison', ['ortools', 'iafsa', 'googlemaps']) # Include googlemaps by default if comparison is missing
        
        if not destinations:
            app.logger.warning("Optimization request received with no destinations.")
            return jsonify({'error': 'No destinations provided'}), 400
            
        # Initialize Google Maps client
        gmaps_api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
        if not gmaps_api_key:
            app.logger.error("Google Maps API key not configured in environment variables.")
            return jsonify({'error': 'Google Maps API key not configured'}), 500
            
        gmaps = googlemaps.Client(key=gmaps_api_key)
        
        # Get time-based distance matrix
        time_matrix, failed_time_geocoding = get_distance_matrix(start_point, destinations, gmaps)
        
        # Get physical distance matrix
        physical_matrix, failed_physical_geocoding = get_physical_distance_matrix(start_point, destinations, gmaps)

        # Combine failed addresses
        failed_addresses = list(set((failed_time_geocoding or []) + (failed_physical_geocoding or [])))
        
        # Check if matrices were successfully calculated
        if time_matrix is None or physical_matrix is None:
            error_message = f"Failed to calculate distance matrices. Check server logs. Addresses that failed geocoding: {failed_addresses}"
            app.logger.error(error_message)
            # Return 500 because the failure is internal (API call failed)
            return jsonify({'error': error_message}), 500 
            
        # Results object to return
        results = {}
        
        # Calculate OR-Tools route if requested
        if 'ortools' in comparison_methods:
            app.logger.info("Calculating OR-Tools route...")
            ortools_route_indices = create_ortools_route(start_point, destinations, time_matrix)
            
            if ortools_route_indices:
                app.logger.info(f"OR-Tools route found: {ortools_route_indices}")
                # Calculate metrics for OR-Tools route
                ortools_time = sum(time_matrix[ortools_route_indices[i]][ortools_route_indices[i+1]] for i in range(len(ortools_route_indices)-1))
                ortools_physical_distance_meters = sum(physical_matrix[ortools_route_indices[i]][ortools_route_indices[i+1]] for i in range(len(ortools_route_indices)-1))
                ortools_physical_distance_km = ortools_physical_distance_meters / 1000 # Convert to km
                ortools_cost = ortools_physical_distance_km * fuel_cost_per_km
                ortools_carbon = ortools_physical_distance_km * 0.12  # Example CO2 factor: 0.12 kg/km
                
                # Get directions for visualization
                # Note: get_directions needs the original string addresses, not indices
                ortools_directions = get_directions(ortools_route_indices, start_point, destinations, gmaps)
                
                results['ortools'] = {
                    'route': ortools_route_indices, # Store the indices
                    'distance': ortools_physical_distance_km,
                    'time': ortools_time,
                    'cost': ortools_cost,
                    'carbon': ortools_carbon,
                    'directions': ortools_directions # Store the full directions object
                }
            else:
                 app.logger.warning("OR-Tools failed to find a route.")
        
        # Calculate IAFSA route if requested (always calculate for comparison baseline)
        # if 'iafsa' in comparison_methods: # Calculate IAFSA regardless for baseline
        app.logger.info("Calculating IAFSA route...")
        iafsa_route_indices, _ = iafsa_optimize(
            start_point, 
            destinations, 
            time_matrix, 
            physical_matrix, 
            weights, 
            fuel_cost_per_km,
            num_fish=40,
            iterations=300,
            max_retries=2
        )
        
        if iafsa_route_indices:
            app.logger.info(f"IAFSA route found: {iafsa_route_indices}")
            
            # Log route diversity metrics to verify the algorithm is working correctly
            if 'ortools' in results:
                ortools_route = results['ortools']['route']
                diversity = calculate_route_diversity_penalty(iafsa_route_indices, ortools_route)
                app.logger.info(f"Route diversity metric (0=different, 1=identical): {diversity:.4f}")
                
                if diversity < 0.5:
                    app.logger.info("IAFSA found a significantly different route than OR-Tools")
                elif diversity < 0.8:
                    app.logger.info("IAFSA found a moderately different route than OR-Tools")
                else:
                    app.logger.info("IAFSA found a route similar to OR-Tools")
            
            # Calculate metrics for IAFSA route
            iafsa_time = sum(time_matrix[iafsa_route_indices[i]][iafsa_route_indices[i+1]] for i in range(len(iafsa_route_indices)-1))
            iafsa_physical_distance_meters = sum(physical_matrix[iafsa_route_indices[i]][iafsa_route_indices[i+1]] for i in range(len(iafsa_route_indices)-1))
            iafsa_physical_distance_km = iafsa_physical_distance_meters / 1000 # Convert to km
            iafsa_cost = iafsa_physical_distance_km * fuel_cost_per_km
            iafsa_carbon = iafsa_physical_distance_km * 0.12  # Example CO2 factor: 0.12 kg/km
            
            # Get directions for visualization
            iafsa_directions = get_directions(iafsa_route_indices, start_point, destinations, gmaps)
            
            results['iafsa'] = {
                'route': iafsa_route_indices, # Store the indices
                'distance': iafsa_physical_distance_km,
                'time': iafsa_time,
                'cost': iafsa_cost,
                'carbon': iafsa_carbon,
                'directions': iafsa_directions # Store the full directions object
            }
        else:
            app.logger.warning("IAFSA failed to find a route.")
            # If IAFSA fails, we might not have a baseline. Consider returning an error or default.
            # For now, just don't add it to results.

        # Handle Google Maps comparison (placeholder calculation for now)
        if 'googlemaps' in comparison_methods:
            app.logger.info("Generating placeholder Google Maps comparison data...")
            # TODO: Implement actual Google Maps route calculation if needed,
            # or use OR-Tools/IAFSA data as a proxy if it's just for KPI display.
            # For now, create placeholder KPIs based on OR-Tools if available.
            if 'ortools' in results:
                google_distance = results['ortools']['distance'] * 1.05 # Assume 5% less optimal
                google_cost = results['ortools']['cost'] * 1.05
                google_carbon = results['ortools']['carbon'] * 1.05
                google_time = results['ortools']['time'] * 1.05
                # Get directions based on OR-Tools route for visual comparison
                google_directions = results['ortools'].get('directions') 
                google_route_indices = results['ortools'].get('route') # Use OR-Tools route indices for now
            elif 'iafsa' in results: # Fallback to IAFSA if OR-Tools failed
                google_distance = results['iafsa']['distance'] * 1.1 # Assume 10% less optimal than IAFSA
                google_cost = results['iafsa']['cost'] * 1.1
                google_carbon = results['iafsa']['carbon'] * 1.1
                google_time = results['iafsa']['time'] * 1.1
                google_directions = results['iafsa'].get('directions')
                google_route_indices = results['iafsa'].get('route')
            else: # No baseline data available
                google_distance = 0
                google_cost = 0
                google_carbon = 0
                google_time = 0
                google_directions = None
                google_route_indices = None

            results['googlemaps'] = {
                'route': google_route_indices, # Store route indices (placeholder)
                'distance': google_distance,
                'time': google_time,
                'cost': google_cost,
                'carbon': google_carbon,
                'directions': google_directions # Store directions (placeholder)
            }

        # Check if any results were generated
        if not results:
             app.logger.error("No optimization algorithms succeeded.")
             return jsonify({'error': 'Optimization failed for all selected algorithms.'}), 500
             
        app.logger.info(f"Optimization successful. Returning results for: {list(results.keys())}")
        return jsonify(results)
        
    except Exception as e:
        app.logger.error(f"Unhandled error during last-mile delivery optimization: {str(e)}")
        app.logger.error(traceback.format_exc()) # Log full traceback
        return jsonify({'error': 'An internal server error occurred during optimization.'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)