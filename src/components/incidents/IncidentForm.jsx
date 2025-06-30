import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, FileText, Upload, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDateTimeLocal } from '../../utils/dateUtils';
import Uplod from '../common/Uplod';

const IncidentForm = ({ incident, patientId, initialDate, onSubmit, onCancel }) => {
  const { patients, addIncident, updateIncident, getPatientById } = useData();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    comments: '',
    appointmentDate: '',
    cost: '',
    treatment: '',
    status: 'Scheduled',
    nextDate: '',
    patientId: patientId || '',
    ...incident
  });

  // Get patient info - handle both editing existing incident and creating new one
  const currentPatientId = incident?.patientId || patientId || formData.patientId;
  const patient = getPatientById(currentPatientId);

  useEffect(() => {
    if (incident) {
      setFormData({
        ...incident,
        appointmentDate: formatDateTimeLocal(incident.appointmentDate),
        nextDate: incident.nextDate ? formatDateTimeLocal(incident.nextDate) : '',
        cost: incident.cost || '',
        patientId: incident.patientId || patientId || ''
      });
      setFiles(incident.files || []);
    } else if (initialDate) {
      // Set initial date for new appointments
      setFormData(prev => ({
        ...prev,
        appointmentDate: formatDateTimeLocal(initialDate),
        patientId: patientId || ''
      }));
    }
  }, [incident, patientId, initialDate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    }

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }

    if (formData.cost && (isNaN(formData.cost) || parseFloat(formData.cost) < 0)) {
      newErrors.cost = 'Cost must be a valid positive number';
    }

    if (formData.nextDate && new Date(formData.nextDate) <= new Date(formData.appointmentDate)) {
      newErrors.nextDate = 'Next appointment must be after current appointment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
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

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const incidentData = {
        ...formData,
        patientId: formData.patientId,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        files: files,
        updatedAt: new Date().toISOString()
      };

      if (incident?.id) {
        await updateIncident(incident.id, incidentData);
      } else {
        incidentData.id = 'i' + Date.now();
        incidentData.createdAt = new Date().toISOString();
        await addIncident(incidentData);
      }

      if (onSubmit) {
        onSubmit(incidentData);
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving incident:', error);
      setErrors({ submit: 'Failed to save appointment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
          Patient *
        </label>
        <select
          id="patientId"
          name="patientId"
          value={formData.patientId}
          onChange={handleInputChange}
          className={`form-input ${errors.patientId ? 'border-red-500' : ''}`}
          disabled={!!incident} // Disable patient selection when editing existing incident
        >
          <option value="">Select a patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.id}
            </option>
          ))}
        </select>
        {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
      </div>

      {/* Patient Info Display */}
      {patient && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Patient: {patient.name}</h4>
          <p className="text-sm text-blue-700">ID: {patient.id}</p>
          {patient.email && <p className="text-sm text-blue-700">Email: {patient.email}</p>}
          {patient.phone && <p className="text-sm text-blue-700">Phone: {patient.phone}</p>}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="e.g., Root Canal, Cleaning, Check-up"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className={`form-input ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Describe the treatment or symptoms..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Appointment Date & Time *
          </label>
          <input
            type="datetime-local"
            id="appointmentDate"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleInputChange}
            className={`form-input ${errors.appointmentDate ? 'border-red-500' : ''}`}
          />
          {errors.appointmentDate && <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Treatment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Treatment Cost
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={handleInputChange}
            className={`form-input ${errors.cost ? 'border-red-500' : ''}`}
            placeholder="0.00"
          />
          {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
        </div>

        <div>
          <label htmlFor="nextDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Next Appointment
          </label>
          <input
            type="datetime-local"
            id="nextDate"
            name="nextDate"
            value={formData.nextDate}
            onChange={handleInputChange}
            className={`form-input ${errors.nextDate ? 'border-red-500' : ''}`}
          />
          {errors.nextDate && <p className="mt-1 text-sm text-red-600">{errors.nextDate}</p>}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Details
          </label>
          <textarea
            id="treatment"
            name="treatment"
            rows={3}
            value={formData.treatment}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Detailed description of treatment performed..."
          />
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Comments & Notes
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={3}
            value={formData.comments}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Additional comments, patient notes, follow-up instructions..."
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 mr-1" />
          Attachments
        </label>
        <Uplod
          files={files}
          onFilesChange={handleFilesChange}
          maxFiles={10}
          acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
        />
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            incident?.id ? 'Update Appointment' : 'Create Appointment'
          )}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;