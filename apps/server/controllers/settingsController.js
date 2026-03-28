import Settings from "../models/settingsModel.js";

const getSettings = async (key, defaults = {}) => {
  const doc = await Settings.findOne({ key }).lean();
  return { ...defaults, ...(doc?.value || {}) };
};

const saveSettings = async (key, value) => {
  await Settings.findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true, new: true }
  );
};

// ── General ───────────────────────────────────────────────────────────────────
export const getGeneral = async (req, res) => {
  try {
    const data = await getSettings("general", {
      companyName: "Jaye Safaris",
      tagline: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      logoUrl: "",
      logoPublicId: "",
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveGeneral = async (req, res) => {
  try {
    await saveSettings("general", req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Social ────────────────────────────────────────────────────────────────────
export const getSocial = async (req, res) => {
  try {
    const data = await getSettings("social", {
      facebook: "", instagram: "", twitter: "", youtube: "", tiktok: "", tripadvisor: "",
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveSocial = async (req, res) => {
  try {
    await saveSettings("social", req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Booking ───────────────────────────────────────────────────────────────────
export const getBookingSettings = async (req, res) => {
  try {
    const data = await getSettings("booking", {
      depositPercent: 30,
      fullPaymentDays: 14,
      cancellationDays: 30,
      autoConfirm: false,
      notifyOnInquiry: true,
      notifyOnBooking: true,
      currency: "USD",
      timezone: "Africa/Nairobi",
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveBookingSettings = async (req, res) => {
  try {
    await saveSettings("booking", req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
