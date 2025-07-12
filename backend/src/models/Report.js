import mongoose, { Schema } from 'mongoose';

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['blood_test', 'urine_test', 'x_ray', 'ct_scan', 'mri', 'ultrasound', 'other']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'pending', 'delivered', 'reviewed'],
    default: 'uploaded'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorFeedback: String,
  sharedWith: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedAt: { type: Date, default: Date.now },
    accessLevel: { type: String, enum: ['view', 'comment'], default: 'view' }
  }],
  aiAnalysis: {
    summary: String,
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    recommendations: [String]
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);