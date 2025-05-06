import mongoose, { Document,  Schema } from "mongoose";

// Define the Service interface
interface IService extends Document {
  name: string;
  description?: string;
  price: number; // Price field
  duration: number; // Duration field in minutes
  service_url: string;
  public_id: string;
}

// Create the Service schema
const ServiceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: true, // This field is required
    },
    description: {
      type: String,
      required: false, // Optional field
    },
    service_url: {
      type: String,
      required: false, // Optional field
    },
    public_id: {
      type: String,
      required: false, // Optional field
    },
    price: {
      type: Number,
      required: true, // This field is optional, you can change it if needed
      min: 0, // Ensure price is not negative
    },
    duration: {
      type: Number,
      required: true, // This field is optional, you can change it if needed
      min: 0, // Ensure duration is not negative
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create the Service model
// const Service:  =
//   (mongoose.models.Service as mongoose.Model<IService>) ||
//   mongoose.model<IService>("Service", ServiceSchema);

const Service = 
 mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);


export default Service;
