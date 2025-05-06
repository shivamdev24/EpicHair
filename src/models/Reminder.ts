import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);
export default Reminder;
