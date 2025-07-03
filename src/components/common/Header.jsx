import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, Settings, User, LogOut, Search, Menu, Calendar, FileText, Phone, Mail } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { patients, incidents, getPatientByUserId } = useData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  // Enhanced search functionality with role-based filtering
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchTerm = query.toLowerCase();

    // For patients, only search their own data
    if (user?.role === 'Patient') {
      const currentPatient = getPatientByUserId(user.id);
      if (!currentPatient) return;

      // Search patient's own appointments/incidents
      const patientIncidents = incidents.filter(incident => incident.patientId === currentPatient.id);
      
      patientIncidents.forEach(incident => {
        const matchScore = [];

        if (incident.title.toLowerCase().includes(searchTerm)) {
          matchScore.push('Treatment');
        }
        if (incident.description.toLowerCase().includes(searchTerm)) {
          matchScore.push('Description');
        }
        if (incident.treatment.toLowerCase().includes(searchTerm)) {
          matchScore.push('Treatment Type');
        }
        if (incident.status.toLowerCase().includes(searchTerm)) {
          matchScore.push('Status');
        }

        if (matchScore.length > 0) {
          results.push({
            ...incident,
            patientName: currentPatient.name,
            type: 'appointment',
            matchType: 'My Appointment',
            matchedFields: matchScore,
            icon: Calendar
          });
        }
      });
    } else {
      // For admin, search all patients and incidents (original logic)
      patients.forEach(patient => {
        const matchScore = [];
        
        if (patient.name.toLowerCase().includes(searchTerm)) {
          matchScore.push('Name');
        }
        if (patient.email.toLowerCase().includes(searchTerm)) {
          matchScore.push('Email');
        }
        if (patient.contact.includes(searchTerm)) {
          matchScore.push('Phone');
        }
        if (patient.id.toLowerCase().includes(searchTerm)) {
          matchScore.push('Patient ID');
        }
        if (patient.address.toLowerCase().includes(searchTerm)) {
          matchScore.push('Address');
        }

        if (matchScore.length > 0) {
          results.push({
            ...patient,
            type: 'patient',
            matchType: 'Patient',
            matchedFields: matchScore,
            icon: User
          });
        }
      });

      // Search appointments/incidents for admin
      incidents.forEach(incident => {
        const patient = patients.find(p => p.id === incident.patientId);
        const matchScore = [];

        if (patient && patient.name.toLowerCase().includes(searchTerm)) {
          matchScore.push('Patient Name');
        }
        if (incident.title.toLowerCase().includes(searchTerm)) {
          matchScore.push('Treatment');
        }
        if (incident.description.toLowerCase().includes(searchTerm)) {
          matchScore.push('Description');
        }
        if (incident.treatment.toLowerCase().includes(searchTerm)) {
          matchScore.push('Treatment Type');
        }
        if (incident.status.toLowerCase().includes(searchTerm)) {
          matchScore.push('Status');
        }

        if (matchScore.length > 0) {
          results.push({
            ...incident,
            patientName: patient ? patient.name : 'Unknown Patient',
            type: 'appointment',
            matchType: 'Appointment',
            matchedFields: matchScore,
            icon: Calendar
          });
        }
      });
    }

    // Sort results by relevance (more matches = higher priority)
    results.sort((a, b) => b.matchedFields.length - a.matchedFields.length);

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(results.length > 0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchResultClick = (result) => {
    // Handle navigation based on result type
    if (result.type === 'patient') {
      // Navigate to patient details
      console.log('Navigate to patient:', result.id);
    } else if (result.type === 'appointment') {
      // Navigate to appointment/incident details
      console.log('Navigate to appointment:', result.id);
    }
    
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate role-based notifications
  const generateNotifications = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    let relevantIncidents = [];
    let relevantPatients = [];

    if (user?.role === 'Patient') {
      // For patients, only show their own appointments and notifications
      const currentPatient = getPatientByUserId(user.id);
      if (currentPatient) {
        relevantIncidents = incidents.filter(incident => incident.patientId === currentPatient.id);
        relevantPatients = [currentPatient]; // Only their own patient record
      }
    } else {
      // For admin, show all incidents and patients
      relevantIncidents = incidents;
      relevantPatients = patients;
    }

    // Same-day appointments
    const todayAppointments = relevantIncidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return appointmentDate >= today && appointmentDate < tomorrow;
      })
      .map(incident => {
        const patient = patients.find(p => p.id === incident.patientId);
        const appointmentDate = new Date(incident.appointmentDate);
        const timeString = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        let timeMessage;
        if (timeDiff < 0) {
          timeMessage = 'ongoing';
        } else if (hoursUntil <= 1) {
          const minutesUntil = Math.ceil(timeDiff / (1000 * 60));
          timeMessage = `in ${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;
        } else {
          timeMessage = `at ${timeString}`;
        }
        
        return {
          id: `today_${incident.id}`,
          title: user?.role === 'Patient' ? 'Your Appointment Today' : 'Today\'s Appointment',
          message: user?.role === 'Patient' 
            ? `${incident.title} - ${timeMessage}`
            : `${patient?.name || 'Unknown Patient'} - ${incident.title}`,
          time: timeMessage,
          unread: true,
          priority: timeDiff < 60 * 60 * 1000 ? 'high' : 'normal', // High priority if within 1 hour
          status: incident.status
        };
      });

    // Status change notifications
    const statusChangeNotifications = relevantIncidents
      .filter(incident => {
        const createdDate = new Date(incident.createdAt);
        const timeDiff = now.getTime() - createdDate.getTime();
        return timeDiff <= 24 * 60 * 60 * 1000 && incident.status !== 'Scheduled';
      })
      .map(incident => {
        const patient = patients.find(p => p.id === incident.patientId);
        let statusIcon, statusColor, statusMessage;
        
        switch (incident.status) {
          case 'Completed':
            statusIcon = '✅';
            statusColor = 'text-green-600';
            statusMessage = user?.role === 'Patient' ? 'Your treatment completed' : 'Treatment completed';
            break;
          case 'In Progress':
            statusIcon = '🔄';
            statusColor = 'text-blue-600';
            statusMessage = user?.role === 'Patient' ? 'Your treatment in progress' : 'Treatment in progress';
            break;
          case 'Cancelled':
            statusIcon = '❌';
            statusColor = 'text-red-600';
            statusMessage = user?.role === 'Patient' ? 'Your appointment cancelled' : 'Appointment cancelled';
            break;
          default:
            statusIcon = '📋';
            statusColor = 'text-gray-600';
            statusMessage = user?.role === 'Patient' ? 'Your appointment status updated' : 'Status updated';
        }
        
        return {
          id: `status_${incident.id}`,
          title: 'Status Update',
          message: user?.role === 'Patient' 
            ? `${statusMessage} - ${incident.title}`
            : `${patient?.name || 'Unknown Patient'} - ${statusMessage}`,
          time: 'recently',
          unread: true,
          priority: 'normal',
          statusIcon,
          statusColor,
          treatment: incident.title
        };
      });

    // Upcoming appointments (next 2-24 hours)
    const upcomingAppointments = relevantIncidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        return timeDiff > 2 * 60 * 60 * 1000 && timeDiff <= 24 * 60 * 60 * 1000; // 2-24 hours ahead
      })
      .map(incident => {
        const patient = patients.find(p => p.id === incident.patientId);
        const appointmentDate = new Date(incident.appointmentDate);
        const hoursUntil = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        return {
          id: `upcoming_${incident.id}`,
          title: user?.role === 'Patient' ? 'Your Upcoming Appointment' : 'Upcoming Appointment',
          message: user?.role === 'Patient' 
            ? `${incident.title} - in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`
            : `${patient?.name || 'Unknown Patient'} - ${incident.title}`,
          time: `in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`,
          unread: true,
          priority: 'normal',
          status: incident.status
        };
      });

    // New patient registrations (only for admin)
    const recentPatients = user?.role === 'Admin' ? relevantPatients
      .filter(patient => {
        const createdDate = new Date(patient.createdAt);
        const timeDiff = now.getTime() - createdDate.getTime();
        return timeDiff <= 24 * 60 * 60 * 1000; // Last 24 hours
      })
      .map(patient => ({
        id: `new_patient_${patient.id}`,
        title: 'New Patient Registration',
        message: `${patient.name} registered as a new patient`,
        time: 'today',
        unread: true,
        priority: 'normal'
      })) : [];

    // Combine and sort notifications by priority and time
    const allNotifications = [
      ...todayAppointments,
      ...statusChangeNotifications,
      ...upcomingAppointments,
      ...recentPatients
    ];

    // Sort by priority (high first) then by time
    allNotifications.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return 0;
    });

    return allNotifications.slice(0, 6);
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

  const formatSearchResultTime = (incident) => {
    const date = new Date(incident.appointmentDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          
          {/* Enhanced Search Bar */}
          <div className="hidden md:flex relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={
                user?.role === 'Patient' 
                  ? "Search your appointments, treatments..." 
                  : "Search patients, appointments, treatments..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    Found {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                {searchResults.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <div
                      key={`${result.type}_${result.id}_${index}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          result.type === 'patient' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <IconComponent size={16} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {result.type === 'patient' ? result.name : result.patientName}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              result.type === 'patient' 
                                ? 'bg-blue-100 text-blue-700' 
                                : result.status === 'Completed' 
                                  ? 'bg-green-100 text-green-700'
                                  : result.status === 'Scheduled' 
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-orange-100 text-orange-700'
                            }`}>
                              {result.matchType}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {result.type === 'patient' 
                              ? `${result.email} • ${result.contact}`
                              : `${result.title} • ${result.treatment}`
                            }
                          </p>
                          
                          {result.type === 'appointment' && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatSearchResultTime(result)} • Status: {result.status}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.matchedFields.map((field, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* No Results Message */}
            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-6 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {user?.role === 'Patient' 
                      ? "Try searching for your appointments or treatments"
                      : "Try searching for patient names, emails, or treatments"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} className={`${notifications.some(n => n.priority === 'high') ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                  notifications.some(n => n.priority === 'high') ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {user?.role === 'Patient' ? 'Your Notifications' : 'Notifications'}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        } ${notification.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium text-sm ${
                                notification.priority === 'high' ? 'text-red-800' : 'text-gray-900'
                              }`}>
                                {notification.title}
                                {notification.priority === 'high' && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    URGENT
                                  </span>
                                )}
                              </h4>
                              {notification.statusIcon && (
                                <span className="text-sm">{notification.statusIcon}</span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              notification.statusColor || 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            {notification.treatment && (
                              <p className="text-xs text-gray-500 mt-1">
                                Treatment: {notification.treatment}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs ${
                                notification.priority === 'high' ? 'text-red-600 font-medium' : 'text-gray-500'
                              }`}>
                                {notification.time}
                              </p>
                              {notification.status && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  notification.status === 'Completed' 
                                    ? 'bg-green-100 text-green-700'
                                    : notification.status === 'In Progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : notification.status === 'Scheduled'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {notification.status}
                                </span>
                              )}
                            </div>
                          </div>
                          {notification.unread && (
                            <div className={`w-2 h-2 rounded-full ${
                              notification.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-4 text-center">
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={
              user?.role === 'Patient' 
                ? "Search your appointments..." 
                : "Search patients, appointments..."
            }
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Mobile Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => {
                const IconComponent = result.icon;
                return (
                  <div
                    key={`mobile_${result.type}_${result.id}_${index}`}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={14} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.type === 'patient' ? result.name : result.patientName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.type === 'patient' ? result.email : result.title}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;