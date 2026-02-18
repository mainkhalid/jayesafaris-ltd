import Inquiry from "../models/inquiryModel.js";

// ─── Public: Submit inquiry (Contact page / PackageDetailPage) ────────────────
export const createInquiry = async (req, res) => {
  try {
    const {
      name, email, phone,
      destination, travelDate, numberOfTravelers, budget,
      subject, message,
      packageId, packageTitle,
      clerkUserId,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "name, email, and message are required",
      });
    }

    const inquiry = await Inquiry.create({
      name, email, phone,
      destination, travelDate,
      numberOfTravelers: numberOfTravelers ? Number(numberOfTravelers) : 1,
      budget, subject, message,
      packageId:    packageId    || null,
      packageTitle: packageTitle || "",
      clerkUserId:  clerkUserId  || null,
    });

    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    console.error("[createInquiry]", err);
    res.status(500).json({ success: false, message: "Failed to submit inquiry" });
  }
};

// ─── Admin: Get all inquiries (with optional status filter + pagination) ───────
export const getInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Inquiry.countDocuments(filter);

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("[getInquiries]", err);
    res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
};

// ─── Admin: Get single inquiry ────────────────────────────────────────────────
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("packageId", "title country thumbnail")
      .lean();

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    console.error("[getInquiryById]", err);
    res.status(500).json({ success: false, message: "Failed to fetch inquiry" });
  }
};

// ─── Admin: Update status + optional notes ────────────────────────────────────
export const updateInquiry = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (status     !== undefined) inquiry.status     = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    await inquiry.save();
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    console.error("[updateInquiry]", err);
    res.status(500).json({ success: false, message: "Failed to update inquiry" });
  }
};

// ─── Admin: Delete inquiry ────────────────────────────────────────────────────
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    await inquiry.deleteOne();
    res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    console.error("[deleteInquiry]", err);
    res.status(500).json({ success: false, message: "Failed to delete inquiry" });
  }
};

// ─── Admin: Summary counts (for dashboard stats) ──────────────────────────────
export const getInquiryStats = async (req, res) => {
  try {
    const [total, newCount, contacted, resolved] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.countDocuments({ status: "contacted" }),
      Inquiry.countDocuments({ status: "resolved" }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, new: newCount, contacted, resolved },
    });
  } catch (err) {
    console.error("[getInquiryStats]", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};