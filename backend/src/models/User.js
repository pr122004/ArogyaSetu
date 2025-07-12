import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: false,
    trim: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'lab'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Patient-specific fields
  age: {
    type: Number,
    required: function () {
      return this.role === 'patient';
    }
  },
  abhaId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.role === 'patient';
    }
  },
  familyContact: {
    type: String,
    required: function () {
      return this.role === 'patient';
    }
  },
  emergencyVault: {
    isActive: { type: Boolean, default: false },
    emergencyContacts: [String],
    trustedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },

  // Doctor-specific fields
  licenseId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.role === 'doctor';
    }
  },
  hospital: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    }
  },
  specialization: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    }
  },

  // Lab-specific fields
  labName: {
    type: String,
    required: function () {
      return this.role === 'lab';
    }
  },
  labId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.role === 'lab';
    }
  },
  address: {
    type: String
  },

  // Common
  password: {
    type: String
    // not required for OTP-based login
  },
  refreshToken: {
    type: String
  }

}, {
  timestamps: true
});

// ==========================
// Password Hash Middleware
// ==========================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ==========================
// Password Comparison
// ==========================
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ==========================
// JWT Access Token
// ==========================
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// ==========================
// JWT Refresh Token
// ==========================
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

 export const User = mongoose.model('User', userSchema);
