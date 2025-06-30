import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Stethoscope, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  AlertCircle,
  UserPlus,
  Heart,
  UserCheck,
  Shield,
  GraduationCap,
  IdCard
} from 'lucide-react';

const Register = () => {
  const { register, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Start with step 0 for role selection
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    emergencyContact: '',
    healthInfo: '',
    // Admin-specific fields
    specialization: '',
    licenseNumber: '',
    experience: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Admin-specific validations
    if (selectedRole === 'Admin') {
      if (!formData.specialization.trim()) {
        errors.specialization = 'Specialization is required for doctors';
      }
      if (!formData.licenseNumber.trim()) {
        errors.licenseNumber = 'License number is required for doctors';
      }
      if (!formData.experience.trim()) {
        errors.experience = 'Years of experience is required for doctors';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
    setCurrentStep(1);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
      return;
    }
    
    if (!validateStep2()) return;
    
    const result = await register(formData);
    if (result.success) {
      console.log('Registration successful');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    clearError();
  };

  const goBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedRole('');
      setFormData(prev => ({ ...prev, role: '' }));
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
    setValidationErrors({});
    clearError();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Choose Your Role';
      case 1: return 'Account Information';
      case 2: return selectedRole === 'Admin' ? 'Professional Details' : 'Personal Details';
      default: return '';
    }
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
            Join Our Dental Center
          </h1>
          <p className="text-gray-600">
            {currentStep === 0 
              ? 'Select your role to get started' 
              : `Create your ${selectedRole === 'Admin' ? 'doctor' : 'patient'} account`
            }
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-12 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Account Info</span>
              <span>{selectedRole === 'Admin' ? 'Professional Details' : 'Personal Details'}</span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 0: Role Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-semibold text-gray-900">Choose Your Role</h2>
                <p className="text-sm text-gray-600">Select how you'll be using the system</p>
              </div>

              <div className="space-y-4">
                {/* Doctor/Admin Role */}
                <button
                  type="button"
                  onClick={() => handleRoleSelection('Admin')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Doctor / Admin</h3>
                      <p className="text-sm text-gray-500">
                        Manage patients, appointments, and treatments
                      </p>
                    </div>
                  </div>
                </button>

                {/* Patient Role */}
                <button
                  type="button"
                  onClick={() => handleRoleSelection('Patient')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Patient</h3>
                      <p className="text-sm text-gray-500">
                        Book appointments and manage your dental health
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6 fade-in">
                <div className="text-center mb-6">
                  <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedRole === 'Admin' 
                      ? 'Enter your professional credentials' 
                      : 'Let\'s start with your basic details'
                    }
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name {selectedRole === 'Admin' && <span className="text-xs text-gray-500">(Dr. will be added automatically)</span>}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={selectedRole === 'Admin' ? 'Enter your full name' : 'Enter your full name'}
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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

                {/* Password */}
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
                      placeholder="Create a password"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Personal/Professional Details */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6 fade-in">
                <div className="text-center mb-6">
                  {selectedRole === 'Admin' ? (
                    <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  ) : (
                    <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedRole === 'Admin' 
                      ? 'Complete your professional profile' 
                      : 'Help us provide better care'
                    }
                  </p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>

                {/* Admin-specific fields */}
                {selectedRole === 'Admin' && (
                  <>
                    {/* Specialization */}
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          id="specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            validationErrors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select your specialization</option>
                          <option value="General Dentistry">General Dentistry</option>
                          <option value="Orthodontics">Orthodontics</option>
                          <option value="Oral Surgery">Oral Surgery</option>
                          <option value="Periodontics">Periodontics</option>
                          <option value="Endodontics">Endodontics</option>
                          <option value="Prosthodontics">Prosthodontics</option>
                          <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                        </select>
                      </div>
                      {validationErrors.specialization && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.specialization}</p>
                      )}
                    </div>

                    {/* License Number */}
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            validationErrors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your license number"
                        />
                      </div>
                      {validationErrors.licenseNumber && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.licenseNumber}</p>
                      )}
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="number"
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          min="0"
                          max="50"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            validationErrors.experience ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter years of experience"
                        />
                      </div>
                      {validationErrors.experience && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.experience}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address {selectedRole === 'Patient' && <span className="text-xs text-gray-500">(Optional)</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder={selectedRole === 'Admin' ? 'Enter clinic/office address' : 'Enter your address'}
                    />
                  </div>
                </div>

                {/* Patient-specific fields */}
                {selectedRole === 'Patient' && (
                  <>
                    {/* Emergency Contact */}
                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Emergency contact number"
                        />
                      </div>
                    </div>

                    {/* Health Info */}
                    <div>
                      <label htmlFor="healthInfo" className="block text-sm font-medium text-gray-700 mb-2">
                        Health Information <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                          id="healthInfo"
                          name="healthInfo"
                          value={formData.healthInfo}
                          onChange={handleChange}
                          rows="3"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Any allergies, medications, or health conditions..."
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link - only show when not on role selection step */}
          {currentStep > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                  >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
