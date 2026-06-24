
import mongoose from 'mongoose';
const requestSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterName: String,
  requesterPhone: String,
  bloodGroupNeeded: String,
  message: String,
  // ADD THIS LINE IF IT'S MISSING
  status: { type: String, default: 'Pending' }, 
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);