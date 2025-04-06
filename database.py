from mysql.connector import connect, Error
import logging
import mysql.connector
import os
from dotenv import load_dotenv
import json
from datetime import datetime

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Table definitions for easier reference
TABLES = {
    'users': 'users',
    'companies': 'companies',
    'integration_settings': 'integration_settings',
    'inventory_settings': 'inventory_settings',
    'historical_data': 'historical_data',
    'user_preferences': 'user_preferences'
}

# Configuration for the database connection
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'steadility'),
    'port': int(os.getenv('DB_PORT', 3306))
}

class DatabaseManager:
    def __init__(self, config):
        self.config = config
        self.connection = None

    def connect(self):
        """Establish a connection to the database."""
        try:
            self.connection = connect(**self.config)
            return self.connection
        except Error as e:
            logger.error(f"Error connecting to database: {e}")
            return None

    def close(self):
        """Close the database connection."""
        if self.connection and self.connection.is_connected():
            self.connection.close()

    def execute_query(self, query, params=None):
        """Execute a database query and return results."""
        try:
            conn = self.connect()
            if conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                conn.commit()
                return cursor.fetchall()
        except Error as e:
            logger.error(f"Query execution error: {e}")
            return None
        finally:
            self.close()

def create_connection():
    """Create a database connection to the MySQL database."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return None

def execute_query(query, params=None):
    """Execute a single query."""
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        try:
            cursor.execute(query, params)
            connection.commit()
            return cursor.lastrowid
        except Error as e:
            logger.error(f"Error executing query: {e}")
            connection.rollback()
        finally:
            cursor.close()
            connection.close()

def fetch_all(query, params=None, limit=None, count=False):
    """
    Fetch all results from a query.
    
    Args:
        query: SQL query string
        params: Parameters for the query
        limit: Optional limit of records to return
        count: If True, also return total record count
        
    Returns:
        If count=False: List of records
        If count=True: Tuple (records, total_count)
    """
    connection = create_connection()
    results = []
    total_count = 0
    
    if connection:
        cursor = connection.cursor(dictionary=True)
        try:
            if count:
                # Modify query to get count first
                count_query = f"SELECT COUNT(*) as total FROM ({query.replace('*', '1')}) as count_query"
                cursor.execute(count_query, params)
                count_result = cursor.fetchone()
                total_count = count_result['total'] if count_result else 0
            
            # Apply limit if specified
            if limit is not None:
                if 'LIMIT' not in query.upper():
                    query += f" LIMIT {limit}"
                    
            cursor.execute(query, params)
            results = cursor.fetchall()
        except Error as e:
            logger.error(f"Error fetching data: {e}")
        finally:
            cursor.close()
            connection.close()
    
    if count:
        return results, total_count
    return results

def fetch_one(query, params=None):
    """
    Fetch a single result from a query.
    
    Args:
        query: SQL query string
        params: Parameters for the query
        
    Returns:
        Single record as dictionary or None if no results
    """
    connection = create_connection()
    result = None
    
    if connection:
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute(query, params)
            result = cursor.fetchone()
        except Error as e:
            logger.error(f"Error fetching data: {e}")
        finally:
            cursor.close()
            connection.close()
    
    return result

def execute_many(query, params):
    """Execute a query with multiple parameter sets"""
    connection = None
    cursor = None
    try:
        connection = create_connection()
        if not connection:
            raise Error("Failed to create database connection")
            
        cursor = connection.cursor()
        cursor.executemany(query, params)
        connection.commit()
    except Error as e:
        logger.error(f"Error executing batch query: {e}")
        if connection:
            connection.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

def save_historical_data(data, source, user_id):
    """Save historical data with proper merging of records from the same source"""
    try:
        conn = get_db()
        if not conn:
            print("Failed to create database connection")
            return False
            
        cursor = conn.cursor(dictionary=True)
        
        # Check if a record already exists for this user and source
        check_query = """
            SELECT id, data FROM historical_data 
            WHERE user_id = %s AND source = %s
            LIMIT 1
        """
        cursor.execute(check_query, (user_id, source))
        existing_record = cursor.fetchone()
        
        if existing_record:
            # Record exists - update it instead of creating a new one
            try:
                # For CSV, we want to merge the new data with existing data
                if source == 'csv' and existing_record.get('data'):
                    # Parse existing data and merge
                    try:
                        existing_data = json.loads(existing_record['data'])
                        # Merge while ensuring no duplicates (simple concatenation for now)
                        merged_data = existing_data + data
                    except json.JSONDecodeError:
                        # If existing data is not valid JSON, just use new data
                        merged_data = data
                else:
                    # For Odoo and Zoho, we replace with new data
                    merged_data = data
                
                # Update the existing record
                update_query = """
                    UPDATE historical_data 
                    SET data = %s, updated_at = NOW()
                    WHERE id = %s
                """
                cursor.execute(update_query, (json.dumps(merged_data), existing_record['id']))
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                print(f"Error updating existing record: {str(e)}")
                return False
        else:
            # No existing record - create a new one
            try:
                # Prepare insert query
                insert_query = """
                    INSERT INTO historical_data 
                    (user_id, data, source, date, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW(), NOW())
                """
                
                # Prepare the data
                values = (
                    user_id,
                    json.dumps(data),
                    source
                )
                
                cursor.execute(insert_query, values)
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                print(f"Error creating new record: {str(e)}")
                return False
            
    except Exception as e:
        print(f"Error in save_historical_data: {str(e)}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def get_db():
    """Create and return a database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

# Example usage
db_manager = DatabaseManager(DB_CONFIG) 