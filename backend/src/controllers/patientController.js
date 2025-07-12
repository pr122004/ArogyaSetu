import Report from '../models/Report.js';
import TriageSession from '../models/TriageSession.js';
import { User } from '../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // use from .env
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to call Gemini with chat history
const generateGeminiResponse = async (userMessage, history) => {
  const chatContext = history
    .map(msg => `${msg.type === 'user' ? 'Patient' : 'AI'}: ${msg.content}`)
    .join('\n');

  const prompt = `
You are an intelligent and empathetic AI medical assistant engaged in a triage session. Here is the current chat history:

${chatContext}
Patient: ${userMessage}

Now, based on this conversation:
1. Identify any new or updated symptoms.
2. Assess the risk level of the patient's condition (low, medium, high, emergency).
3. Ask one follow-up question if more clarity is needed.
4. Return a JSON object in this format:
{
  response: "Ask a question or give a brief suggestion here.",
  symptoms: ["string"],
  riskAssessment: {
    level: "low" | "medium" | "high" | "emergency",
    recommendations: ["string"],
    suggestedTests: ["string"]
  }
}
`;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  console.log('AI Response:', text);

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response format invalid');
  return JSON.parse(match[0]);
};

// ========================
// GET: Dashboard
// ========================
export const getPatientDashboard = async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate('labId', 'labName')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    const recentTriageSession = await TriageSession.findOne({
      patientId: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ reports, recentTriageSession, user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// ========================
// GET: Patient Reports
// ========================
export const getPatientReports = async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate('labId', 'labName')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// ========================
// POST: Start Triage Session
// ========================
export const startTriageSession = async (req, res) => {
  try {
    await TriageSession.updateMany(
      { patientId: req.user._id, isActive: true },
      { isActive: false }
    );

    const session = new TriageSession({
      patientId: req.user._id,
      messages: [
        {
          type: 'ai',
          content: "Hello! I'm here to help assess your symptoms. What symptoms are you experiencing today?"
        }
      ]
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error starting triage session', error: error.message });
  }
};

// ========================
// POST: Continue Triage Session
// ========================
export const sendTriageMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    const session = await TriageSession.findOne({
      _id: sessionId,
      patientId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'Active triage session not found' });
    }

    // Append user message
    session.messages.push({ type: 'user', content: message });

    // Generate AI response with chat context
    const aiResponse = await generateGeminiResponse(message, session.messages);

    // Append AI response
    session.messages.push({ type: 'ai', content: aiResponse.response });

    if (aiResponse.symptoms?.length) {
  session.symptoms = session.symptoms || [];
  session.symptoms.push(...aiResponse.symptoms);
}

if (aiResponse.riskAssessment) {
  session.riskAssessment = session.riskAssessment || {};
  session.riskAssessment.level = aiResponse.riskAssessment.level;
  session.riskAssessment.recommendations = aiResponse.riskAssessment.recommendations || [];
  session.riskAssessment.suggestedTests = aiResponse.riskAssessment.suggestedTests || [];
}


    await session.save();
    res.json(session);
  } catch (error) {
    console.error('AI Triage Error:', error);
    res.status(500).json({ message: 'Error processing triage message', error: error.message });
  }
};

// ========================
// POST: Share Report with Doctor
// ========================
export const shareReportWithDoctor = async (req, res) => {
  try {
    const { doctorId, accessLevel = 'view' } = req.body;

    const report = await Report.findOne({
      _id: req.params.reportId,
      patientId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingShare = report.sharedWith.find(
      share => share.doctorId.toString() === doctorId
    );

    if (existingShare) {
      existingShare.accessLevel = accessLevel;
    } else {
      report.sharedWith.push({ doctorId, accessLevel });
    }

    await report.save();
    res.json({ message: 'Report shared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing report', error: error.message });
  }
};
