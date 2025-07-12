import path from 'path';
import Report from '../models/Report.js';
import { User } from '../models/User.js';

// GET /lab/dashboard
export const getLabDashboard = async (req, res) => {
  try {
    const reports = await Report.find({ labId: req.user._id })
      .populate('patientId', 'name phone abhaId')
      .sort({ createdAt: -1 });

    const stats = {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      deliveredReports: reports.filter(r => r.status === 'delivered').length,
      reviewedReports: reports.filter(r => r.status === 'reviewed').length
    };

    res.json({ reports, stats, user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// POST /lab/reports/upload
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { patientId, reportType, title, description } = req.body;

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const report = new Report({
      patientId,
      labId: req.user._id,
      reportType,
      title,
      description,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      status: 'delivered'
    });

    await report.save();
    res.status(201).json({ message: 'Report uploaded successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading report', error: error.message });
  }
};

// GET /lab/reports
export const getLabReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { labId: req.user._id };

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reports = await Report.find(query)
      .populate('patientId', 'name phone abhaId')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// GET /lab/patients/search
export const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const patients = await User.find({
      role: 'patient',
      $or: [
        { abhaId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }).select('name phone abhaId age');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error searching patients', error: error.message });
  }
};
