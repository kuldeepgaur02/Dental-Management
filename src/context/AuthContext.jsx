import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storageKeys, getFromStorage, setToStorage, removeFromStorage, generateId, validateEmail } from '../utils/storage';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session on app load
    const savedAuth = getFromStorage(storageKeys.AUTH);
    if (savedAuth && savedAuth.user) {
      dispatch({ type: 'LOGIN', payload: savedAuth.user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Get users from localStorage
      const users = getFromStorage(storageKeys.USERS) || [];
      
      // Find user with matching credentials
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Save auth state
      setToStorage(storageKeys.AUTH, { user, timestamp: Date.now() });
      
      dispatch({ type: 'LOGIN', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { name, email, password, confirmPassword, dateOfBirth, phone, address, emergencyContact, healthInfo } = userData;

      // Validation
      if (!name?.trim()) throw new Error('Full name is required');
      if (!validateEmail(email)) throw new Error('Please enter a valid email address');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      if (!dateOfBirth) throw new Error('Date of birth is required');
      if (!phone?.trim()) throw new Error('Phone number is required');

      // Get existing users
      const existingUsers = getFromStorage(storageKeys.USERS) || [];
      
      // Check if email already exists
      if (existingUsers.find(u => u.email === email)) {
        throw new Error('An account with this email already exists');
      }

      // Generate IDs
      const userId = generateId('u');
      const patientId = generateId('p');

      // Create new user (Patient role by default for registration)
      const newUser = {
        id: userId,
        role: 'Patient',
        email,
        password,
        name,
        patientId,
        createdAt: new Date().toISOString()
      };

      // Create corresponding patient record
      const newPatient = {
        id: patientId,
        name,
        email,
        dob: dateOfBirth,
        contact: phone,
        address: address || '',
        emergencyContact: emergencyContact || '',
        healthInfo: healthInfo || '',
        userId,
        createdAt: new Date().toISOString()
      };

      // Save user
      const updatedUsers = [...existingUsers, newUser];
      setToStorage(storageKeys.USERS, updatedUsers);

      // Save patient
      const existingPatients = getFromStorage(storageKeys.PATIENTS) || [];
      const updatedPatients = [...existingPatients, newPatient];
      setToStorage(storageKeys.PATIENTS, updatedPatients);

      // Auto-login after registration
      setToStorage(storageKeys.AUTH, { user: newUser, timestamp: Date.now() });
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      return { success: true, user: newUser };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    removeFromStorage(storageKeys.AUTH);
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};