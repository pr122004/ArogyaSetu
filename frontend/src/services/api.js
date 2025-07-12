import axios from 'axios';
 // if you're using dispatch here

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for sending cookies
});

// Request interceptor: NO need to add Authorization manually
api.interceptors.request.use(
  (config) => {
    // No token manually needed, cookies will be sent automatically
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handles 401 & tries refreshing the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh access token using refresh token cookie
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // No need to store accessToken manually if it's sent as cookie
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token expired or invalid');
        // store.dispatch(user(null)); // clear Redux state
        window.location.href = '/login'; // redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
