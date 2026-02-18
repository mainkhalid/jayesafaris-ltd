import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    // ── Contact info ──────────────────────────────────────────────────────
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, trim: true, lowercase: true },
    phone:             { type: String, trim: true, default: "" },

    // ── Trip details ──────────────────────────────────────────────────────
    destination:       { type: String, trim: true, default: "" },
    travelDate:        { type: String, default: "" },   // kept as string (flexible input)
    numberOfTravelers: { type: Number, default: 1 },
    budget:            { type: String, default: "" },
    subject:           { type: String, trim: true, default: "" },
    message:           { type: String, required: true, trim: true },

    // ── Optional: pre-fill from a specific package page ──────────────────
    packageId:         { type: mongoose.Schema.Types.ObjectId, ref: "Package", default: null },
    packageTitle:      { type: String, default: "" },

    // ── Admin workflow ────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["new", "contacted", "resolved"],
      default: "new",
    },
    adminNotes: { type: String, default: "" },

    // ── Clerk user (optional — if the user was signed in) ─────────────────
    clerkUserId: { type: String, default: null },
  },
  { timestamps: true }   // createdAt, updatedAt
);

// Index for fast admin queries
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;