import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, Settings, User, LogOut, Search, Menu, Calendar, FileText, Phone, Mail } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { patients, incidents } = useData();
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

  // Enhanced search functionality
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchTerm = query.toLowerCase();

    // Search patients
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

    // Search appointments/incidents
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

  // Generate notifications from recent incidents
  const generateNotifications = () => {
    const now = new Date();
    const upcomingAppointments = incidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Next 24 hours
      })
      .map(incident => {
        const patient = patients.find(p => p.id === incident.patientId);
        const appointmentDate = new Date(incident.appointmentDate);
        const timeDiff = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        return {
          id: `notif_${incident.id}`,
          title: 'Upcoming Appointment',
          message: `${patient?.name || 'Unknown Patient'} - ${incident.title}`,
          time: `in ${timeDiff} hour${timeDiff > 1 ? 's' : ''}`,
          unread: true
        };
      });

    const recentPatients = patients
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
        unread: true
      }));

    return [...upcomingAppointments, ...recentPatients].slice(0, 5);
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
              placeholder="Search patients, appointments, treatments..."
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
                  <p className="text-xs text-gray-400 mt-1">Try searching for patient names, emails, or treatments</p>
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
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
            placeholder="Search patients, appointments..."
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