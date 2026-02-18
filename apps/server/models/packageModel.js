import mongoose from "mongoose";

const ItineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const InclusionSchema = new mongoose.Schema(
  {
  
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }, 
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);


const PackageSchema = new mongoose.Schema(
  {
   
    country: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["kenya", "tanzania", "zanzibar", "uganda"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: String, 
      default: "",
      trim: true,
    },

    duration: {
      type: String, 
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary thumbnail
    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    
    days: {
      type: [ItineraryDaySchema],
      default: [],
    },

   
    inclusions: {
      type: [InclusionSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

  
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

PackageSchema.index({ country: 1, sortOrder: 1 });
PackageSchema.index({ country: 1, isActive: 1 });


// Total number of days (convenience)
PackageSchema.virtual("dayCount").get(function () {
  return this.days.length;
});

PackageSchema.set("toJSON", { virtuals: true });
PackageSchema.set("toObject", { virtuals: true });


const Package = mongoose.model("Package", PackageSchema);
export default Package;