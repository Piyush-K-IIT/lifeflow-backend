import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  // Hospital Reference
  // Agar ObjectId validation fail ho rahi hai, toh ensure karein ki Thunder Client mein valid 24-char ID hai
  hospital: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "hospital field is missing in the request body"] 
  },
  hospitalName: { 
    type: String, 
    required: [true, "Hospital Name is required"] 
  },
  bloodType: { 
    type: String, 
    required: [true, "Blood Type is required"] 
  },
  unitsNeeded: { 
    type: Number, 
    required: [true, "Units count is required"],
    min: [1, "At least 1 unit is needed"]
  },
  urgency: { 
    type: String, 
    enum: ['Normal', 'Urgent', 'Emergency'], 
    default: 'Normal' 
  },
  location: { 
    type: String, 
    required: [true, "Location is required"] 
  },
  status: { 
    type: String, 
    enum: ['Open', 'Accepted', 'Fulfilled', 'Cancelled'], 
    default: 'Open' 
  }
}, { 
  timestamps: true // adds createdAt and updatedAt automatically
});

// Indexing for faster Dashboard loading
bloodRequestSchema.index({ status: 1, createdAt: -1 });

// Export the model
// Note: If model already exists, we use the existing one to avoid OverwriteModelError
const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;