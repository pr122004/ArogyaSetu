import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Phone, Lock, ArrowLeft, User } from 'lucide-react';
import { loginWithPassword, clearError } from '../store/slices/authSlice.js';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    abhaId: '',
    licenseId: '',
    hospital: '',
    labId: '',
  });

  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // Default role is patient

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ⬇️ Add user and isAuthenticated
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    const userData = {
      role,
      password,
    }

    if (role === 'patient') {
      userData.abhaId = formData.abhaId;
    } else if (role === 'doctor') {
      userData.licenseId = formData.licenseId;
    } else if (role === 'lab') {
      userData.labId = formData.labId;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    await dispatch(loginWithPassword(userData)); // ⬅️ removed navigate from here
  };

  // ⬇️ useEffect to redirect after Redux updates
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">Sign in to your HealthPortal account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
              <label className="block text-sm font-medium text-white mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'patient', label: 'Patient' },
                  { value: 'doctor', label: 'Doctor' },
                  { value: 'lab', label: 'Lab' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      role === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-blue-200 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {role === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ABHA Id
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name='abhaId'
                    value={formData.abhaId}
                    onChange={handleInputChange}
                    placeholder="Enter your ABHA Id"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={14}
                    required
                    autoComplete='username'
                  />
                </div>
              </div>
            )}

            {role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  License Id
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name='licenseId'
                    value={formData.licenseId}
                    onChange={handleInputChange}
                    placeholder="Enter your License Id"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={14}
                    required
                    autoComplete='username'
                  />
                </div>
              </div>
            )}

            {role === 'lab' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Lab License
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name='labId'
                    value={formData.labId}
                    onChange={handleInputChange}
                    placeholder="Enter your lab license Id"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={14}
                    required
                    autoComplete='username'
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={6}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-blue-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
