import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import TourDeparture from "../models/tourDepartureModel.js";

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name, email, phone,
      packageId, departureId, packageTitle,
      numberOfTravelers, message, clerkUserId,
    } = req.body;

    if (!name || !email || !packageId || !departureId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "name, email, packageId and departureId are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(departureId)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid departureId." });
    }

    const departure = await TourDeparture.findById(departureId).session(session);
    if (!departure) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Departure not found." });
    }

    if (!["open"].includes(departure.status)) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: `This departure is currently ${departure.status} and not accepting new bookings.`,
      });
    }

    const totalTravelers =
      (numberOfTravelers?.adults ?? 1) +
      (numberOfTravelers?.kids   ?? 0) +
      (numberOfTravelers?.infants ?? 0);

    const availableSlots = departure.totalSlots - departure.bookedSlots;
    if (totalTravelers > availableSlots) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: `Only ${availableSlots} slot(s) remaining on this departure.`,
      });
    }

    // ── Create the booking ─────────────────────────────────────────────────
    const [booking] = await Booking.create(
      [
        {
          name,
          email,
          phone: phone || "",
          packageId,
          departureId,
          packageTitle: packageTitle || departure.packageTitle,
          numberOfTravelers: {
            adults:  numberOfTravelers?.adults  ?? 1,
            kids:    numberOfTravelers?.kids    ?? 0,
            infants: numberOfTravelers?.infants ?? 0,
          },
          message: message || "",
          clerkUserId: clerkUserId || null,
        },
      ],
      { session }
    );

    departure.bookedSlots += totalTravelers;
    await departure.save({ session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    await session.abortTransaction();
    console.error("[createBooking]", err);
    res.status(500).json({ success: false, message: "Failed to create booking." });
  } finally {
    session.endSession();
  }
};
export const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, userId } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (userId) filter.clerkUserId = userId;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate("departureId", "departureDate endDate status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("[getBookings]", err);
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
};


export const getBookingById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("packageId",   "title country thumbnail")
      .populate("departureId", "departureDate endDate status priceOverride")
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("[getBookingById]", err);
    res.status(500).json({ success: false, message: "Failed to fetch booking." });
  }
};

export const updateBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const { status, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled"];
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
      }
      booking.status = status;
    }
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("[updateBooking]", err);
    res.status(500).json({ success: false, message: "Failed to update booking." });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, message: "Booking deleted." });
  } catch (err) {
    console.error("[deleteBooking]", err);
    res.status(500).json({ success: false, message: "Failed to delete booking." });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, confirmed, cancelled },
    });
  } catch (err) {
    console.error("[getBookingStats]", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};