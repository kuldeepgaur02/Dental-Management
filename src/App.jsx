import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientView from './components/patients/PatientView';
import IncidentList from './components/incidents/IncidentList';
import Analytics from './components/analytics/Analytics'; // Add this import
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Loading from './components/common/Loading';
import Calendar from './components/calender/Calender';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/register" 
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
        } 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute adminOnly>
            <AppLayout>
              <PatientList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PatientView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute adminOnly>
            <AppLayout>
              <IncidentList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute adminOnly>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute adminOnly>
            <AppLayout>
              <Calendar />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;