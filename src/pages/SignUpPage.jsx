import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const INDUSTRY_OPTIONS = [
  'Manufacturing',
  'Retail',
  'Distribution',
  'E-commerce',
  'Transportation',
  'Warehousing',
  'Food & Beverage',
  'Healthcare',
  'Technology',
  'Other'
];

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'India',
  'Spain',
  'Italy',
  'Netherlands',
  'Singapore',
  'Other'
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    country: '',
    industry: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@300;400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const validatePassword = (password) => {
    const requirements = [];
    if (password.length < 8) requirements.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('One uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('One lowercase letter');
    if (!/[0-9]/.test(password)) requirements.push('One number');
    return requirements;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'password') {
      const requirements = validatePassword(value);
      setPasswordError(requirements.length > 0 ? requirements : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requirements = validatePassword(formData.password);
      if (requirements.length > 0) {
        throw new Error(`Password requirements not met: ${requirements.join(', ')}`);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const requiredFields = ['email', 'password', 'business_name', 'country', 'industry'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const submitData = {
        email: formData.email.trim(),
        password: formData.password,
        business_name: formData.business_name.trim(),
        country: formData.country.trim(),
        industry: formData.industry.trim()
      };
      
      const result = await signup(submitData);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-roboto relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob opacity-70" />
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob animation-delay-2000 opacity-70" />
        <div className="absolute -bottom-1/4 left-1/3 w-[800px] h-[800px] bg-indigo-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob animation-delay-4000 opacity-70" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/0 via-[#121212]/20 to-[#121212] z-10" />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold font-montserrat text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Join our sustainable logistics platform
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-white/20'
                  } bg-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {Array.isArray(passwordError) && passwordError.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-300 mb-1">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordError.map((req, index) => (
                        <li key={index} className="text-red-400">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Business Name
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm"
                  placeholder="Enter your business name"
                  value={formData.business_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-gray-400 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm text-sm"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="" className="text-gray-500">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country} className="bg-gray-900 text-gray-200">{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-gray-400 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 backdrop-blur-sm text-sm"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="" className="text-gray-500">Select an industry</option>
                  {INDUSTRY_OPTIONS.map(industry => (
                    <option key={industry} value={industry} className="bg-gray-900 text-gray-200">{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20 backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200 backdrop-blur-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 