# 🦷 Dental Center Management System

A comprehensive dental center management dashboard built with React, Vite, and Tailwind CSS. This system provides role-based access for dental clinic administration and patient management.

## 🚀 Live Demo

- **Deployed Application**: https://dental-management-kappa.vercel.app/
- **GitHub Repository**: https://github.com/kuldeepgaur02/Dental-Management 

## 👥 Demo Credentials

### Admin (Dentist) Access
- **Email**: `admin@entnt.in`
- **Password**: `admin123`

### Patient Access
- **Email**: `john@entnt.in`
- **Password**: `patient123`

## ✨ Features

### 🔐 Authentication System
- Simulated login with role-based access control
- Session persistence using localStorage
- Secure route protection

### 👨‍⚕️ Admin Features (Dentist)
- **Patient Management**: Add, edit, delete, and view all patients
- **Appointment Management**: Schedule and manage dental appointments
- **Incident Tracking**: Record treatment details, costs, and status
- **Calendar View**: Monthly/weekly view of appointments
- **File Management**: Upload and manage treatment files, invoices, and images
- **Dashboard KPIs**: Revenue tracking, appointment statistics, patient analytics

### 🧑‍🤝‍🧑 Patient Features
- **Personal Dashboard**: View personal information and upcoming appointments
- **Appointment History**: Access past treatments and costs
- **File Access**: View uploaded treatment files and invoices
- **Next Appointment**: Quick access to upcoming scheduled visits

### 📱 Additional Features
- **File Upload**: Support for images, PDFs, and documents
- **Real-time Updates**: Instant data synchronization
- **Search & Filter**: Advanced filtering options
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Context API with useReducer
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Date Handling**: JavaScript Date API
- **File Handling**: Base64 encoding for localStorage
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📁 Project Structure

```
dental-center-management/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx           # Application header with navigation
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Modal.jsx            # Reusable modal component
│   │   │   ├── FileUpload.jsx       # File upload functionality
│   │   │   └── Loading.jsx          # Loading spinner component
│   │   ├── auth/
│   │   │   └── Login.jsx            # Authentication form
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx        # Main dashboard with KPIs
│   │   ├── patients/
│   │   │   ├── PatientList.jsx      # Patient listing and management
│   │   │   ├── PatientForm.jsx      # Add/edit patient form
│   │   │   └── PatientView.jsx      # Patient detail view
│   │   ├── incidents/
│   │   │   ├── IncidentList.jsx     # Appointment/incident listing
│   │   │   ├── IncidentForm.jsx     # Add/edit incident form
│   │   │   └── IncidentView.jsx     # Incident detail view
│   │   └── calendar/
│   │       └── Calendar.jsx         # Calendar view for appointments
│   ├── context/
│   │   ├── AuthContext.jsx          # Authentication state management
│   │   └── DataContext.jsx          # Application data management
│   ├── hooks/
│   │   └── useLocalStorage.js       # Custom localStorage hook
│   ├── utils/
│   │   ├── storage.js               # localStorage utilities
│   │   ├── dateUtils.js             # Date formatting utilities
│   │   └── fileUtils.js             # File handling utilities
│   ├── data/
│   │   └── mockData.js              # Initial mock data
│   ├── App.jsx                      # Main application component
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone
   cd dental_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```


## 🏗️ Architecture & Design Decisions

### State Management
- **Context API**: Chosen over Redux for simplicity and project size
- **useReducer**: For complex state logic in data management
- **localStorage**: All data persistence handled client-side

### Component Architecture
- **Functional Components**: Using React hooks throughout
- **Custom Hooks**: For reusable logic (localStorage, data fetching)
- **Compound Components**: For complex UI patterns like modals

### Data Flow
1. **Authentication**: Login → Context → Route Protection
2. **Data Management**: Component → Context → localStorage
3. **File Handling**: Upload → Base64 → localStorage → Display

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Component Variants**: Reusable component patterns
- **Custom Utilities**: Extended Tailwind configuration

## 🔄 Data Models

### User
```javascript
{
  id: string,
  role: "Admin" | "Patient",
  email: string,
  password: string,
  patientId?: string
}
```

### Patient
```javascript
{
  id: string,
  name: string,
  dob: string,
  contact: string,
  healthInfo: string,
  createdAt: string
}
```

### Incident/Appointment
```javascript
{
  id: string,
  patientId: string,
  title: string,
  description: string,
  comments: string,
  appointmentDate: string,
  cost?: number,
  treatment?: string,
  status: "Scheduled" | "Completed" | "Cancelled",
  nextDate?: string,
  files: Array<{name: string, url: string}>
}
```

## 🎯 Key Features Implementation

### Authentication Flow
1. User enters credentials
2. Validation against mock data in localStorage
3. Role-based route protection
4. Session persistence

### File Upload System
1. File selection via input
2. Validation (size, type)
3. Base64 encoding
4. Storage in localStorage
5. Preview and download functionality

### Calendar Integration
1. Month/week view rendering
2. Appointment overlay
3. Interactive date selection
4. Appointment creation from calendar


## 📈 Performance Optimizations

- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input debouncing
- **File Optimization**: Image compression before storage
---

**Built using React, Vite, and Tailwind CSS**
