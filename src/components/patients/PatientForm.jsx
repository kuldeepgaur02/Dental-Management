import React, { useState, useEffect } from 'react';
import { Save, X, User, Phone, Mail, MapPin, Heart, Users, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getDateTimeInputValue } from '../../utils/dateUtils';

const PatientForm = ({ patient, onSuccess, onCancel }) => {
  const { addPatient, updatePatient } = useData();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    contact: '',
    email: '',
    address: '',
    healthInfo: '',
    emergencyContact: '',
    bloodGroup: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        dob: patient.dob || '',
        contact: patient.contact || '',
        email: patient.email || '',
        address: patient.address || '',
        healthInfo: patient.healthInfo || '',
        emergencyContact: patient.emergencyContact || '',
        bloodGroup: patient.bloodGroup || ''
      });
    }
  }, [patient]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 0 || age > 120) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }

    // Contact validation
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(formData.contact.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.contact = 'Please enter a valid contact number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Emergency contact validation
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    } else if (!/^\d{10,15}$/.test(formData.emergencyContact.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.emergencyContact = 'Please enter a valid emergency contact number';
    }

    // Blood group validation
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const patientData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        healthInfo: formData.healthInfo.trim(),
        contact: formData.contact.replace(/[\s\-\(\)]/g, ''),
        emergencyContact: formData.emergencyContact.replace(/[\s\-\(\)]/g, '')
      };

      if (patient) {
        // Update existing patient
        await updatePatient({ ...patient, ...patientData });
      } else {
        // Add new patient
        await addPatient(patientData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving patient:', error);
      setErrors({ submit: 'Failed to save patient. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`form-input ${errors.dob ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin size={16} className="inline mr-1" />
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={`form-input ${errors.address ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter full address"
          />
          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={`form-input ${errors.contact ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter phone number"
            />
            {errors.contact && <p className="text-red-600 text-sm mt-1">{errors.contact}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
            <Users size={16} className="inline mr-1" />
            Emergency Contact *
          </label>
          <input
            type="tel"
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            className={`form-input ${errors.emergencyContact ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter emergency contact number"
          />
          {errors.emergencyContact && <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>}
        </div>
      </div>

      {/* Health Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Health Information</h3>
        </div>

        <div>
          <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
            Blood Group *
          </label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className={`form-input ${errors.bloodGroup ? 'border-red-300 focus:ring-red-500' : ''}`}
          >
            <option value="">Select blood group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <p className="text-red-600 text-sm mt-1">{errors.bloodGroup}</p>}
        </div>

        <div>
          <label htmlFor="healthInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Medical History & Allergies
          </label>
          <textarea
            id="healthInfo"
            name="healthInfo"
            value={formData.healthInfo}
            onChange={handleChange}
            rows={4}
            className="form-input"
            placeholder="Enter any medical conditions, allergies, previous treatments, medications, etc."
          />
          <p className="text-gray-500 text-sm mt-1">
            Include any relevant medical history, allergies, or current medications
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center gap-2"
          disabled={isSubmitting}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : (patient ? 'Update Patient' : 'Add Patient')}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;