import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, Calendar, 
  DollarSign, Clock, User, FileText, ChevronDown 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import Modal from '../common/Modal';
import IncidentForm from './IncidentForm';
import IncidentView from './IncidentView';

const IncidentList = () => {
  const { incidents, patients, deleteIncident, getPatientById } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter and sort incidents
  const filteredIncidents = useMemo(() => {
    let filtered = incidents.filter(incident => {
      const patient = getPatientById(incident.patientId);
      const matchesSearch = 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient && patient.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort incidents
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'appointmentDate':
          aValue = new Date(a.appointmentDate);
          bValue = new Date(b.appointmentDate);
          break;
        case 'patientName':
          const patientA = getPatientById(a.patientId);
          const patientB = getPatientById(b.patientId);
          aValue = (patientA?.name || '').toLowerCase();
          bValue = (patientB?.name || '').toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'cost':
          aValue = a.cost || 0;
          bValue = b.cost || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [incidents, searchTerm, statusFilter, sortBy, sortOrder, getPatientById]);

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
      case 'Rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncident(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Rescheduled', label: 'Rescheduled' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage all dental appointments and treatments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative ">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 pointer-events-none" 
                size={16} 
              />
              <input
                type="text"
                placeholder="Search appointments, patients, or treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-4 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="form-input"
              >
                <option value="appointmentDate-desc">Latest First</option>
                <option value="appointmentDate-asc">Oldest First</option>
                <option value="patientName-asc">Patient A-Z</option>
                <option value="patientName-desc">Patient Z-A</option>
                <option value="title-asc">Title A-Z</option>
                <option value="status-asc">Status A-Z</option>
                <option value="cost-desc">Highest Cost</option>
                <option value="cost-asc">Lowest Cost</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredIncidents.length} of {incidents.length} appointments
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('appointmentDate')}
                >
                  <div className="flex items-center gap-1">
                    Date & Time
                    <ChevronDown size={12} className={sortBy === 'appointmentDate' ? 'transform rotate-180' : ''} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('patientName')}
                >
                  <div className="flex items-center gap-1">
                    Patient
                    <ChevronDown size={12} className={sortBy === 'patientName' ? 'transform rotate-180' : ''} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Treatment
                    <ChevronDown size={12} className={sortBy === 'title' ? 'transform rotate-180' : ''} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ChevronDown size={12} className={sortBy === 'status' ? 'transform rotate-180' : ''} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex items-center gap-1">
                    Cost
                    <ChevronDown size={12} className={sortBy === 'cost' ? 'transform rotate-180' : ''} />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by creating a new appointment.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const patient = getPatientById(incident.patientId);
                  return (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(incident.appointmentDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(incident.appointmentDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient?.name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {incident.patientId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {incident.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {incident.description}
                          </div>
                          {incident.files && incident.files.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {incident.files.length} file{incident.files.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-gray-400" size={14} />
                          <span className="text-sm font-medium text-gray-900">
                            {incident.cost ? `$${incident.cost}` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingIncident(incident)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setEditingIncident(incident)}
                            className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(incident)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="New Appointment"
          size="lg"
        >
          <IncidentForm
            onClose={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {editingIncident && (
        <Modal
          isOpen={!!editingIncident}
          onClose={() => setEditingIncident(null)}
          title="Edit Appointment"
          size="lg"
        >
          <IncidentForm
            incident={editingIncident}
            onClose={() => setEditingIncident(null)}
          />
        </Modal>
      )}

      {viewingIncident && (
        <Modal
          isOpen={!!viewingIncident}
          onClose={() => setViewingIncident(null)}
          title="Appointment Details"
          size="lg"
        >
          <IncidentView
            incident={viewingIncident}
            onClose={() => setViewingIncident(null)}
          />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Appointment"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{deleteConfirm.title}</p>
              <p className="text-sm text-gray-600">{formatDateTime(deleteConfirm.appointmentDate)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="btn-danger"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IncidentList;