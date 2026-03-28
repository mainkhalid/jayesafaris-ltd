import mongoose from "mongoose";
import CustomQuote from "../models/customQuoteModel.js";

export const createCustomQuote = async (req, res) => {
  try {
    const {
      name, email, phone,
      countryOfResidence,
      destinations, travelDate, duration,
      budgetPerPerson,
      numberOfTravelers,
      travelingWith, interests,
      message, source,
      clerkUserId,
    } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "name and email are required.",
      });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const quote = await CustomQuote.create({
      name:               name.trim(),
      email:              email.trim().toLowerCase(),
      phone:              phone?.trim()              || "",
      countryOfResidence: countryOfResidence?.trim() || "",
      destinations:       Array.isArray(destinations) ? destinations : [],
      travelDate:         travelDate  || "",
      duration:           duration    || "",
      budgetPerPerson:    budgetPerPerson || "",
      numberOfTravelers: {
        adults:  numberOfTravelers?.adults  ?? 1,
        kids:    numberOfTravelers?.kids    ?? 0,
        infants: numberOfTravelers?.infants ?? 0,
      },
      travelingWith: Array.isArray(travelingWith) ? travelingWith : [],
      interests:     Array.isArray(interests)     ? interests     : [],
      message:       message?.trim() || "",
      source:        source?.trim()  || "",
      clerkUserId:   clerkUserId     || null,
    });

    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    console.error("[createCustomQuote]", err);
    res.status(500).json({ success: false, message: "Failed to submit quote request." });
  }
};

export const getCustomQuotes = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, userId } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (userId) filter.clerkUserId = userId;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await CustomQuote.countDocuments(filter);

    const quotes = await CustomQuote.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: quotes,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("[getCustomQuotes]", err);
    res.status(500).json({ success: false, message: "Failed to fetch quotes." });
  }
};


export const getCustomQuoteById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid quote ID." });
    }

    const quote = await CustomQuote.findById(req.params.id).lean();
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    res.status(200).json({ success: true, data: quote });
  } catch (err) {
    console.error("[getCustomQuoteById]", err);
    res.status(500).json({ success: false, message: "Failed to fetch quote." });
  }
};

export const updateCustomQuote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid quote ID." });
    }

    const { status, adminNotes } = req.body;
    const quote = await CustomQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    const ALLOWED_STATUSES = ["new", "contacted", "quoted", "resolved"];
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
      }
      quote.status = status;
    }
    if (adminNotes !== undefined) quote.adminNotes = adminNotes;

    await quote.save();
    res.status(200).json({ success: true, data: quote });
  } catch (err) {
    console.error("[updateCustomQuote]", err);
    res.status(500).json({ success: false, message: "Failed to update quote." });
  }
};
export const deleteCustomQuote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid quote ID." });
    }

    const quote = await CustomQuote.findByIdAndDelete(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found." });
    }

    res.status(200).json({ success: true, message: "Quote deleted." });
  } catch (err) {
    console.error("[deleteCustomQuote]", err);
    res.status(500).json({ success: false, message: "Failed to delete quote." });
  }
};

// ─── Stats ────────────────────────────────────────────────────────────────────
export const getCustomQuoteStats = async (req, res) => {
  try {
    const [total, newCount, contacted, quoted, resolved] = await Promise.all([
      CustomQuote.countDocuments(),
      CustomQuote.countDocuments({ status: "new" }),
      CustomQuote.countDocuments({ status: "contacted" }),
      CustomQuote.countDocuments({ status: "quoted" }),
      CustomQuote.countDocuments({ status: "resolved" }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, new: newCount, contacted, quoted, resolved },
    });
  } catch (err) {
    console.error("[getCustomQuoteStats]", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};