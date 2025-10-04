import mongoose from 'mongoose';

const budgetRecordSchema = new mongoose.Schema({
  college: { type: String, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  allocated: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  available: { type: Number, required: true },
  fiscalYear: { type: String, required: true },
}, {
  timestamps: true,
});

budgetRecordSchema.index({ college: 1, department: 1, category: 1, fiscalYear: 1 });

export default mongoose.models.BudgetRecord || mongoose.model('BudgetRecord', budgetRecordSchema);