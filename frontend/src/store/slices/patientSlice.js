import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// Async Thunks

// Dashboard
export const fetchPatientDashboard = createAsyncThunk(
  'patient/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patient/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

// Fetch all reports
export const fetchPatientReports = createAsyncThunk(
  'patient/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patient/reports');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

// Get single report
export const getSingleReport = createAsyncThunk(
  'patient/getSingleReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/report/${reportId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);

// Share report by doctor ID and access level
export const shareReport = createAsyncThunk(
  'patient/shareReport',
  async ({ reportId, doctorId, accessLevel }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patient/reports/${reportId}/share`, {
        doctorId,
        accessLevel,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share report');
    }
  }
);

// Share report using doctor's license number
export const shareReportWithDoctor = createAsyncThunk(
  'patient/shareReportWithDoctor',
  async ({ reportId, doctorLicense }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reports/share`, {
        reportId,
        doctorLicense,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share report');
    }
  }
);

// Triage Session
export const startTriageSession = createAsyncThunk(
  'patient/startTriage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/patient/triage/start');
      return response.data;
    } catch (error) {
      toast.error('Server Unavailable! Please try again later.');
      return rejectWithValue(error.response?.data?.message || 'Failed to start triage');
    }
  }
);

export const sendTriageMessage = createAsyncThunk(
  'patient/sendTriageMessage',
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/patient/triage/message', { message, sessionId });
      return response.data;
    } catch (error) {
      toast.error('Failed to send message! Server Busy !!');
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Initial State
const initialState = {
  reports: [],
  selectedReport: null,
  triageSession: null,
  dashboardData: null,
  loading: false,
  error: null,
};

// Slice
const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchPatientDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
        state.reports = action.payload.reports;
      })
      .addCase(fetchPatientDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reports
      .addCase(fetchPatientReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchPatientReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single report
      .addCase(getSingleReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleReport.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReport = action.payload;
      })
      .addCase(getSingleReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Share report
      .addCase(shareReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(shareReport.fulfilled, (state) => {
        state.loading = false;
        toast.success('Report shared successfully');
      })
      .addCase(shareReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Share by license
      .addCase(shareReportWithDoctor.pending, (state) => {
        state.loading = true;
      })
      .addCase(shareReportWithDoctor.fulfilled, (state) => {
        state.loading = false;
        toast.success('Report shared with doctor successfully');
      })
      .addCase(shareReportWithDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Triage Start
      .addCase(startTriageSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTriageSession.fulfilled, (state, action) => {
        state.loading = false;
        state.triageSession = action.payload;
      })
      .addCase(startTriageSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Triage Message
      .addCase(sendTriageMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendTriageMessage.fulfilled, (state, action) => {
        state.loading = false;

        if (!state.triageSession) {
          state.triageSession = {
            _id: action.payload.sessionId,
            messages: [],
            riskAssessment: null,
            symptoms: [],
          };
        }

        if (action.payload.message && action.payload.botMessage) {
          state.triageSession.messages = [
            ...(state.triageSession.messages || []),
            action.payload.message,
            action.payload.botMessage,
          ];
        }

        if (action.payload.riskAssessment) {
          state.triageSession.riskAssessment = action.payload.riskAssessment;
        }

        if (action.payload.symptoms) {
          state.triageSession.symptoms = action.payload.symptoms;
        }
      })
      .addCase(sendTriageMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedReport } = patientSlice.actions;
export default patientSlice.reducer;
