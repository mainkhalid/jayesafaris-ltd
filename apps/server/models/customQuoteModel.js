import mongoose from "mongoose";

const customQuoteSchema = new mongoose.Schema(
  {
    // ── Contact info ──────────────────────────────────────────────────────
    name:              { type: String, required: true, trim: true },
    email:             { type: String, required: true, trim: true, lowercase: true },
    phone:             { type: String, trim: true, default: "" },
    countryOfResidence: { type: String, trim: true, default: "" },

    // ── Quote details ──────────────────────────────────────────────────────
    destinations:     [{ type: String }],
    travelDate:       { type: String, default: "" },
    duration:         { type: String, default: "" },
    budgetPerPerson:  { type: String, default: "" },
    numberOfTravelers: {
      adults:  { type: Number, default: 1 },
      kids:    { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    travelingWith:    [{ type: String }],
    interests:        [{ type: String }],
    message:          { type: String, trim: true, default: "" },
    source:           { type: String, trim: true, default: "" },

    // ── Admin workflow ────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["new", "contacted", "quoted", "resolved"],
      default: "new",
    },
    adminNotes: { type: String, default: "" },

    // ── Clerk user (optional) ─────────────────────────────────────────────
    clerkUserId: { type: String, default: null },
  },
  { timestamps: true }
);

customQuoteSchema.index({ status: 1, createdAt: -1 });
customQuoteSchema.index({ email: 1 });

const CustomQuote = mongoose.model("CustomQuote", customQuoteSchema);
export default CustomQuote;
