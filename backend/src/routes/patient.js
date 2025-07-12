import { Router} from 'express';
import {
  getPatientDashboard,
  getPatientReports,
  startTriageSession,
  sendTriageMessage,
  shareReportWithDoctor
} from '../controllers/patientController.js';

import {  authorize, verifyJWT } from '../middleware/auth.js';

const router = Router();

const protectPatient = [verifyJWT, authorize(['patient'])];

router.get('/dashboard', protectPatient, getPatientDashboard);
router.get('/reports', protectPatient, getPatientReports);
router.post('/triage/start', protectPatient, startTriageSession);
router.post('/triage/message', protectPatient, sendTriageMessage);
router.post('/reports/:reportId/share', protectPatient, shareReportWithDoctor);

export default router;
