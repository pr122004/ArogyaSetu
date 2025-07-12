import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// Async thunks
export const fetchDoctorDashboard = createAsyncThunk(
  'doctor/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctor/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);
export const addPatientByAbha = createAsyncThunk(
  'doctor/addPatientByAbha',
  async (abhaId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/doctor/patients`, { abhaId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const fetchDoctorReports = createAsyncThunk(
  'doctor/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctor/reports');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

export const fetchDoctorPatients = createAsyncThunk(
  'doctor/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctor/patients');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const addReportFeedback = createAsyncThunk(
  'doctor/addFeedback',
  async ({ reportId, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/doctor/reports/feedback`, { reportId, feedback });
      return { reportId, feedback, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add feedback');
    }
  }
);

const initialState = {
  reports: [],
  patients: [],
  dashboardData: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMockData: (state) => {
      state.reports = [
        {
          _id: '1',
          title: 'Blood Test Results',
          reportType: 'blood_test',
          status: 'pending',
          createdAt: new Date().toISOString(),
          patientId: { name: 'John Doe', age: 35 },
          labId: { labName: 'City Medical Lab' }
        },
        {
          _id: '2',
          title: 'MRI Brain Scan',
          reportType: 'mri',
          status: 'reviewed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          patientId: { name: 'Jane Smith', age: 42 },
          labId: { labName: 'Advanced Imaging' }
        },
        {
          _id: '3',
          title: 'Cardiac Echo',
          reportType: 'ultrasound',
          status: 'delivered',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          patientId: { name: 'Robert Johnson', age: 58 },
          labId: { labName: 'Heart Center' }
        }
      ];
      state.dashboardData = {
        sharedReports: state.reports,
        pendingReviews: state.reports.filter(r => r.status === 'pending')
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        state.reports = action.payload.sharedReports;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reports
      .addCase(fetchDoctorReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchDoctorReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Patients
      .addCase(fetchDoctorPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchDoctorPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Feedback
      .addCase(addReportFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReportFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const { reportId, feedback } = action.payload;
        const reportIndex = state.reports.findIndex(r => r._id === reportId);
        if (reportIndex !== -1) {
          state.reports[reportIndex].doctorFeedback = feedback;
          state.reports[reportIndex].status = 'reviewed';
        }
        toast.success('Feedback added successfully');
      })
      .addCase(addReportFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, setMockData } = doctorSlice.actions;
export default doctorSlice.reducer;