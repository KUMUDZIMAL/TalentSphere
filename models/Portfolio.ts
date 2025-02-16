import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioElement {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User model
  elements: IPortfolioElement[];
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioElementSchema: Schema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['image', 'text'], required: true },
  content: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const PortfolioSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    elements: { type: [PortfolioElementSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
