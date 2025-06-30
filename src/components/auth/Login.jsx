import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope, User, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize hardcoded users in localStorage on component mount
  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.length === 0) {
      const hardcodedUsers = [
        { 
          id: "u1", 
          role: "Admin", 
          email: "admin@entnt.in", 
          password: "admin123",
          name: "Dr. Smith",
          createdAt: new Date().toISOString()
        },
        { 
          id: "u2", 
          role: "Patient", 
          email: "john@entnt.in", 
          password: "patient123", 
          patientId: "p1",
          name: "John Doe",
          createdAt: new Date().toISOString()
        }
      ];
      
      const hardcodedPatients = [
        {
          id: "p1",
          name: "John Doe",
          email: "john@entnt.in",
          dob: "1990-05-10",
          contact: "1234567890",
          address: "123 Main St, City",
          emergencyContact: "0987654321",
          healthInfo: "No allergies",
          userId: "u2",
          createdAt: new Date().toISOString()
        }
      ];

      const hardcodedIncidents = [
        {
          id: "i1",
          patientId: "p1",
          title: "Toothache",
          description: "Upper molar pain",
          comments: "Sensitive to cold",
          appointmentDate: "2025-07-01T10:00:00",
          cost: 80,
          treatment: "Root canal therapy",
          status: "Completed",
          nextDate: "2025-07-15T10:00:00",
          files: [
            { name: "invoice.pdf", url: "base64string-or-blob-url", type: "application/pdf" },
            { name: "xray.png", url: "base64string-or-blob-url", type: "image/png" }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      localStorage.setItem('users', JSON.stringify(hardcodedUsers));
      localStorage.setItem('patients', JSON.stringify(hardcodedPatients));
      localStorage.setItem('incidents', JSON.stringify(hardcodedIncidents));
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;
    
    await login(formData.email, formData.password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    clearError();
  };

  const demoCredentials = [
    { role: 'Admin (Dentist)', email: 'admin@entnt.in', password: 'admin123' },
    { role: 'Patient', email: 'john@entnt.in', password: 'patient123' }
  ];

  const fillDemoCredentials = (credentials) => {
    setFormData({
      email: credentials.email,
      password: credentials.password
    });
    setValidationErrors({});
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ENTNT Dental Center
          </h1>
          <p className="text-gray-600">
            Management Dashboard - Sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New patient?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials</h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => fillDemoCredentials(cred)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                >
                  <div className="font-medium text-gray-900">{cred.role}</div>
                  <div className="text-sm text-gray-600">{cred.email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Click to auto-fill credentials for testing
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          © 2025 ENTNT Dental Center Management System
        </div>
      </div>
    </div>
  );
};

export default Login;