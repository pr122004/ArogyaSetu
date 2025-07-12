import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"       
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"



export const verifyJWT = asyncHandler(async (req, res, next) => {

   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
 
     if(!token){
         throw new ApiError(401, "Unauthorized Request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 

     if(!user){
         
         throw new ApiError(401, "Invalid Access Token") 
     }
 
     req.user = user; 
     next()
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
   }
    
});

// Middleware to restrict access based on user roles
export const authorize = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to access this resource");
    }
    next();
  });
