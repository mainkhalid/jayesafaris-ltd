import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // ── Contact info ──────────────────────────────────────────────────────
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },

    // ── Trip details ──────────────────────────────────────────────────────
    packageId:    { type: mongoose.Schema.Types.ObjectId, ref: "Package",       required: true },
    departureId:  { type: mongoose.Schema.Types.ObjectId, ref: "TourDeparture", required: true },
    packageTitle: { type: String, required: true },

    numberOfTravelers: {
      adults:  { type: Number, default: 1, min: 0 },
      kids:    { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    message: { type: String, trim: true, default: "" },

    // ── Admin workflow ────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },

    // ── Clerk user (optional — if the user was signed in) ─────────────────
    clerkUserId: { type: String, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ departureId: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;