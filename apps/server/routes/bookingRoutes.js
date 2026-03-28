import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
} from "../controllers/bookingController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/", createBooking);
router.get("/stats", requireAuth(), getBookingStats);
router.get("/", requireAuth(), getBookings);
router.get("/:id", requireAuth(), getBookingById);
router.put("/:id", requireAuth(), updateBooking);
router.delete("/:id", requireAuth(), deleteBooking);

export default router;
