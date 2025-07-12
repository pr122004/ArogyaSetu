import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

// Login with Phone + Password
export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', userData);
      const { user } = response.data.data;
    
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);


// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // role: null, // Store user role
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false,
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
     setLoadingFalse: (state) => {
    state.loading = false;
  }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.isAuthenticated = false;
        state.error = null;
        // state.role = null; // Reset role on new login attempt
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        // state.role = action.payload.user.role; // Store user role
        toast.success('Login successful!');
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        // state.role = null; // Reset role on login failure
        toast.error(action.payload);
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        toast.success('Registration successful! Please login.');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { logout, clearError, setLoadingFalse } = authSlice.actions;
export default authSlice.reducer;
