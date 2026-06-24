import express from 'express';
import Request from '../models/request.js';
import Notification from '../models/Notification.js';
import BloodRequest from '../models/BloodRequest.js'; 

const router = express.Router();

// Middleware: Har request ko terminal mein log karega debug ke liye
router.use((req, res, next) => {
  console.log(`📡 Request Router Hit: ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. ANALYTICS / STATS ROUTES
// ==========================================

router.get('/stats/demand', async (req, res) => {
  try {
    const stats = await BloodRequest.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$bloodType", "$bloodGroup"] }, 
          totalUnits: { $sum: "$unitsNeeded" },
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { totalUnits: -1 } }
    ]);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. HOSPITAL ROUTES (Emergency Network)
// ==========================================

// Create Hospital Request (Tested with Thunder Client)
router.post('/hospital/create', async (req, res) => {
  try {
    console.log("📥 Raw Payload:", req.body);

    // Force-extracting the ID to satisfy Mongoose 'required' validation
    const hospitalIdValue = req.body.hospital || req.body.hospitalId;

    if (!hospitalIdValue) {
      console.log("❌ Error: hospitalId is missing in request");
      return res.status(400).json({ 
        success: false, 
        message: "Hospital ID (hospital) is required in JSON body" 
      });
    }

    const newHospitalReq = new BloodRequest({
      hospital: hospitalIdValue, // This maps to the schema field
      hospitalName: req.body.hospitalName,
      bloodType: req.body.bloodType,
      unitsNeeded: Number(req.body.unitsNeeded) || 1,
      urgency: req.body.urgency || 'Normal',
      location: req.body.location,
      status: 'Open'
    });

    const saved = await newHospitalReq.save();
    console.log("✅ Successfully saved to MongoDB!");
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("❌ Validation/Save Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all open hospital requests for Dashboard Feed
router.get('/hospital/all', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'Open' })
      .populate('hospital', 'name location')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. INDIVIDUAL & MY-REQUESTS ROUTES
// ==========================================

router.post('/send', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();

    const notification = new Notification({
      recipient: req.body.donorId,
      senderName: req.body.requesterName,
      message: `${req.body.requesterName} has requested ${req.body.bloodGroupNeeded || req.body.bloodGroup} blood.`
    });
    await notification.save();

    res.status(201).json({ success: true, message: "Request sent!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Request.find({ 
      $or: [{ donorId: userId }, { requester: userId }] 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. THE HERO MOMENT (Accept/Status Update)
// ==========================================

router.patch('/status/:type/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { type, id } = req.params;
    const Model = type === 'hospital' ? BloodRequest : Request;
    
    console.log(`⚡ Updating ${type} request ${id} to status: ${status}`);

    const updated = await Model.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true } 
    );
    
    if (!updated) return res.status(404).json({ success: false, message: "Request not found" });
    
    res.status(200).json({ success: true, updated });
  } catch (error) {
    console.error("❌ Patch Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;