import mongoose, { Schema, type Model } from 'mongoose';

export interface SkillDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  name: string;
  category: string;
  percentageValue: number;
  percentageLabel: string;
  iconName?: string;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<SkillDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: 'General' },
    percentageValue: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    percentageLabel: { type: String, required: true, trim: true },
    iconName: { type: String, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

skillSchema.index({ visible: 1, displayOrder: 1 });

export const SkillModel: Model<SkillDocument> =
  (mongoose.models.Skill as Model<SkillDocument>) ||
  mongoose.model<SkillDocument>('Skill', skillSchema);
