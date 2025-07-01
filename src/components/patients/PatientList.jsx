import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, Phone, Mail, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate, getAge } from '../../utils/dateUtils';
import Modal from '../common/Modal';
import PatientForm from './PatientForm';

const PatientList = () => {
  const { patients, deletePatient, getIncidentsByPatient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.includes(searchTerm)
  );

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
      setShowDeleteConfirm(false);
      setSelectedPatient(null);
    }
  };

  const getPatientStats = (patientId) => {
    const incidents = getIncidentsByPatient(patientId);
    const completedTreatments = incidents.filter(i => i.status === 'Completed').length;
    const totalSpent = incidents
      .filter(i => i.status === 'Completed')
      .reduce((sum, i) => sum + (i.cost || 0), 0);
    
    return { totalIncidents: incidents.length, completedTreatments, totalSpent };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage and view all registered patients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Patient
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
<div className="relative">
  <Search 
    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 pointer-events-none" 
    size={18} 
  />
  <input
    type="text"
    placeholder="Search patients by Name,Email or Contacts "
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full py-2 px-4 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
  />
</div>


        </div>
        <div className="flex gap-4">
          <div className="stat-card min-w-[150px]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Patients ({filteredPatients.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treatments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No patients found</p>
                    {searchTerm && (
                      <p className="text-sm">Try adjusting your search terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const stats = getPatientStats(patient.id);
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {patient.contact}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {patient.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getAge(patient.dob)} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stats.completedTreatments}/{stats.totalIncidents}
                        </div>
                        <div className="text-xs text-gray-500">
                          Completed/Total
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${stats.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(patient.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => window.location.href = `/patient/${patient.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Patient"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Patient"
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

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Patient"
        size="large"
      >
        <PatientForm
          onSuccess={() => {
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPatient(null);
        }}
        title="Edit Patient"
        size="large"
      >
        <PatientForm
          patient={selectedPatient}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedPatient(null);
        }}
        title="Confirm Delete"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedPatient?.name}</strong>?
            This will also delete all associated appointments and treatment records.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedPatient(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn-danger"
            >
              Delete Patient
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientList;