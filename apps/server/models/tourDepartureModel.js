import mongoose from "mongoose";

const tourDepartureSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    packageTitle: { type: String, required: true, trim: true },
    country: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["kenya", "tanzania", "zanzibar", "uganda"],
    },

    // ── Dates ──────────────────────────────────────────────────────────────
    departureDate: { type: Date, required: true },
    endDate:       { type: Date, required: true },

    // ── Slots ──────────────────────────────────────────────────────────────
    totalSlots:  { type: Number, required: true, min: 1 },
    bookedSlots: { type: Number, default: 0, min: 0 },

    // ── Optional price override (e.g. peak season surcharge) ──────────────
    priceOverride: { type: String, default: "" },

    // ── Status ─────────────────────────────────────────────────────────────
    // "open"      → accepting bookings
    // "full"      → auto-set when bookedSlots >= totalSlots
    // "closed"    → admin manually closed (e.g. guide unavailable)
    // "cancelled" → trip cancelled entirely
    // "completed" → tour has already run
    status: {
      type: String,
      enum: ["open", "full", "closed", "cancelled", "completed"],
      default: "open",
    },

    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
tourDepartureSchema.virtual("availableSlots").get(function () {
  return Math.max(0, this.totalSlots - this.bookedSlots);
});

tourDepartureSchema.virtual("isFull").get(function () {
  return this.bookedSlots >= this.totalSlots;
});

// ── Auto-flip status to "full" when slots are exhausted ───────────────────────
tourDepartureSchema.pre("save", function (next) {
  if (this.bookedSlots >= this.totalSlots && this.status === "open") {
    this.status = "full";
  }
  // Re-open if admin increases totalSlots above bookedSlots
  if (this.bookedSlots < this.totalSlots && this.status === "full") {
    this.status = "open";
  }
});

// ── Indexes ───────────────────────────────────────────────────────────────────
tourDepartureSchema.index({ packageId: 1, departureDate: 1 });
tourDepartureSchema.index({ status: 1, departureDate: 1 });
tourDepartureSchema.index({ country: 1, departureDate: 1 });

tourDepartureSchema.set("toJSON", { virtuals: true });
tourDepartureSchema.set("toObject", { virtuals: true });

const TourDeparture = mongoose.model("TourDeparture", tourDepartureSchema);
export default TourDeparture;