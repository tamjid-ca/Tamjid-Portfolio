import mongoose, { Schema, type Model } from 'mongoose';

export interface AdminUserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: 'admin';
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<AdminUserDocument>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      required: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      required: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const AdminUserModel: Model<AdminUserDocument> =
  (mongoose.models.AdminUser as Model<AdminUserDocument>) ||
  mongoose.model<AdminUserDocument>('AdminUser', adminUserSchema);
