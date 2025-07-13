import { Router } from 'express';
import {
  getDoctorDashboard,
  getDoctorReports,
  addReportFeedback,
  getPatientsWithSharedReports,
  addPatientByAbha
} from '../controllers/doctorController.js';
import { verifyJWT, authorize } from '../middleware/auth.js';
import { shareReportWithDoctor } from '../controllers/patientController.js';

const router = Router();

// Middleware: Only allow doctors
router.use(verifyJWT, authorize(['doctor']));

// Dashboard route
router.get('/dashboard', getDoctorDashboard);

// Patient-related
router.get('/patients', getPatientsWithSharedReports);

// Report-related
router.get('/reports', getDoctorReports);
router.post('/reports/feedback',addReportFeedback);
router.post('/patients', addPatientByAbha); 
router.post('/share', verifyJWT, authorize(['patient']), shareReportWithDoctor);

export default router;
