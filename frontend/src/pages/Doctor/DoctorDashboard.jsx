import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Heart,
  LogOut
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { fetchDoctorDashboard, fetchDoctorPatients } from '../../store/slices/doctorSlice';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { reports, dashboardData, patients, loading } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    dispatch(fetchDoctorPatients());
  }, [dispatch]);

  const handleLogout = () => dispatch(logout());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalReports = reports?.length || 0;
  const pendingReports = dashboardData?.pendingReviews?.length || 0;
  const completedToday = reports?.filter(r =>
    new Date(r.createdAt).toDateString() === new Date().toDateString() && r.status === 'reviewed'
  )?.length || 0;
  const totalPatients = patients?.length || 0;
  const recentReports = reports?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthPortal</h1>
                <p className="text-sm text-gray-500">Doctor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Dr. {user?.name}</p>
                <p className="text-xs text-gray-500">{user?.hospital}</p>
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Dr. {user?.name}!</h2>
          <p className="text-green-100">Review patient reports and provide medical insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Reports" value={totalReports} icon={<FileText className="h-8 w-8 text-blue-600" />} />
          <StatCard title="Pending Reviews" value={pendingReports} icon={<AlertTriangle className="h-8 w-8 text-yellow-500" />} />
          <StatCard title="Completed Today" value={completedToday} icon={<CheckCircle className="h-8 w-8 text-green-500" />} />
          <StatCard title="Patients" value={totalPatients} icon={<Users className="h-8 w-8 text-purple-500" />} />
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Patient</Th>
                  <Th>Report</Th>
                  <Th>Lab</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{report.patientId?.name}</div>
                      <div className="text-sm text-gray-500">{report.patientId?.age} years old</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500">{report.reportType?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{report.labId?.labName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'reviewed' ? 'bg-green-100 text-green-800'
                        : report.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      {report.status !== 'reviewed' && (
                        <button className="text-green-600 hover:text-green-900">Review</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard title="Review Reports" desc="Check pending patient reports" icon={<FileText className="h-6 w-6 text-blue-600" />} onClick={() => navigate('/doctor/reports')} />
          <QuickActionCard title="Manage Patients" desc="View patient information" icon={<Users className="h-6 w-6 text-green-600" />} onClick={() => navigate('/doctor/patients')} />
          <QuickActionCard title="Schedule" desc="Manage appointments" icon={<Calendar className="h-6 w-6 text-purple-600" />} onClick={() => navigate('/doctor/schedule')} />
        </div>
      </div>
    </div>
  );
};

const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const QuickActionCard = ({ title, desc, icon, onClick }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
    >
      View {title.split(' ')[0]}
    </button>
  </div>
);

export default DoctorDashboard;
