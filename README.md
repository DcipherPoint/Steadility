# Steadility

Steadility is a web platform designed to help businesses optimize their logistics and supply chain operations through data analysis, visualization, and AI-powered insights.

## Features (Example - Please Update)

*   **Data Integration:** Connect various data sources (CSV, Odoo, Zoho - implementation may vary).
*   **Inventory Analysis:** Visualize stock levels, turnover, and potential issues.
*   **Demand Forecasting:** Predict future demand based on historical data.
*   **Last-Mile Delivery Optimization:** Plan efficient delivery routes considering time, cost, and carbon emissions using Google Maps.
*   **Dynamic Rerouting:** Generate alternative logistics plans in response to disruptions using Gemini AI.
*   **Dashboard & Reporting:** Centralized view of key logistics metrics.

## Prerequisites

*   Python 3.8+
*   Node.js 16+ and npm 7+
*   A MySQL database instance (accessible to the backend server)
*   API Keys for:
    *   Google Maps Platform (for mapping features)
    *   Google Gemini (for AI features)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DcipherPoint/Steadility
cd Steadility
```

### 2. Configure Environment Variables

This project uses environment variables for configuration, especially for database credentials and external API keys. Template files are provided in the root directory:

*   `.env`: For backend configuration (Database, Flask secrets, API keys used by Python).
*   `.env.local`: For frontend configuration (API keys needed directly by the React app).

**Action Required:**
Before running the application, you **must** edit both `.env` and `.env.local`. Replace all placeholder values (e.g., `YOUR_SECRET_KEY_HERE`, `your_db_user`, `YOUR_GOOGLE_MAPS_API_KEY_HERE`) with your actual credentials and valid API keys. Refer to the comments within these files for guidance on what each variable requires.

Failure to configure these variables correctly will prevent the application or specific features from working.

### 3. Setup Backend (Python/Flask)

```bash
# Ensure you are in the project's root directory

# Create and activate a Python virtual environment
python -m venv venv

# Activate the virtual environment:
# On Windows:
# venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

```

### 4. Setup Frontend (React)

```bash
# Ensure you are in the project's root directory

# Install frontend dependencies
npm install
```

### 5. Run for Development

For local development, you need to run both the backend (Flask API) and the **frontend development server (React)** concurrently. This provides features like hot-reloading for a smoother development experience.

*   **Terminal 1: Run Backend (Flask)**
    ```bash
    # Make sure your Python virtual environment is active
    # (Look for '(venv)' prefix in your terminal prompt)
    python app.py
    ```
    The backend API server should start, typically listening on `http://localhost:5000`.

*   **Terminal 2: Run Frontend (React Development Server)**
    ```bash
    # Ensure you are in the project's root directory
    npm start
    ```
    The React development server will start and should automatically open the application in your default web browser, usually at `http://localhost:3000`. The frontend will communicate with the backend API running on port 5000 (configured via proxy in `package.json`).

### 6. Production Deployment (Optional)

To prepare the application for production deployment:

1.  **Build the Frontend:** Create an optimized static build of the React application.
    ```bash
    npm run build
    ```
    This command compiles the frontend into static files (HTML, CSS, JavaScript) located in the `build/` directory.

2.  **Serve the Application:** In a production environment, you typically only run the Flask backend server. The Flask application needs to be configured to:
    *   Serve the main `index.html` file from the `build/` directory for any non-API routes.
    *   Serve the static assets (CSS, JS, images) from the `build/static/` directory.
    *   Handle all API requests (e.g., under `/api/`).

    ```bash
    # Make sure your Python virtual environment is active
    # Set necessary production environment variables (e.g., FLASK_ENV=production)
    python app.py 
    ```
    *(Note: Configuring Flask to serve static files often involves using libraries like WhiteNoise or specific routing rules within `app.py`. Refer to the Flask application's configuration for details on how this is implemented.)*

Alternatively, you could use a dedicated web server like Nginx or Apache to serve the static files from the `build/` directory and proxy API requests to the Flask backend.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
