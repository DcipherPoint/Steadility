import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  const signup = async (credentials) => {
    try {
      // Log the received credentials
      console.log('Signup credentials received:', credentials);

      // Validate required fields
      const requiredFields = ['email', 'password', 'business_name', 'country', 'industry'];
      const missingFields = requiredFields.filter(field => !credentials[field] || credentials[field].trim() === '');
      
      if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        console.error('Credentials received:', credentials);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Create a copy of credentials with trimmed values
      const signupData = {
        email: credentials.email.trim(),
        password: credentials.password,
        business_name: credentials.business_name.trim(),
        country: credentials.country.trim(),
        industry: credentials.industry.trim()
      };

      // Log the data being sent
      console.log('Sending signup data:', signupData);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // Store the token
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      setUser(data.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const updateBusinessProfile = async (profileData) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Profile update error:', error.message);
      throw error;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    updateBusinessProfile,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 