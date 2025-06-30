import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Calendar, DollarSign, FileText, Download, 
  Eye, Clock, User, MapPin, Phone, Mail, Activity, AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { formatFileSize, downloadFile, getFileIcon } from '../../utils/fileUtils';
import Modal from '../common/Modal';
import IncidentForm from './IncidentForm';

const IncidentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getIncidentById, getPatientById, updateIncident } = useData();
  const [incident, setIncident] = useState(null);
  const [patient, setPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const incidentData = getIncidentById(id);
    if (incidentData) {
      setIncident(incidentData);
      const patientData = getPatientById(incidentData.patientId);
      setPatient(patientData);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  }, [id, getIncidentById, getPatientById, navigate]);

  const handleEditIncident = (updatedIncident) => {
    updateIncident(id, updatedIncident);
    setIncident({ ...incident, ...updatedIncident });
    setShowEditModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFileDownload = (file) => {
    try {
      downloadFile(file.url, file.name);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Incident not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';
  const canEdit = isAdmin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
            <p className="text-gray-600">Incident ID: {incident.id}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Incident
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Incident Details</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900 font-medium">{incident.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{incident.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Comments</label>
                    <p className="text-gray-900">{incident.comments || 'No comments'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  {incident.priority && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Appointment Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={16} className="text-gray-400" />
                      <p className="text-gray-900">{formatDateTime(incident.appointmentDate)}</p>
                    </div>
                  </div>
                  {incident.cost && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cost</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign size={16} className="text-gray-400" />
                        <p className="text-gray-900 font-medium">${incident.cost}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Information */}
          {incident.treatment && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Treatment Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Treatment Provided</label>
                    <p className="text-gray-900">{incident.treatment}</p>
                  </div>
                  {incident.nextAppointmentDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Next Appointment</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={16} className="text-gray-400" />
                        <p className="text-gray-900">{formatDateTime(incident.nextAppointmentDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Files & Attachments */}
          {incident.files && incident.files.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Files & Attachments</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incident.files.map((file, index) => {
                    const FileIcon = getFileIcon(file.name);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon size={20} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFileDownload(file)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">ID: {patient.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-gray-900">{patient.email}</p>
                </div>
                {patient.address && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <p className="text-gray-900">{patient.address}</p>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="w-full btn-secondary"
                >
                  View Patient Profile
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appointment Scheduled</p>
                    <p className="text-xs text-gray-500">{formatDate(incident.createdAt || incident.appointmentDate)}</p>
                  </div>
                </div>
                {incident.status === 'Completed' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Treatment Completed</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.completedAt || incident.appointmentDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Incident"
          size="large"
        >
          <IncidentForm
            incident={incident}
            patientId={incident.patientId}
            onSubmit={handleEditIncident}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default IncidentView;