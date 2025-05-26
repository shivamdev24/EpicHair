import mongoose, { Schema, Document } from "mongoose";

export interface WorkingHours {
  start: string; // e.g. "10:00"
  end: string; // e.g. "18:00"
}
export interface AvailableHours {
  start: string; // e.g. "10:00"
  end: string; // e.g. "18:00"
}
export interface CustomAvailableHours {
  date: string; // e.g. "2023-10-01"
  start: string; // e.g. "10:00"
  end: string; // e.g. "18:00"
}

// Define the User interface
export interface User extends Document {
  phoneNumber: string;
  email: string;
  username?: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isTemp: boolean;
  role: "user" | "staff" | "admin";
  workingHours: WorkingHours;
  // AvailableHours: AvailableHours;
  customAvailableHours: CustomAvailableHours[];
  isOnHoliday: boolean;
  password?: string;
  feedback?: string;
  rating?: number;
  services?: string[];
  image_url?: string;
  public_id?: string;
}

const WorkingHoursSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);
// const AvailableHoursSchema = new Schema(
//   {
//     start: { type: String, required: true },
//     end: { type: String, required: true },
//   },
//   { _id: false }
// );
const CustomAvailableHoursSchema = new Schema(
  {
    date: { type: String, required: true }, // e.g. "2023-10-01"
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

// Define the user schema
const UserSchema: Schema<User> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
    },

    email: { type: String, unique: true, sparse: true }, // Make email sparse
    phoneNumber: {
      type: String,
      required: true,
      trim: true, // Automatically trim whitespace
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isTemp: {
      type: Boolean,
      default: false,
    },
    isOnHoliday: {
      type: Boolean,
      default: false,
    },
    workingHours: {
      type: WorkingHoursSchema,
      required: function (this: User) {
        return this.role === "staff"; // Only needed for barbers/staff
      },
    },
    // AvailableHours: {
    //   type: AvailableHoursSchema,
    //   required: function (this: User) {
    //     return this.role === "staff"; // Only needed for barbers/staff
    //   },
    // },
    customAvailableHours: {
      type: [CustomAvailableHoursSchema],
     default: [], // Default to an empty array
    },
    
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      required: true,
    },
    password: {
      type: String,
      required: false,
      // required: function (this: User) {
      //   return this.role === "admin";
      // },
    },
    feedback: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    services: {
      type: [String], // Array of strings for services
      required: false, // Not required
    },
    image_url: { type: String, required: false }, // Define imageUrl field
    public_id: { type: String, required: false }, // Define imageUrl field
    // skills: {
    //   type: [String], // Array of strings for skills
    //   required: false, // Not required
    // },
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default User;
