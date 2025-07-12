import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PatientDashboard from './pages/Patient/PatientDashboard.jsx';
import PatientReports from './pages/Patient/PatientReports.jsx';
import PatientTriage from './pages/Patient/PatientTriage.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorReports from './pages/Doctor/DoctorReports.jsx';
import DoctorPatients from './pages/Doctor/DoctorPatients.jsx';
import LabDashboard from './pages/Lab/LabDashboard.jsx';
import LabReports from './pages/Lab/LabReports.jsx';
import LabUpload from './pages/Lab/LabUpload.jsx';
import ReportAIAnalysis from './pages/Patient/ReportAIAnalysis.jsx';




function App() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
            
          } />
          <Route path="/patient/report-ai" element={<ReportAIAnalysis />} />
          <Route path="/patient/reports" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientReports />
            </ProtectedRoute>
          } />
          <Route path="/patient/triage" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientTriage />
            </ProtectedRoute>
          } />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/reports" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorReports />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatients />
            </ProtectedRoute>
          } />
          
          {/* Lab Routes */}
          <Route path="/lab" element={
            <ProtectedRoute allowedRoles={['lab']}>
              <LabDashboard />
            </ProtectedRoute>
          } />
          <Route path="/lab/reports" element={
            <ProtectedRoute allowedRoles={['lab']}>
              <LabReports />
            </ProtectedRoute>
          } />
          <Route path="/lab/upload" element={
            <ProtectedRoute allowedRoles={['lab']}>
              <LabUpload />
            </ProtectedRoute>
          } />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;