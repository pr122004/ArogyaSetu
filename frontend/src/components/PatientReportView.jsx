import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleReport, shareReportWithDoctor } from '../store/slices/patientSlice';
import { Eye, Share2, ArrowLeft, Download } from 'lucide-react';

const PatientReportView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedReport, loading } = useSelector(state => state.patient);
  const [license, setLicense] = useState('');
  const [message, setMessage] = useState('');
  const [reportLoaded, setReportLoaded] = useState(false);
  const [reportError, setReportError] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const reportUrl = `${BASE_URL}/api/report/${id}/file`;

  useEffect(() => {
    dispatch(getSingleReport(id));
  }, [dispatch, id]);

  const handleShare = async () => {
    if (!license.trim()) return;
    const res = await dispatch(
      shareReportWithDoctor({ reportId: id, doctorLicense: license.trim() })
    );
    if (shareReportWithDoctor.fulfilled.match(res)) {
      setMessage('✅ Shared successfully with doctor!');
      setLicense('');
    } else {
      setMessage(res.payload?.message || '❌ Error sharing report');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-blue-600">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-2">
        {selectedReport ? selectedReport.title : 'Report Viewer'}
      </h1>
      <p className="text-gray-600 mb-4">
        {selectedReport ? `Type: ${selectedReport.reportType.replace('_', ' ')}` : ''}
      </p>

      {/* Report Preview Area */}
      <div className="w-full h-[600px] border rounded shadow mb-4 flex items-center justify-center bg-gray-50">
        {loading ? (
          <p>Loading...</p>
        ) : reportError || !selectedReport ? (
          <p className="text-red-600">⚠️ Report not found or failed to load.</p>
        ) : (
          <iframe
            src={reportUrl}
            title="Report Preview"
            onLoad={() => setReportLoaded(true)}
            onError={() => setReportError(true)}
            className="w-full h-full rounded"
          />
        )}
      </div>

      {/* Actions Area (always visible) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          disabled={!selectedReport || reportError}
          onClick={() => window.open(reportUrl, '_blank')}
          className={`px-4 py-2 rounded flex items-center text-white ${
            selectedReport && !reportError
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="Enter Doctor's License Number"
            className="w-full border p-2 rounded mb-2"
          />
          <button
            disabled={!selectedReport || reportError || !license.trim()}
            onClick={handleShare}
            className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center ${
              !selectedReport || reportError || !license.trim()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share with Doctor
          </button>
          {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PatientReportView;
