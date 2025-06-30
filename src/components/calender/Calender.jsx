import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, User, Phone, MapPin, Eye, Edit, Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime, isToday, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, getDay } from '../../utils/dateUtils';
import Modal from '../common/Modal';
import IncidentForm from '../incidents/IncidentForm';

const Calendar = () => {
  const { incidents, patients, addIncident, updateIncident, getPatientById } = useData();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Debug: Log incidents whenever they change
  useEffect(() => {
    console.log('Calendar - Current incidents:', incidents);
    console.log('Calendar - Current patients:', patients);
  }, [incidents, patients]);

  // Helper function to normalize dates for comparison
  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Reset time to start of day for date comparison
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Get incidents for display
  const getFilteredIncidents = () => {
    let filtered = incidents || [];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === filterStatus);
    }
    
    console.log('Filtered incidents:', filtered);
    return filtered;
  };

  // Get incidents for a specific date - FIXED VERSION
const getIncidentsForDate = (date) => {
  const filtered = getFilteredIncidents();
  const targetDateNormalized = normalizeDate(date);
  
  if (!targetDateNormalized) return [];
  
  const dateIncidents = filtered.filter(incident => {
    const appointmentDate = incident.appointmentDate || incident.date || incident.scheduledDate;
    
    if (!appointmentDate) {
      console.log('No appointment date found for incident:', incident);
      return false;
    }
    
    const incidentDateNormalized = normalizeDate(appointmentDate);
    
    if (!incidentDateNormalized) {
      console.log('Could not normalize incident date:', appointmentDate);
      return false;
    }
    
    const isSame = incidentDateNormalized.getTime() === targetDateNormalized.getTime();
    
    console.log('Comparing dates:', {
      incidentDate: appointmentDate,
      normalizedIncidentDate: incidentDateNormalized.toDateString(),
      targetDate: targetDateNormalized.toDateString(),
      isSame,
    });
    
    return isSame;
  }).sort((a, b) => {
    const dateA = new Date(a.appointmentDate || a.date || a.scheduledDate);
    const dateB = new Date(b.appointmentDate || b.date || b.scheduledDate);
    return dateA - dateB;
  });
  
  console.log(`Incidents for ${date.toDateString()}:`, dateIncidents);
  return dateIncidents;
};


  // Navigation functions
  const navigateDate = (direction) => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Add appointment handler - FIXED
  const handleAddIncident = async (incidentData) => {
    console.log('handleAddIncident called with:', incidentData);
    
    try {
      // Ensure the appointment date is properly set
      const appointmentData = {
        ...incidentData,
        appointmentDate: incidentData.appointmentDate || selectedDate,
        status: incidentData.status || 'Scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Adding appointment with data:', appointmentData);
      await addIncident(appointmentData);
      setShowAddModal(false);
      setSelectedDate(null);
      console.log('Appointment added successfully');
    } catch (error) {
      console.error('Error in handleAddIncident:', error);
    }
  };

  // Month view component - ENHANCED DEBUG VERSION
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dayIncidents = getIncidentsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                  } ${isCurrentDay ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowAddModal(true);
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {/* DEBUG: Show incident count */}
                  {dayIncidents.length > 0 && (
                    <div className="text-xs text-red-600 font-bold mb-1">
                      {dayIncidents.length} appointments
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {dayIncidents.slice(0, 3).map((incident) => {
                      const patient = getPatientById(incident.patientId);
                      const appointmentDate = incident.appointmentDate || incident.date || incident.scheduledDate;
                      
                      return (
                        <div
                          key={incident.id}
                          className={`text-xs p-1 rounded cursor-pointer truncate ${
                            incident.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : incident.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                            setShowIncidentModal(true);
                          }}
                        >
                          {appointmentDate ? formatTime(appointmentDate) : 'No time'} - {patient?.name || 'Unknown Patient'}
                        </div>
                      );
                    })}
                    {dayIncidents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayIncidents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Week view component
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: endOfWeek(currentDate) 
    });

    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-50 py-3 px-4"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-gray-50 py-3 px-4 text-center">
              <div className="text-sm font-medium text-gray-900">{format(day, 'EEE')}</div>
              <div className={`text-2xl font-bold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Body */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time column */}
              <div className="bg-gray-50 py-4 px-4 text-sm text-gray-500 font-medium">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => {
                const dayIncidents = getIncidentsForDate(day).filter(incident => {
                  const appointmentDate = incident.appointmentDate || incident.date || incident.scheduledDate;
                  if (!appointmentDate) return false;
                  const incidentHour = new Date(appointmentDate).getHours();
                  return incidentHour === hour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="bg-white min-h-[60px] p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      const selectedDateTime = new Date(day);
                      selectedDateTime.setHours(hour, 0, 0, 0);
                      setSelectedDate(selectedDateTime);
                      setShowAddModal(true);
                    }}
                  >
                    {dayIncidents.map((incident) => {
                      const patient = getPatientById(incident.patientId);
                      return (
                        <div
                          key={incident.id}
                          className={`text-xs p-2 rounded cursor-pointer mb-1 ${
                            incident.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : incident.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                            setShowIncidentModal(true);
                          }}
                        >
                          <div className="font-medium truncate">{incident.title}</div>
                          <div className="truncate">{patient?.name || 'Unknown Patient'}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Day view component
  const DayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayIncidents = getIncidentsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Day Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">{format(currentDate, 'EEEE')}</div>
            <div className={`text-3xl font-bold ${isToday(currentDate) ? 'text-blue-600' : 'text-gray-900'}`}>
              {currentDate.getDate()}
            </div>
            <div className="text-sm text-gray-500">{format(currentDate, 'MMMM yyyy')}</div>
          </div>
        </div>

        {/* Day Body */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourIncidents = dayIncidents.filter(incident => {
              const appointmentDate = incident.appointmentDate || incident.date || incident.scheduledDate;
              if (!appointmentDate) return false;
              const incidentHour = new Date(appointmentDate).getHours();
              return incidentHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 py-4 px-4 text-sm text-gray-500 font-medium border-r border-gray-100">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div 
                  className="flex-1 min-h-[80px] p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const selectedDateTime = new Date(currentDate);
                    selectedDateTime.setHours(hour, 0, 0, 0);
                    setSelectedDate(selectedDateTime);
                    setShowAddModal(true);
                  }}
                >
                  {hourIncidents.map((incident) => {
                    const patient = getPatientById(incident.patientId);
                    const appointmentDate = incident.appointmentDate || incident.date || incident.scheduledDate;
                    return (
                      <div
                        key={incident.id}
                        className={`p-3 rounded-lg mb-2 cursor-pointer ${
                          incident.status === 'Completed' 
                            ? 'bg-green-100 border border-green-200' 
                            : incident.status === 'In Progress'
                            ? 'bg-blue-100 border border-blue-200'
                            : 'bg-yellow-100 border border-yellow-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(incident);
                          setShowIncidentModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{incident.title}</div>
                            <div className="text-sm text-gray-600">{patient?.name || 'Unknown Patient'}</div>
                            <div className="text-xs text-gray-500">
                              {appointmentDate ? formatTime(appointmentDate) : 'No time set'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIncident(incident);
                                setShowEditModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleEditIncident = async (updatedIncident) => {
    console.log('handleEditIncident called with:', updatedIncident);
    
    try {
      await updateIncident(selectedIncident.id, updatedIncident);
      setShowEditModal(false);
      setSelectedIncident(null);
      console.log('Incident updated successfully');
    } catch (error) {
      console.error('Error in handleEditIncident:', error);
    }
  };

  const getViewTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM d, yyyy');
    }
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Debug Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
        <p className="text-sm text-yellow-700">Total incidents: {incidents?.length || 0}</p>
        <p className="text-sm text-yellow-700">Total patients: {patients?.length || 0}</p>
        <p className="text-sm text-yellow-700">Current filter: {filterStatus}</p>
        <p className="text-sm text-yellow-700">Current view: {view}</p>
        <p className="text-sm text-yellow-700">Current date: {currentDate.toDateString()}</p>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">All incidents with dates:</p>
          <div className="text-xs text-yellow-600 mt-1 max-h-32 overflow-y-auto bg-yellow-100 p-2 rounded">
            {incidents?.map((incident, index) => (
              <div key={index}>
                ID: {incident.id} | Date: {incident.appointmentDate || incident.date || incident.scheduledDate || 'NO DATE'} | Status: {incident.status} | Title: {incident.title}
              </div>
            )) || 'No incidents'}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">Incidents for today ({new Date().toDateString()}):</p>
          <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
            {getIncidentsForDate(new Date()).length} incidents found
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage appointments and schedule</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input pr-8 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Filter size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
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

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 min-w-[200px]">
            {getViewTitle()}
          </h2>
          
          <button
            onClick={goToToday}
            className="btn-secondary text-sm"
          >
            Today
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {['month', 'week', 'day'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                view === viewType
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="fade-in">
        {renderCurrentView()}
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900 font-medium">{selectedIncident.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Patient</label>
                <p className="text-gray-900">{getPatientById(selectedIncident.patientId)?.name || 'Unknown Patient'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-gray-900">
                  {selectedIncident.appointmentDate 
                    ? `${formatDate(selectedIncident.appointmentDate)} at ${formatTime(selectedIncident.appointmentDate)}`
                    : 'No date/time set'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedIncident.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedIncident.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedIncident.status}
                </span>
              </div>
            </div>
            
            {selectedIncident.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{selectedIncident.description}</p>
              </div>
            )}
            
            {selectedIncident.comments && (
              <div>
                <label className="text-sm font-medium text-gray-500">Comments</label>
                <p className="text-gray-900">{selectedIncident.comments}</p>
              </div>
            )}

            {selectedIncident.cost && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cost</label>
                <p className="text-gray-900 font-medium">${selectedIncident.cost}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
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
                Edit
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