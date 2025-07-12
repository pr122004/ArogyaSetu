import Report from '../models/Report.js';
import { User } from '../models/User.js'

// GET /doctor/dashboard
export const getDoctorDashboard = async (req, res) => {
  try {
    const sharedReports = await Report.find({
      'sharedWith.doctorId': req.user._id
    })
      .populate('patientId', 'name age')
      .populate('labId', 'labName')
      .sort({ createdAt: -1 });

    const pendingReviews = sharedReports.filter(report => report.status !== 'reviewed');

    res.json({
      sharedReports,
      pendingReviews,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// GET /doctor/reports
export const getDoctorReports = async (req, res) => {
  try {
    const reports = await Report.find({
      'sharedWith.doctorId': req.user._id
    })
      .populate('patientId', 'name age phone')
      .populate('labId', 'labName')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// POST /doctor/reports/:reportId/feedback
export const addReportFeedback = async (req, res) => {
  try {
    const { reportId, feedback } = req.body;

    const report = await Report.findOne({
      _id: reportId,
      'sharedWith.doctorId': req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found or not shared with you' });
    }

    report.doctorFeedback = feedback;
    report.reviewedBy = req.user._id;
    report.status = 'reviewed';

    await report.save();
    res.json({ message: 'Feedback added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding feedback', error: error.message });
  }
};

// POST /doctor/patients
export const addPatientByAbha = async (req, res) => {
  try {
    const { abhaId } = req.body;

    if (!abhaId) {
      return res.status(400).json({ message: 'ABHA ID is required' });
    }

    const patient = await User.findOne({ abhaId, role: 'patient' });

    if (!patient) {
      return res.status(404).json({ message: 'No patient found with this ABHA ID' });
    }

    // Check if the doctor already has any reports shared with this patient
    const existingReports = await Report.find({
      patientId: patient._id,
      'sharedWith.doctorId': req.user._id
    });

    if (existingReports.length > 0) {
      return res.status(409).json({ message: 'Patient already added or shared a report' });
    }

    // Create a dummy report (minimally valid) to establish patient-doctor connection
    const dummyReport = new Report({
      patientId: patient._id,
      labId: req.user._id, // assuming doctor acts as dummy lab
      reportType: 'other',
      title: 'Placeholder Report',
      description: 'This is a placeholder report to link patient and doctor.',
      filePath: '/dummy/path/report.pdf',
      fileType: 'application/pdf',
      status: 'pending',
      sharedWith: [{
        doctorId: req.user._id,
        accessLevel: 'view'
      }]
    });

    await dummyReport.save();

    res.status(201).json({ message: 'Patient added successfully and linked via placeholder report' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding patient', error: error.message });
  }
};

// GET /doctor/patients
export const getPatientsWithSharedReports = async (req, res) => {
  try {
    const reports = await Report.find({
      'sharedWith.doctorId': req.user._id
    }).populate('patientId', 'name age phone abhaId');

    const patientsMap = new Map();
    reports.forEach(report => {
      const patient = report.patientId;
      if (!patientsMap.has(patient._id.toString())) {
        patientsMap.set(patient._id.toString(), {
          ...patient.toObject(),
          reportCount: 1,
          lastReportDate: report.createdAt
        });
      } else {
        const existing = patientsMap.get(patient._id.toString());
        existing.reportCount++;
        if (report.createdAt > existing.lastReportDate) {
          existing.lastReportDate = report.createdAt;
        }
      }
    });

    const patients = Array.from(patientsMap.values());
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};
