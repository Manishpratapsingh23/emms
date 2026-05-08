import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date, default: null },
  clockOut: { type: Date, default: null },
  totalHours: { type: Number, default: 0 },
  status: { type: String, enum: ['present', 'absent', 'half-day', 'late'], default: 'present' }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
