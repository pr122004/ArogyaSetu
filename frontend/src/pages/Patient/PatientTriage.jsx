import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Send, Bot, User, AlertCircle, CheckCircle } from 'lucide-react';
import { startTriageSession, sendTriageMessage } from '../../store/slices/patientSlice.js';

const PatientTriage = () => {
  const dispatch = useDispatch();
  const { triageSession, loading } = useSelector((state) => state.patient);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!triageSession) {
      dispatch(startTriageSession());
    }
  }, [dispatch, triageSession]);

  useEffect(() => {
    if (triageSession?.messages) {
      setLocalMessages(triageSession.messages);
    }
  }, [triageSession?.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !triageSession) return;

    const userMsg = {
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setMessage('');

    const result = await dispatch(sendTriageMessage({
      message: userMsg.content,
      sessionId: triageSession._id
    }));

    if (sendTriageMessage.fulfilled.match(result)) {
      const updated = result.payload.updatedSession?.messages;
      const aiResponse = result.payload.response;

      const aiMsg = aiResponse
        ? {
            type: 'ai',
            content: aiResponse,
            timestamp: new Date().toISOString()
          }
        : null;

     const messagesToAppend = [];

if (updated && Array.isArray(updated)) {
  messagesToAppend.push(...updated);
}

if (result.payload.response) {
  messagesToAppend.push({
    type: 'ai',
    content: result.payload.response,
    timestamp: new Date().toISOString()
  });
}

if (messagesToAppend.length > 0) {
  setLocalMessages((prev) => [...prev, ...messagesToAppend]);
}

    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'emergency': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !triageSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link to="/patient" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Triage</h1>
                <p className="text-sm text-gray-500">Get instant symptom assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(localMessages.length > 0
                  ? localMessages
                  : [{
                      type: 'ai',
                      content: "Hello! I'm here to help assess your symptoms. What symptoms are you experiencing today?"
                    }]
                ).map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {msg.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {msg.type === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs">AI Assistant</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your symptoms..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {triageSession?.riskAssessment?.level && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Risk Level</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getRiskLevelColor(triageSession.riskAssessment.level)
                    }`}>
                      {triageSession.riskAssessment.level?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>

                  {triageSession.riskAssessment.recommendations?.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Recommendations</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {triageSession.riskAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 text-xs">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {triageSession.riskAssessment.suggestedTests?.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Suggested Tests</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {triageSession.riskAssessment.suggestedTests.map((test, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 text-xs">•</span>
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {triageSession?.symptoms?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {triageSession.symptoms.map((symptom, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
                  <p className="text-xs text-yellow-700">
                    This AI triage is for informational purposes only and should not replace professional medical advice. 
                    If you have severe symptoms, please consult a healthcare provider immediately.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Further Help?</h3>
  <Link
    to="/patient/appointments"
    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
  >
    Book Appointment with Doctor
  </Link>
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTriage;
