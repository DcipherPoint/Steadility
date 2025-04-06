import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { ImportProvider } from './contexts/ImportContext';
import Dashboard from './pages/Dashboard';
import DataImport from './components/import/DataImport';
import Inventory from './pages/dashboard/inventory/Inventory';
import Settings from './pages/dashboard/settings/Settings';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import InventoryTest from './components/inventory/InventoryTest';

// Import AI and Optimization components
import InventoryOptimization from './components/dashboard/InventoryOptimization';
// Import the wrapper to fix the routing issue
import DynamicReroutingWrapper from './components/dashboard/DynamicReroutingWrapper';
import LastMileDelivery from './components/dashboard/LastMileDelivery';

// Import styles
import './styles/darkTheme.css';

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <InventoryProvider>
              <ImportProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/inventory-test" element={<InventoryTest />} />
                  
                  {/* Protected routes */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  } />

                  {/* Protected dashboard routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="import" element={<DataImport />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings />} />
                    
                    {/* AI and Optimization routes */}
                    <Route path="inventory-optimization" element={<InventoryOptimization />} />
                    <Route path="dynamic-rerouting" element={<DynamicReroutingWrapper />} />
                    <Route path="last-mile-delivery" element={<LastMileDelivery />} />
                  </Route>

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ImportProvider>
            </InventoryProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;