import express from 'express';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import Report from '../models/Report.js';

const router = express.Router();

// Get report file
router.get('/:reportId/file', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has access to this report
    const hasAccess = 
      report.patientId.toString() === req.user._id.toString() ||
      report.labId.toString() === req.user._id.toString() ||
      report.sharedWith.some(share => share.doctorId.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.sendFile(path.resolve(report.filePath));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report file', error: error.message });
  }
});

// Get report details
router.get('/:reportId', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('patientId', 'name age')
      .populate('labId', 'labName')
      .populate('reviewedBy', 'name');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user has access to this report
    const hasAccess = 
      report.patientId._id.toString() === req.user._id.toString() ||
      report.labId._id.toString() === req.user._id.toString() ||
      report.sharedWith.some(share => share.doctorId.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

export default router;