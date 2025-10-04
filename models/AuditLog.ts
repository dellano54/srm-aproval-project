import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ requestId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);