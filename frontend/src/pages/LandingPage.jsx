import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    // Just navigate to the role-specific page now
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white">HealthSaarthi</span>
            </div>
            <Link
              to="/login"
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Health, <span className="text-blue-400">Simplified</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Secure healthcare management for patients, doctors, and labs. 
            Upload reports, get AI-powered insights, and manage your health journey with confidence.
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <RoleCard
              icon={<Users className="h-12 w-12 text-blue-400" />}
              title="Patient"
              description="Manage your medical reports, get AI triage, and share with trusted doctors"
              features={["Upload & view reports", "AI symptom checker", "Share with doctors", "Emergency vault"]}
              onRoleSelect={() => handleRoleClick('patient')}
            />
            
            <RoleCard
              icon={<Shield className="h-12 w-12 text-green-400" />}
              title="Doctor"
              description="Review patient reports, provide feedback, and manage your practice"
              features={["View shared reports", "Add medical feedback", "Manage patients", "Professional dashboard"]}
              onRoleSelect={() => handleRoleClick('doctor')}
            />
            
            <RoleCard
              icon={<Heart className="h-12 w-12 text-red-400" />}
              title="Lab"
              description="Upload reports directly to patients and manage lab operations"
              features={["Upload patient reports", "Track delivery status", "Search patients", "Lab dashboard"]}
              onRoleSelect={() => handleRoleClick('lab')}
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose HealthSaarthi?</h2>
          <p className="text-blue-100 text-lg">Advanced features for modern healthcare management</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-blue-400" />}
            title="Secure & Private"
            description="End-to-end encryption and role-based access control"
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-red-400" />}
            title="AI-Powered"
            description="Smart triage and report analysis with AI insights"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-green-400" />}
            title="Collaborative"
            description="Seamless sharing between patients, doctors, and labs"
          />
          <FeatureCard
            icon={<ArrowRight className="h-8 w-8 text-purple-400" />}
            title="Modern Interface"
            description="Intuitive design that works on all devices"
          />
        </div>
      </section>
    </div>
  );
};

const RoleCard = ({ icon, title, description, features, onRoleSelect }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-blue-100">{description}</p>
        
        <ul className="space-y-2 text-sm text-blue-200">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={onRoleSelect}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex flex-col items-center text-center space-y-3">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-blue-200 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
