import mongoose, { Schema, type Model } from 'mongoose';

export interface AdminSessionDocument {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: Date;
  revokedAt: Date | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSessionSchema = new Schema<AdminSessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    tokenHash: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ sessionId: 1, revokedAt: 1 });

export const AdminSessionModel: Model<AdminSessionDocument> =
  (mongoose.models.AdminSession as Model<AdminSessionDocument>) ||
  mongoose.model<AdminSessionDocument>('AdminSession', adminSessionSchema);
