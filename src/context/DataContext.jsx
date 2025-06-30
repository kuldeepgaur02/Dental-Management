import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storageKeys, getFromStorage, setToStorage, generateId } from '../utils/storage';
import { getInitialData } from '../data/mockData';

const DataContext = createContext();

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return action.payload;
    
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => 
          u.id === action.payload.id ? action.payload : u
        )
      };
    
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload]
      };
    
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
        incidents: state.incidents.filter(i => i.patientId !== action.payload)
      };
    
    case 'ADD_INCIDENT':
      return {
        ...state,
        incidents: [...state.incidents, action.payload]
      };
    
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(i => 
          i.id === action.payload.id ? action.payload : i
        )
      };
    
    case 'DELETE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, {
    users: [],
    patients: [],
    incidents: []
  });

  useEffect(() => {
    // Initialize data from localStorage or mock data
    const initialData = getInitialData();
    dispatch({ type: 'SET_INITIAL_DATA', payload: initialData });
  }, []);

  useEffect(() => {
    // Save to localStorage whenever state changes
    if (state.users.length > 0) {
      setToStorage(storageKeys.USERS, state.users);
    }
    if (state.patients.length > 0) {
      setToStorage(storageKeys.PATIENTS, state.patients);
    }
    if (state.incidents.length > 0) {
      setToStorage(storageKeys.INCIDENTS, state.incidents);
    }
  }, [state.users, state.patients, state.incidents]);

  // User operations
  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: userData.id || generateId('u'),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return newUser;
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    return userData;
  };

  const getUserById = (userId) => {
    return state.users.find(u => u.id === userId);
  };

  // Patient operations
  const addPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      id: patientData.id || generateId('p'),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    return newPatient;
  };

  const updatePatient = (patientData) => {
    dispatch({ type: 'UPDATE_PATIENT', payload: patientData });
    return patientData;
  };

  const deletePatient = (patientId) => {
    dispatch({ type: 'DELETE_PATIENT', payload: patientId });
  };

  const getPatientById = (patientId) => {
    return state.patients.find(p => p.id === patientId);
  };

  const getPatientByUserId = (userId) => {
    return state.patients.find(p => p.userId === userId);
  };

  // Incident operations
  const addIncident = (incidentData) => {
    const newIncident = {
      ...incidentData,
      id: generateId('i'),
      createdAt: new Date().toISOString(),
      files: incidentData.files || []
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
    return newIncident;
  };

  const updateIncident = (incidentData) => {
    dispatch({ type: 'UPDATE_INCIDENT', payload: incidentData });
    return incidentData;
  };

  const deleteIncident = (incidentId) => {
    dispatch({ type: 'DELETE_INCIDENT', payload: incidentId });
  };

  const getIncidentById = (incidentId) => {
    return state.incidents.find(i => i.id === incidentId);
  };

  const getIncidentsByPatient = (patientId) => {
    return state.incidents.filter(i => i.patientId === patientId);
  };

  // Analytics and stats
  const getStats = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthIncidents = state.incidents.filter(i => {
      const appointmentDate = new Date(i.appointmentDate);
      return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
    });

    const completedIncidents = state.incidents.filter(i => i.status === 'Completed');
    const pendingIncidents = state.incidents.filter(i => i.status === 'Scheduled');
    const inProgressIncidents = state.incidents.filter(i => i.status === 'In Progress');

    const totalRevenue = completedIncidents.reduce((sum, i) => sum + (i.cost || 0), 0);
    const monthlyRevenue = thisMonthIncidents
      .filter(i => i.status === 'Completed')
      .reduce((sum, i) => sum + (i.cost || 0), 0);

    const upcomingAppointments = state.incidents
      .filter(i => new Date(i.appointmentDate) > now && i.status !== 'Completed')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 10);

    const topPatients = state.patients
      .map(patient => ({
        ...patient,
        incidentCount: state.incidents.filter(i => i.patientId === patient.id).length,
        totalSpent: state.incidents
          .filter(i => i.patientId === patient.id && i.status === 'Completed')
          .reduce((sum, i) => sum + (i.cost || 0), 0)
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      totalPatients: state.patients.length,
      totalIncidents: state.incidents.length,
      completedTreatments: completedIncidents.length,
      pendingAppointments: pendingIncidents.length,
      inProgressTreatments: inProgressIncidents.length,
      totalRevenue,
      monthlyRevenue,
      upcomingAppointments,
      topPatients,
      thisMonthIncidents: thisMonthIncidents.length
    };
  };

  const value = {
    ...state,
    addUser,
    updateUser,
    getUserById,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    getPatientByUserId,
    addIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    getIncidentsByPatient,
    getStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};