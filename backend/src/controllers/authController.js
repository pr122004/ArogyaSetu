import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ==============================
// Register Controller
// ==============================
const register = async (req, res) => {
  try {
    const {
      name, phone, age, abhaId,
      role, licenseId, labId, labName,
      specialization, familyContact, hospital, password
    } = req.body;

    if (!name || !phone || !role || !password) {
      throw new ApiError(400, "All fields are required");
    }

    let identifierField, identifierValue;

    if (role === "patient") {
      if (!abhaId || !age || !familyContact) {
        throw new ApiError(400, "ABHA ID, age, and family contact are required for patients");
      }
      identifierField = "abhaId";
      identifierValue = abhaId;
    } else if (role === "doctor") {
      if (!licenseId || !specialization || !hospital) {
        throw new ApiError(400, "License ID, Hospital and Specialization are required for doctors");
      }
      identifierField = "licenseId";
      identifierValue = licenseId;
    } else if (role === "lab") {
      if (!labId || !labName) {
        throw new ApiError(400, "Lab ID  and labName is required for labs");
      }
      identifierField = "labId";
      identifierValue = labId;
    } else {
      throw new ApiError(400, "Invalid role");
    }

    // Check uniqueness
    const existingUser = await User.findOne({ [identifierField]: identifierValue });
    if (existingUser) {
      throw new ApiError(409, `${role} already registered`);
    }

    // Create new user
    const user = await User.create({
      name,
      phone,
      age,
      role,
      abhaId,
      licenseId,
      labId,
      labName,
      specialization,
      hospital,
      familyContact,
      password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering");
    }

    return res.status(201).json(
      new ApiResponse(201, createdUser, "User registered successfully")
    );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// ==============================
// Login Controller
// ==============================
const login = asyncHandler(async (req, res) => {
  const { abhaId, licenseId, labId, role, password } = req.body;

  if (!role) throw new ApiError(400, "Role is required");
  if (!password) throw new ApiError(400, "Password is required");

  let user;
  if (role === "patient") {
    if (!abhaId) throw new ApiError(400, "ABHA ID required");
    user = await User.findOne({ abhaId, role });
  } else if (role === "doctor") {
    if (!licenseId) throw new ApiError(400, "License ID required");
    user = await User.findOne({ licenseId, role });
  } else if (role === "lab") {
    if (!labId) throw new ApiError(400, "Lab ID required");
    user = await User.findOne({ labId, role });
  } else {
    throw new ApiError(400, "Invalid role");
  }

  if (!user) throw new ApiError(404, `${role} not found`);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken
    }, `${role} logged in successfully`));
});

// ==============================
// Get Me
// ==============================
const getMe = asyncHandler(async (req, res) => {
  const User = req.user;
  if (!User) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user: User }, "User data fetched successfully"));
});

// ==============================
// Logout
// ==============================
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

// ==============================
// Refresh Access Token
// ==============================
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {
        accessToken,
        refreshToken: newRefreshToken
      }, "Access Token Refreshed"));

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
};
