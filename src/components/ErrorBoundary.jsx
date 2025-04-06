import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error:', error, info);
    // Add error reporting service integration here
    this.setState({
      error: error.message,
      errorInfo: info
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <h2 className="text-red-800 dark:text-red-200">Something went wrong</h2>
        {this.state.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {this.state.error}
          </p>
        )}
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          Please try again later or contact support.
        </p>
        <button
          onClick={() => {
            this.setState({ hasError: false, error: null, errorInfo: null });
            window.location.href = '/';  // Navigate to the homepage
          }}
          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700"
        >
          Go to Homepage
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
