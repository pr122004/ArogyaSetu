import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Upload,
  FileCheck,
  Phone,
  Search,
  User
} from 'lucide-react';

import {
  searchPatients,
  uploadReport,
  clearPatients
} from '../../store/slices/labSlice.js';

const LabUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { patients, searchLoading, uploadLoading } = useSelector(state => state.lab);

  const [step, setStep] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [uploadData, setUploadData] = useState({
    reportType: 'blood_test',
    title: '',
    description: '',
    file: null
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    dispatch(clearPatients());
    await dispatch(searchPatients(searchQuery));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setStep('upload');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF or image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }

    setUploadData({ ...uploadData, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedPatient || !uploadData.file) {
      alert("Missing required fields");
      return;
    }

    const formData = new FormData();
    formData.append('patientId', selectedPatient._id);
    formData.append('reportType', uploadData.reportType);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('reportFile', uploadData.file); // always match backend field name

    const result = await dispatch(uploadReport(formData));

    if (uploadReport.fulfilled.match(result)) {
      navigate('/lab/reports');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Link to="/lab" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Report</h1>
            <p className="text-sm text-gray-500">Upload medical reports for patients</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center space-x-8 mb-6">
          <StepIndicator label="Search Patient" step="search" currentStep={step} />
          <div className={`w-16 h-0.5 ${step === 'upload' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <StepIndicator label="Upload Report" step="upload" currentStep={step} />
        </div>

        {step === 'search' ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Search Patient</h2>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name, phone or ABHA ID"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Results */}
            {patients.length > 0 && (
              <div className="mt-6 space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.age} years old</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" /> {patient.phone}
                      </p>
                      <p className="text-sm text-gray-500">ABHA: {patient.abhaId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Upload Report</h2>
              <button
                onClick={() => setStep('search')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Change Patient
              </button>
            </div>

            {/* Patient Info */}
            {selectedPatient && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <p className="font-medium text-blue-900">{selectedPatient.name}</p>
                <p className="text-sm text-blue-700">ABHA: {selectedPatient.abhaId} | Phone: {selectedPatient.phone}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Report Type</label>
                <select
                  value={uploadData.reportType}
                  onChange={(e) => setUploadData({ ...uploadData, reportType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="blood_test">Blood Test</option>
                  <option value="urine_test">Urine Test</option>
                  <option value="x_ray">X-Ray</option>
                  <option value="ct_scan">CT Scan</option>
                  <option value="mri">MRI</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">File (PDF/Image)</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <label className="cursor-pointer text-blue-600 font-medium">
                    Click to Upload
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  {uploadData.file && (
                    <div className="mt-2 flex justify-center items-center text-green-600">
                      <FileCheck className="h-4 w-4 mr-2" />
                      <span className="text-sm">{uploadData.file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Report'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/lab')}
                  className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const StepIndicator = ({ label, step, currentStep }) => (
  <div className={`flex items-center space-x-2 ${currentStep === step ? 'text-blue-600' : 'text-gray-400'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      currentStep === step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
    }`}>
      {step === 'search' ? '1' : '2'}
    </div>
    <span className="font-medium">{label}</span>
  </div>
);

export default LabUpload;
