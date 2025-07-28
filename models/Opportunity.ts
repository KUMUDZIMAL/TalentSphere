// /models/Opportunity.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  requirements?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    requirements: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Use existing model if it’s already been compiled (Next.js hot‑reload prevention)
const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);

export default Opportunity;
