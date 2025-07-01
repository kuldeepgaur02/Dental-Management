import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, formatDateTime, getAge } from '../../utils/dateUtils';

const StatCard = ({ title, value, icon: Icon, color = 'blue', change = null }) => {
  const colorClasses = {
    blue: 'stat-card',
    green: 'stat-card success',
    yellow: 'stat-card warning',
    red: 'stat-card danger'
  };

  return (
    <div className={colorClasses[color]}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'yellow' ? 'bg-yellow-100' :
          'bg-red-100'
        }`}>
          <Icon size={24} className={
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'yellow' ? 'text-yellow-600' :
            'text-red-600'
          } />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { getStats, patients, incidents } = useData();
  const stats = getStats();

  const isAdmin = user?.role === 'Admin';

  // For patients, show only their own data
  const patientData = isAdmin ? null : {
    patient: patients.find(p => p.id === user?.patientId),
    appointments: incidents.filter(i => i.patientId === user?.patientId)
  };

  if (!isAdmin && patientData) {
    return <PatientDashboard patient={patientData.patient} appointments={patientData.appointments} />;
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Doctor'}!</h1>
        <p className="text-blue-100 mt-1">
          Here's what's happening at your dental center today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Completed Treatments"
          value={stats.completedTreatments}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue}`}
          icon={DollarSign}
          color="green"
          change="+12% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={20} />
              Upcoming Appointments
            </h3>
          </div>
          <div className="card-body">
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAppointments.slice(0, 5).map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(appointment.appointmentDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Patients */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="mr-2" size={20} />
              Top Patients
            </h3>
          </div>
          <div className="card-body">
            {stats.topPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patient data available</p>
            ) : (
              <div className="space-y-3">
                {stats.topPatients.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">
                          {patient.incidentCount} treatments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{patient.totalSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <Activity className="mx-auto mb-3 text-blue-600" size={32} />
            <h4 className="text-lg font-semibold text-gray-900">In Progress</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.inProgressTreatments}
            </p>
            <p className="text-sm text-gray-600">Active treatments</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <DollarSign className="mx-auto mb-3 text-green-600" size={32} />
            <h4 className="text-lg font-semibold text-gray-900">Total Revenue</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₹{stats.totalRevenue}
            </p>
            <p className="text-sm text-gray-600">All time earnings</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <Calendar className="mx-auto mb-3 text-purple-600" size={32} />
            <h4 className="text-lg font-semibold text-gray-900">This Month</h4>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {stats.thisMonthIncidents}
            </p>
            <p className="text-sm text-gray-600">Appointments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Dashboard Component
const PatientDashboard = ({ patient, appointments }) => {
  if (!patient) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-xl font-semibold text-gray-900">Patient Data Not Found</h2>
        <p className="text-gray-600 mt-2">Please contact the dental center for assistance.</p>
      </div>
    );
  }

  const upcomingAppts = appointments.filter(a => new Date(a.appointmentDate) > new Date());
  const completedAppts = appointments.filter(a => a.status === 'Completed');
  const totalSpent = completedAppts.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {patient.name}!</h1>
        <p className="text-blue-100 mt-1">
          Manage your dental appointments and view your treatment history
        </p>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppts.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed Treatments"
          value={completedAppts.length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Spent"
          value={`₹${totalSpent}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="mr-2" size={20} />
              Personal Information
            </h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{getAge(patient.dob)} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">{formatDate(patient.dob)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Group:</span>
              <span className="font-medium">{patient.bloodGroup || 'Not specified'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Contact:</span>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Phone size={14} />
                  <span className="font-medium">{patient.contact}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Mail size={14} />
                  <span className="font-medium">{patient.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={20} />
              Upcoming Appointments
            </h3>
          </div>
          <div className="card-body">
            {upcomingAppts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(appointment.appointmentDate)}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Treatment History */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="mr-2" size={20} />
            Recent Treatment History
          </h3>
        </div>
        <div className="card-body">
          {completedAppts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No completed treatments</p>
          ) : (
            <div className="space-y-3">
              {completedAppts.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{appointment.treatment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{appointment.cost}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                  {appointment.files && appointment.files.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        {appointment.files.length} file(s) attached
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;