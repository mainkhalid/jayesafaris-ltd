import TourDeparture from "../models/tourDepartureModel.js";
import Booking from "../models/bookingModel.js";
import mongoose from "mongoose";

export const getDeparturesByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const departures = await TourDeparture.find({
      packageId,
      status: { $in: ["open", "full"] },
      departureDate: { $gte: new Date() },
    })
      .sort({ departureDate: 1 })
      .lean();

    res.status(200).json({ success: true, data: departures });
  } catch (err) {
    console.error("[getDeparturesByPackage]", err);
    res.status(500).json({ success: false, message: "Failed to fetch departures" });
  }
};
export const getDepartureById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid departure ID" 
      });
    }

    const dep = await TourDeparture.findById(id)
      .populate("packageId", "title country thumbnail price duration")
      .lean();

    if (!dep) {
      return res.status(404).json({ success: false, message: "Departure not found" });
    }

    res.status(200).json({ success: true, data: dep });
  } catch (err) {
    console.error("[getDepartureById]", err);
    res.status(500).json({ success: false, message: "Failed to fetch departure" });
  }
};

// ─── Admin: get ALL departures (with optional filters + pagination) ────────────
export const getDepartures = async (req, res) => {
  try {
    const { status, country, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (country && country !== "all") filter.country = country.toLowerCase();

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await TourDeparture.countDocuments(filter);

    const departures = await TourDeparture.find(filter)
      .populate("packageId", "title thumbnail")
      .sort({ departureDate: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: departures,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("[getDepartures]", err);
    res.status(500).json({ success: false, message: "Failed to fetch departures" });
  }
};

export const createDeparture = async (req, res) => {
  try {
    const {
      packageId, packageTitle, country,
      departureDate, endDate,
      totalSlots, priceOverride, adminNotes,
    } = req.body;

    if (!packageId || !packageTitle || !country || !departureDate || !endDate || !totalSlots) {
      return res.status(400).json({
        success: false,
        message: "packageId, packageTitle, country, departureDate, endDate, and totalSlots are required",
      });
    }

    if (new Date(departureDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "endDate must be after departureDate",
      });
    }

    const departure = await TourDeparture.create({
      packageId,
      packageTitle,
      country: country.toLowerCase(),
      departureDate: new Date(departureDate),
      endDate: new Date(endDate),
      totalSlots: Number(totalSlots),
      priceOverride: priceOverride || "",
      adminNotes: adminNotes || "",
    });

    res.status(201).json({ success: true, data: departure });
  } catch (err) {
    console.error("[createDeparture]", err);
    res.status(500).json({ success: false, message: "Failed to create departure" });
  }
};

// ─── Admin: update a departure ────────────────────────────────────────────────
export const updateDeparture = async (req, res) => {
  try {
    const dep = await TourDeparture.findById(req.params.id);
    if (!dep) {
      return res.status(404).json({ success: false, message: "Departure not found" });
    }

    const allowed = [
      "departureDate", "endDate", "totalSlots",
      "priceOverride", "status", "adminNotes",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        dep[field] = field === "totalSlots" ? Number(req.body[field]) : req.body[field];
      }
    });

    await dep.save();
    res.status(200).json({ success: true, data: dep });
  } catch (err) {
    console.error("[updateDeparture]", err);
    res.status(500).json({ success: false, message: "Failed to update departure" });
  }
};

// ─── Admin: delete a departure ────────────────────────────────────────────────
export const deleteDeparture = async (req, res) => {
  try {
    const dep = await TourDeparture.findById(req.params.id);
    if (!dep) {
      return res.status(404).json({ success: false, message: "Departure not found" });
    }

    // Prevent deleting if active bookings exist
    const activeBookings = await Booking.countDocuments({
      departureId: dep._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${activeBookings} active booking(s) exist. Cancel the departure instead.`,
      });
    }

    await dep.deleteOne();
    res.status(200).json({ success: true, message: "Departure deleted" });
  } catch (err) {
    console.error("[deleteDeparture]", err);
    res.status(500).json({ success: false, message: "Failed to delete departure" });
  }
};

// ─── Admin: stats for dashboard ───────────────────────────────────────────────
export const getDepartureStats = async (req, res) => {
  try {
    const now = new Date();
    const [total, open, full, closed, cancelled, upcoming] = await Promise.all([
      TourDeparture.countDocuments(),
      TourDeparture.countDocuments({ status: "open" }),
      TourDeparture.countDocuments({ status: "full" }),
      TourDeparture.countDocuments({ status: "closed" }),
      TourDeparture.countDocuments({ status: "cancelled" }),
      TourDeparture.countDocuments({ status: { $in: ["open", "full"] }, departureDate: { $gte: now } }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, open, full, closed, cancelled, upcoming },
    });
  } catch (err) {
    console.error("[getDepartureStats]", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};