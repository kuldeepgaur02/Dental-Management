import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Heart, Users, 
  Activity, DollarSign, Clock, Plus, FileText, Download, Eye
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, getAge } from '../../utils/dateUtils';
import { formatFileSize, downloadFile, getFileIcon } from '../../utils/fileUtils';
import Modal from '../common/Modal';
import PatientForm from './PatientForm';
import IncidentForm from '../incidents/IncidentForm';

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, getPatientById, getIncidentsByPatient } = useData();
  const [patient, setPatient] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  useEffect(() => {
    const patientData = getPatientById(id);
    if (patientData) {
      setPatient(patientData);
      setIncidents(getIncidentsByPatient(id));
    } else {
      navigate('/patients');
    }
  }, [id, getPatientById, getIncidentsByPatient, navigate]);

  const handleViewIncident = (incident) => {
    setSelectedIncident(incident);
    setShowIncidentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    const completedTreatments = incidents.filter(i => i.status === 'Completed').length;
    const totalSpent = incidents
      .filter(i => i.status === 'Completed')
      .reduce((sum, i) => sum + (i.cost || 0), 0);
    const upcomingAppointments = incidents
      .filter(i => new Date(i.appointmentDate) > new Date() && i.status !== 'Completed')
      .length;

    return { completedTreatments, totalSpent, upcomingAppointments };
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(isAdmin ? '/patients' : '/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600">Patient ID: {patient.id}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddIncidentModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Appointment
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Patient
            </button>
          </div>
        )}
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formatDate(patient.dob)} ({getAge(patient.dob)} years old)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{patient.contact}</p>
                    </div>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {patient.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Heart className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Health Information</p>
                      <p className="font-medium">{patient.healthInfo || 'No health information available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment History */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Treatment History</h3>
              <span className="text-sm text-gray-500">{incidents.length} treatments</span>
            </div>
            <div className="card-body">
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No treatments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isAdmin ? 'Add the first appointment for this patient.' : 'No treatment history available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewIncident(incident)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{incident.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDateTime(incident.appointmentDate)}
                          </span>
                          {incident.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              ${incident.cost}
                            </span>
                          )}
                          {incident.files && incident.files.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {incident.files.length} file{incident.files.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <Eye size={16} className="text-gray-400" />
                    </div>
                  ))}
                  {incidents.length > 5 && (
                    <button
                      onClick={() => navigate(`/patients/${id}/incidents`)}
                      className="w-full text-center py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View all {incidents.length} treatments
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="stat-card success">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Completed Treatments</p>
                    <p className="text-2xl font-bold text-green-900">{stats.completedTreatments}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Upcoming Appointments</p>
                    <p className="text-2xl font-bold text-amber-900">{stats.upcomingAppointments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Spent</p>
                    <p className="text-2xl font-bold text-blue-900">${stats.totalSpent}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Files */}
          {incidents.some(i => i.files && i.files.length > 0) && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {incidents
                    .filter(i => i.files && i.files.length > 0)
                    .slice(0, 5)
                    .flatMap(i => i.files.map(file => ({ ...file, incidentTitle: i.title })))
                    .slice(0, 5)
                    .map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.incidentTitle}</p>
                        </div>
                        <button
                          onClick={() => downloadFile(file.url, file.name)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Patient"
          size="lg"
        >
          <PatientForm
            patient={patient}
            onClose={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {showAddIncidentModal && (
        <Modal
          isOpen={showAddIncidentModal}
          onClose={() => setShowAddIncidentModal(false)}
          title="Add New Appointment"
          size="lg"
        >
          <IncidentForm
            patientId={id}
            onClose={() => setShowAddIncidentModal(false)}
          />
        </Modal>
      )}

      {showIncidentModal && selectedIncident && (
        <Modal
          isOpen={showIncidentModal}
          onClose={() => setShowIncidentModal(false)}
          title="Treatment Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Incident Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedIncident.title}</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedIncident.status)}`}>
                  {selectedIncident.status}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{selectedIncident.description}</p>
            </div>

            {/* Incident Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Date</label>
                  <p className="text-gray-900">{formatDateTime(selectedIncident.appointmentDate)}</p>
                </div>
                {selectedIncident.cost && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cost</label>
                    <p className="text-gray-900">${selectedIncident.cost}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {selectedIncident.treatment && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Treatment</label>
                    <p className="text-gray-900">{selectedIncident.treatment}</p>
                  </div>
                )}
                {selectedIncident.nextDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Next Appointment</label>
                    <p className="text-gray-900">{formatDateTime(selectedIncident.nextDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            {selectedIncident.comments && (
              <div>
                <label className="text-sm font-medium text-gray-700">Comments</label>
                <p className="text-gray-900 mt-1">{selectedIncident.comments}</p>
              </div>
            )}

            {/* Files */}
            {selectedIncident.files && selectedIncident.files.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Attached Files</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedIncident.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</p>
                      </div>
                      <button
                        onClick={() => downloadFile(file.url, file.name)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientView;