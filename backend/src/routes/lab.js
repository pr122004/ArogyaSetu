import { Router} from 'express';
import multer from 'multer';
import path from 'path';
import {
  getLabDashboard,
  uploadReport,
  getLabReports,
  searchPatients
} from '../controllers/labController.js';

import { verifyJWT, authorize } from '../middleware/auth.js';

const router = Router();

// 🔐 Auth middleware
const protectLab = [verifyJWT, authorize(['lab'])];

// 🧾 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);
    cb(null, extValid && mimeValid);
  }
});

// Routes
router.get('/dashboard', protectLab, getLabDashboard);
router.post('/reports/upload', protectLab, upload.single('reportFile'), uploadReport);
router.get('/reports', protectLab, getLabReports);
router.get('/patients/search', protectLab, searchPatients);

export default router;
