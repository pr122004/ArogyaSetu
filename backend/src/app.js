import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb", extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctor.js';
import labRoutes from './routes/lab.js';
import patientRoutes from './routes/patient.js';


app.use("/api/auth", authRoutes);  
app.use("/api/doctor", doctorRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/patient", patientRoutes);



export { app }

