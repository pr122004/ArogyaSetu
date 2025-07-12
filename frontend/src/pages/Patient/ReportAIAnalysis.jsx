import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, UploadCloud, Loader } from 'lucide-react';
import { fetchPatientReports } from '../../store/slices/patientSlice';

const ReportAIAnalysis = () => {
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.patient);
  const [scanType, setScanType] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPatientReports());
  }, [dispatch]);

  const handleUpload = async () => {
    if (!scanType || !image) {
      return alert("Please select scan type and upload an image.");
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const endpoint = `http://192.168.1.5:5002/predict/${scanType}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Format 1: predictions is an array
      if (Array.isArray(data?.predictions) && data.predictions.length > 0) {
        const topPrediction = data.predictions[0];
        setResult({
          prediction: topPrediction.class,
          confidence: topPrediction.confidence,
          severity:
            topPrediction.confidence > 0.85
              ? 'high'
              : topPrediction.confidence > 0.6
              ? 'medium'
              : 'low',
        });
        alert("Prediction generated successfully.");
      }
      // Format 2: predictions is object + predicted_classes
      else if (
        data?.predicted_classes?.length > 0 &&
        typeof data.predictions === 'object'
      ) {
        const predClass = data.predicted_classes[0];
        const predInfo = data.predictions[predClass];

        if (predInfo?.confidence !== undefined) {
          setResult({
            prediction: predClass,
            confidence: predInfo.confidence,
            severity:
              predInfo.confidence > 0.85
                ? 'high'
                : predInfo.confidence > 0.6
                ? 'medium'
                : 'low',
          });
          alert("Prediction generated successfully.");
        } else {
          alert("Prediction format unrecognized.");
        }
      } else {
        alert("Could not analyze the image.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Reports</h2>
      <div className="space-y-4 mb-10">
        {reports?.length > 0 ? reports.map((r) => (
          <div key={r._id} className="p-4 bg-white rounded-md shadow border border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileText className="text-gray-500" />
              <div>
                <p className="text-gray-900 font-medium">{r.title}</p>
                <p className="text-sm text-gray-500">{r.labId?.labName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        )) : <p>No reports found.</p>}
      </div>

      <h2 className="text-2xl font-bold mb-4">AI Report Analysis</h2>
      <div className="bg-white p-6 rounded-md shadow border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Scan Type</label>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md"
          >
            <option value="">-- Select --</option>
            <option value="xray">X-ray</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
            <img src={imagePreview} alt="Preview" className="w-48 rounded shadow" />
          </div>
        )}

        <button
          onClick={handleUpload}
          className={`bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Analyze Report</span>
            </>
          )}
        </button>

        {result && (
          <div className="mt-6 bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="text-green-700 font-semibold mb-2">Prediction Results:</h4>
            <p><strong>Disease:</strong> {result.prediction}</p>
            <p><strong>Severity:</strong> {result.severity}</p>
            {result.confidence && (
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAIAnalysis;
