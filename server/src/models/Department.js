import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
  description: { type: String, default: '' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

departmentSchema.virtual('employeeCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
