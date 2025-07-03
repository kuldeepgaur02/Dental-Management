import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Calendar, Users,DollarSign, TrendingUp, Activity, Clock, FileText, Heart, Award, Target } from 'lucide-react';
import { getInitialData } from "../../data/mockData";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Analytics calculations using localStorage data
  const analytics = useMemo(() => {
    // Get fresh data from localStorage
    const { patients, incidents } = getInitialData();
    
    // Total metrics
    const totalPatients = patients.length;
    const totalIncidents = incidents.length;
    const totalRevenue = incidents
  .filter(incident => incident.status === 'Completed')
  .reduce((sum, incident) => sum + incident.cost, 0);

    const completedIncidents = incidents.filter(i => i.status === 'Completed').length;
    
    // Status distribution
    const statusData = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusChartData = Object.entries(statusData).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / totalIncidents) * 100)
    }));
    
    // Revenue by treatment type
    const treatmentRevenue = incidents.reduce((acc, incident) => {
      const treatmentType = incident.title;
      acc[treatmentType] = (acc[treatmentType] || 0) + incident.cost;
      return acc;
    }, {});
    
    const revenueChartData = Object.entries(treatmentRevenue).map(([treatment, revenue]) => ({
      treatment,
      revenue,
      count: incidents.filter(i => i.title === treatment).length
    }));
    
    // Monthly trends (simulated)
const currentYear = new Date().getFullYear();

// Initialize 12 months
const monthlyDataMap = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
  patients: 0,
  revenue: 0,
  appointments: 0
}));

// Count patients created per month
patients.forEach((patient) => {
  const date = new Date(patient.createdAt);
  if (date.getFullYear() === currentYear) {
    const monthIndex = date.getMonth();
    monthlyDataMap[monthIndex].patients += 1;
  }
});

// Count appointments and revenue per month
incidents.forEach((incident) => {
  const date = new Date(incident.appointmentDate);
  if (date.getFullYear() === currentYear) {
    const monthIndex = date.getMonth();
    monthlyDataMap[monthIndex].appointments += 1;

    if (incident.status === "Completed") {
      monthlyDataMap[monthIndex].revenue += incident.cost;
    }
  }
});

const monthlyData = monthlyDataMap;

    
    // Patient demographics
    const ageGroups = patients.reduce((acc, patient) => {
      const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
      let group;
      if (age < 25) group = '18-25';
      else if (age < 35) group = '26-35';
      else if (age < 45) group = '36-45';
      else group = '45+';
      
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
    
    const ageChartData = Object.entries(ageGroups).map(([group, count]) => ({
      age: group,
      count,
      percentage: Math.round((count / totalPatients) * 100)
    }));
    
    // Blood group distribution
    const bloodGroups = patients.reduce((acc, patient) => {
      acc[patient.bloodGroup] = (acc[patient.bloodGroup] || 0) + 1;
      return acc;
    }, {});
    
    const bloodGroupData = Object.entries(bloodGroups).map(([group, count]) => ({
      group,
      count
    }));

    return {
      totals: {
        totalPatients,
        totalIncidents,
        totalRevenue,
        completedIncidents,
        successRate: totalIncidents > 0 ? Math.round((completedIncidents / totalIncidents) * 100) : 0,
        avgRevenuePerPatient: totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0
      },
      statusChartData,
      revenueChartData,
      monthlyData,
      ageChartData,
      bloodGroupData
    };
  }, []);

  const colors = {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    light: '#DBEAFE',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  const chartColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning, colors.danger];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = colors.primary }) => (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your dental practice performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Patients"
            value={analytics.totals.totalPatients}
            subtitle="Active patients"
            trend="+12%"
            color={colors.primary}
          />
          <StatCard
            icon={Calendar}
            title="Total Appointments"
            value={analytics.totals.totalIncidents}
            subtitle="This month"
            trend="+8%"
            color={colors.secondary}
          />
          <StatCard
            icon={() => <span className="text-xl">₹</span>}
            title="Total Revenue"
            value={`₹${analytics.totals.totalRevenue.toLocaleString()}`}
            subtitle="This period"
            trend="+15%"
            color={colors.success}
          />

          <StatCard
            icon={Target}
            title="Success Rate"
            value={`${analytics.totals.successRate}%`}
            subtitle="Completed treatments"
            trend="+3%"
            color={colors.warning}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Revenue Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyData}> 
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={colors.primary} 
                  fill={colors.light}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Treatment Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Treatment Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {analytics.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Treatment & Patient Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Treatment Type */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Revenue by Treatment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="treatment" 
                  stroke="#6B7280" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Age Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Patient Age Groups
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="age" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill={colors.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Key Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Revenue/Patient</span>
                <span className="font-semibold text-gray-900">₹{analytics.totals.avgRevenuePerPatient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">{analytics.totals.successRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Treatments</span>
                <span className="font-semibold text-blue-600">
                  {analytics.statusChartData.find(s => s.name === 'In Progress')?.value || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Blood Group Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Blood Groups
            </h3>
            <div className="space-y-3">
              {analytics.bloodGroupData.map((item, index) => (
                <div key={item.group} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.group}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${analytics.totals.totalPatients > 0 ? (item.count / analytics.totals.totalPatients) * 100 : 0}%`,
                          backgroundColor: chartColors[index % chartColors.length]
                        }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 w-6">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Wisdom tooth extraction completed</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Crown installation in progress</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Dental implant consultation scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;