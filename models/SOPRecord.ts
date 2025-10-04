import mongoose from 'mongoose';

const sopRecordSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  college: { type: String, required: true },
  department: { type: String },
  requiresBudgetCheck: { type: Boolean, default: true },
  minimumAmount: { type: Number },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.SOPRecord || mongoose.model('SOPRecord', sopRecordSchema);