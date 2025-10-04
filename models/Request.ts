import mongoose from 'mongoose';
import { RequestStatus, ActionType } from '../lib/types';

const approvalHistorySchema = new mongoose.Schema({
  action: { type: String, enum: Object.values(ActionType), required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  budgetAvailable: { type: Boolean },
  forwardedMessage: { type: String },
  attachments: [{ type: String }],
  previousStatus: { type: String, enum: Object.values(RequestStatus) },
  newStatus: { type: String, enum: Object.values(RequestStatus) },
  timestamp: { type: Date, default: Date.now },
});

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  purpose: { type: String, required: true },
  college: { type: String, required: true },
  department: { type: String, required: true },
  costEstimate: { type: Number, required: true },
  expenseCategory: { type: String, required: true },
  sopReference: { type: String },
  attachments: [{ type: String }],
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: Object.values(RequestStatus), 
    default: RequestStatus.SUBMITTED 
  },
  history: [approvalHistorySchema],
}, {
  timestamps: true,
});

export default mongoose.models.Request || mongoose.model('Request', requestSchema);