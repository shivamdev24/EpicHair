import mongoose, { Document, Schema } from "mongoose";

// Define the Offer interface
interface IOffer extends Document {
  title: string;
  description?: string;
  discountPercentage: number; // e.g., 20 for 20% off
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  offerImageUrl?: string;
  public_id?: string;
}

// Create the Offer schema
const OfferSchema: Schema<IOffer> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    offerImageUrl: {
      type: String,
      required: false,
    },
    public_id: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Create and export the Offer model
const Offer =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);

export default Offer;
