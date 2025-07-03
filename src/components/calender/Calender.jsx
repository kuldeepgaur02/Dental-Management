import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MapPin,
  Eye,
  Edit,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  formatDate,
  formatTime,
  isToday,
  isSameDay,
  format,
  addDays,
  subDays,
} from "../../utils/dateUtils";
import Modal from "../common/Modal";
import IncidentForm from "../incidents/IncidentForm";

const Calendar = () => {
  const { incidents, patients, addIncident, updateIncident, getPatientById } =
    useData();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to get the appointment date from an incident
  const getIncidentDate = (incident) => {
    return incident?.appointmentDate
      ? new Date(incident.appointmentDate)
      : null;
  };

  // Helper function to normalize dates for comparison
  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  // Get filtered incidents
  const getFilteredIncidents = () => {
    let filtered = incidents || [];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (incident) => incident.status === filterStatus
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((incident) => {
        const patient = getPatientById(incident.patientId);
        const searchTerm = searchQuery.toLowerCase();
        return (
          incident.title?.toLowerCase().includes(searchTerm) ||
          patient?.name?.toLowerCase().includes(searchTerm) ||
          incident.description?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  };

  // Get incidents for the current date
  const getIncidentsForDate = (date) => {
    const filtered = getFilteredIncidents();
    const target = normalizeDate(date);

    const seen = new Set();
    const result = [];

    for (const incident of filtered) {
      const incidentDate = normalizeDate(getIncidentDate(incident));
      if (incidentDate === target && !seen.has(incident.id)) {
        result.push(incident);
        seen.add(incident.id);
      }
    }

    return result.sort(
      (a, b) => new Date(getIncidentDate(a)) - new Date(getIncidentDate(b))
    );
  };

  // Navigation functions
  const navigateDate = (direction) => {
    setCurrentDate(
      direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Go to specific date
  const goToDate = (date) => {
    setCurrentDate(new Date(date));
  };

  // Handle add appointment
  const handleAddIncident = () => {
    setShowAddModal(false);
    setSelectedDate(null);
  };

  // Handle edit incident
  const handleEditIncident = async (updatedIncident) => {
    try {
      await updateIncident(updatedIncident);
      setShowEditModal(false);
      setSelectedIncident(null);
    } catch (error) {
      console.error("Error in handleEditIncident:", error);
    }
  };

  // Enhanced Day view component
  const DayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
    const dayIncidents = getIncidentsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Day Header with enhanced info */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {format(currentDate, "EEEE")}
              </div>
              <div
                className={`text-4xl font-bold mt-1 ${
                  isToday(currentDate) ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {currentDate.getDate()}
              </div>
              <div className="text-lg text-gray-600 mt-1">
                {format(currentDate, "MMMM yyyy")}
              </div>
            </div>

            {/* Day Summary */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Appointments</div>
              <div className="text-2xl font-bold text-gray-900">
                {dayIncidents.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dayIncidents.filter((i) => i.status === "Completed").length}{" "}
                completed
              </div>
            </div>
          </div>
        </div>

        {/* Day Body with improved layout */}
        <div className="max-h-[700px] overflow-y-auto">
          {dayIncidents.length === 0 ? (
            <div className="text-center py-16">
              <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments today
              </h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first appointment for{" "}
                {format(currentDate, "MMMM d, yyyy")}
              </p>
              <button
                onClick={() => {
                  setSelectedDate(new Date(currentDate));
                  setShowAddModal(true);
                }}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Add Appointment
              </button>
            </div>
          ) : (
            hours.map((hour) => {
              const hourIncidents = dayIncidents.filter((incident) => {
                const appointmentDate = getIncidentDate(incident);
                if (!appointmentDate) return false;
                const incidentHour = new Date(appointmentDate).getHours();
                return incidentHour === hour;
              });

              return (
                <div
                  key={hour}
                  className="flex border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="w-24 py-4 px-4 text-sm text-gray-500 font-medium border-r border-gray-100 bg-gray-50">
                    <div className="text-center">
                      {hour === 12
                        ? "12 PM"
                        : hour > 12
                        ? `${hour - 12} PM`
                        : `${hour} AM`}
                    </div>
                  </div>
                  <div
                    className="flex-1 min-h-[80px] p-4 cursor-pointer transition-colors relative"
                    onClick={() => {
                      const selectedDateTime = new Date(currentDate);
                      selectedDateTime.setHours(hour, 0, 0, 0);
                      setSelectedDate(selectedDateTime);
                      setShowAddModal(true);
                    }}
                  >
                    {hourIncidents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                          <Plus size={16} />
                          Add appointment
                        </div>
                      </div>
                    )}

                    {hourIncidents.map((incident) => {
                      const patient = getPatientById(incident.patientId);
                      const appointmentDate = getIncidentDate(incident);
                      return (
                        <div
                          key={incident.id}
                          className={`p-4 rounded-lg mb-2 cursor-pointer border-l-4 transition-all hover:shadow-md ${
                            incident.status === "Completed"
                              ? "bg-green-50 border-green-500 hover:bg-green-100"
                              : incident.status === "In Progress"
                              ? "bg-blue-50 border-blue-500 hover:bg-blue-100"
                              : incident.status === "Cancelled"
                              ? "bg-red-50 border-red-500 hover:bg-red-100"
                              : "bg-yellow-50 border-yellow-500 hover:bg-yellow-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                            setShowIncidentModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-gray-900 text-lg">
                                  {incident.title}
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    incident.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : incident.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : incident.status === "Cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {incident.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User size={14} />
                                  {patient?.name || "Unknown Patient"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {appointmentDate
                                    ? formatTime(appointmentDate)
                                    : "No time set"}
                                </div>
                              </div>

                              {incident.description && (
                                <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                                  {incident.description}
                                </div>
                              )}

                              {incident.cost && (
                                <div className="mt-2 text-sm font-medium text-gray-900">
                                  Cost: ₹{incident.cost}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIncident(incident);
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIncident(incident);
                                  setShowIncidentModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage your daily appointments and schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64">
            {/* Search Icon */}
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input pl-3 pr-10 text-sm appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Filter
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Add Appointment Button */}
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Appointment
          </button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next day"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={format(currentDate, "yyyy-MM-dd")}
              onChange={(e) => goToDate(e.target.value)}
              className="form-input text-sm"
            />
            <button onClick={goToToday} className="btn-secondary text-sm">
              Today
            </button>
          </div>
        </div>

        {/* View Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded-full"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="fade-in">
        <DayView />
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          title="Add New Appointment"
          size="large"
        >
          <IncidentForm
            patientId=""
            initialDate={selectedDate}
            onSubmit={handleAddIncident}
            onCancel={() => {
              setShowAddModal(false);
              setSelectedDate(null);
            }}
          />
        </Modal>
      )}

      {/* View Incident Modal */}
      {showIncidentModal && selectedIncident && (
        <Modal
          isOpen={showIncidentModal}
          onClose={() => {
            setShowIncidentModal(false);
            setSelectedIncident(null);
          }}
          title="Appointment Details"
          size="large"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </label>
                <p className="text-gray-900 font-semibold text-lg mt-1">
                  {selectedIncident.title}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Patient
                </label>
                <p className="text-gray-900 font-medium mt-1">
                  {getPatientById(selectedIncident.patientId)?.name ||
                    "Unknown Patient"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Date & Time
                </label>
                <p className="text-gray-900 font-medium mt-1">
                  {(() => {
                    const appointmentDate = getIncidentDate(selectedIncident);
                    return appointmentDate
                      ? `${formatDate(appointmentDate)} at ${formatTime(
                          appointmentDate
                        )}`
                      : "No date/time set";
                  })()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      selectedIncident.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : selectedIncident.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : selectedIncident.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedIncident.description && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-900 mt-1 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>
            )}

            {selectedIncident.comments && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Comments
                </label>
                <p className="text-gray-900 mt-1 leading-relaxed">
                  {selectedIncident.comments}
                </p>
              </div>
            )}

            {selectedIncident.cost && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Cost
                </label>
                <p className="text-gray-900 font-bold text-xl mt-1">
                  ₹{selectedIncident.cost}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                onClick={() => {
                  setShowIncidentModal(false);
                  setSelectedIncident(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowIncidentModal(false);
                  setShowEditModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Appointment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Incident Modal */}
      {showEditModal && selectedIncident && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIncident(null);
          }}
          title="Edit Appointment"
          size="large"
        >
          <IncidentForm
            incident={selectedIncident}
            patientId={selectedIncident.patientId}
            onSubmit={handleEditIncident}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedIncident(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Calendar;
