import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, 
  MessageCircle, 
  Upload, 
  Shield, 
  TrendingUp, 
  Users,
  Calendar,
  AlertTriangle,
  Heart,
  LogOut
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice.js';
import { fetchPatientDashboard } from '../../store/slices/patientSlice.js';
import Chatbot from '../../components/Chatbot.jsx';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reports, dashboardData, loading } = useSelector((state) => state.patient);

  useEffect(() => {
    dispatch(fetchPatientDashboard());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
    
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
      
      
    );
  }

  const recentReports = reports?.slice(0, 3) || [];
  const pendingReports = reports?.filter(r => r.status === 'pending').length || 0;
  const reviewedReports = reports?.filter(r => r.status === 'reviewed').length || 0;

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthPortal</h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-blue-100">Manage your health reports and get AI-powered insights</p>
        </div>
        {/* Smart Band Data */}
        <div className="bg-white rounded-xl shadow-sm border mb-12 border-gray-200 mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Band Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <HealthMetric label="Heart Rate" value="76 bpm" icon={<Heart className="h-5 w-5 text-red-500" />} />
              <HealthMetric label="Blood Pressure" value="120/80 mmHg" icon={<Shield className="h-5 w-5 text-blue-500" />} />
              <HealthMetric label="Steps Today" value="5,342" icon={<TrendingUp className="h-5 w-5 text-green-600" />} />
              <HealthMetric label="Sleep Duration" value="6.8 hrs" icon={<Calendar className="h-5 w-5 text-purple-600" />} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Reports" value={reports?.length || 0} Icon={FileText} color="text-blue-600" />
          <StatCard label="Pending Review" value={pendingReports} Icon={AlertTriangle} color="text-yellow-500" />
          <StatCard label="Reviewed" value={reviewedReports} Icon={Users} color="text-green-500" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            icon={<MessageCircle className="h-6 w-6" />}
            title="AI Triage"
            description="Get instant symptom assessment"
            link="/patient/triage"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <QuickActionCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="AI Report Analysis"
            description="Upload X-ray / CT / MRI and get insights"
            link="/patient/report-ai"
            bgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <Link 
                to="/patient/reports"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500">{report.labId?.labName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports yet</p>
                <Link 
                  to="/patient/reports"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Upload your first report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Health Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-gray-600">Your health metrics are improving</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-gray-600">Next checkup recommended in 3 months</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">Consider a routine blood test based on your age</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">Your recent reports show good progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
    <Chatbot />
    </>
  );
};

const QuickActionCard = ({ icon, title, description, link, bgColor, iconColor }) => (
  <Link 
    to={link}
    className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
  >
    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <div className={iconColor}>
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

const StatCard = ({ label, value, Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  </div>
);

const HealthMetric = ({ label, value, icon }) => (
  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
    {icon}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default PatientDashboard;
