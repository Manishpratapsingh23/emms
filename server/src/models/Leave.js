import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { 
    type: String, 
    enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'], 
    required: [true, 'Leave type is required'] 
  },
  startDate: { type: Date, required: [true, 'Start date is required'] },
  endDate: { type: Date, required: [true, 'End date is required'] },
  reason: { type: String, required: [true, 'Reason is required'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  adminRemarks: { type: String, default: '' }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
