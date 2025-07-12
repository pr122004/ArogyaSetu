import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Users,
  Phone,
  Calendar,
  FileText,
  Search,
  Eye,
  PlusCircle
} from 'lucide-react';
import {
  fetchDoctorPatients,
  addPatientByAbha
} from '../../store/slices/doctorSlice';

const DoctorPatients = () => {
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector((state) => state.doctor);
  const [searchTerm, setSearchTerm] = useState('');
  const [abhaIdToAdd, setAbhaIdToAdd] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchDoctorPatients());
  }, [dispatch]);

  const handleAddPatient = async () => {
    setAddLoading(true);
    setAddError('');
    setSuccessMessage('');
    try {
      const res = await dispatch(addPatientByAbha(abhaIdToAdd));
      if (addPatientByAbha.fulfilled.match(res)) {
        setSuccessMessage('Patient added successfully!');
        setAbhaIdToAdd('');
        dispatch(fetchDoctorPatients());
      } else {
        setAddError(res.payload?.message || 'Failed to add patient');
      }
    } catch (err) {
      setAddError('An error occurred while adding patient.');
    }
    setAddLoading(false);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.abhaId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/doctor"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                <p className="text-sm text-gray-500">Patients who have shared reports with you</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABHA Add Patient */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Enter ABHA ID to add patient"
              value={abhaIdToAdd}
              onChange={(e) => setAbhaIdToAdd(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddPatient}
              disabled={addLoading || !abhaIdToAdd.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="h-5 w-5" />
              {addLoading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
          {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
          {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or ABHA ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.age} years old</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    ABHA ID: {patient.abhaId}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last report: {patient.lastReportDate ? new Date(patient.lastReportDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{patient.reportCount || 0}</span> report{patient.reportCount !== 1 ? 's' : ''} shared
                  </div>
                  <Link
                    to="/doctor/reports"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Reports</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'No patients match your search criteria'
                : 'No patients have shared reports with you yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
