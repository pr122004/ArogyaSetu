import mongoose, { Schema } from 'mongoose';

const triageSessionSchema = new Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  messages: [{
    type: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // ✅ Ensure symptoms always starts as an array
  symptoms: {
    type: [String],
    default: []
  },

  // ✅ Ensure riskAssessment is initialized even if not provided
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: undefined
    },
    recommendations: {
      type: [String],
      default: []
    },
    suggestedTests: {
      type: [String],
      default: []
    }
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

export default mongoose.model('TriageSession', triageSessionSchema);
