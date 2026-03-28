import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true }, // e.g. "general", "social", "booking"
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
