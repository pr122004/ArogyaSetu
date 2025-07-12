import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// Async thunks
export const fetchLabDashboard = createAsyncThunk(
  'lab/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchLabReports = createAsyncThunk(
  'lab/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params || {});
      const response = await api.get(`/lab/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

export const searchPatients = createAsyncThunk(
  'lab/searchPatients',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lab/patients/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search patients');
    }
  }
);

export const uploadReport = createAsyncThunk(
  'lab/uploadReport',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/lab/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload report');
    }
  }
);

const initialState = {
  reports: [],
  patients: [],
  dashboardData: null,
  loading: false,
  searchLoading: false,
  uploadLoading: false,
  error: null,
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPatients: (state) => {
      state.patients = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchLabDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = {
          stats: action.payload.stats,
          user: action.payload.user
        };
        state.reports = action.payload.reports;
      })
      .addCase(fetchLabDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Fetch Reports
      .addCase(fetchLabReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchLabReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Search Patients
      .addCase(searchPatients.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.patients = action.payload;
        if (action.payload.length === 0) {
          toast.error('No patients found');
        }
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Upload Report
      .addCase(uploadReport.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadReport.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.reports.unshift(action.payload.report);
        toast.success('Report uploaded successfully!');
      })
      .addCase(uploadReport.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, clearPatients } = labSlice.actions;
export default labSlice.reducer;
