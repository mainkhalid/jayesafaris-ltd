import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getDepartures,
  getDeparturesByPackage,
  getDepartureById,
  createDeparture,
  updateDeparture,
  deleteDeparture,
  getDepartureStats,
} from "../controllers/tourDepartureController.js";

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/by-package/:packageId", getDeparturesByPackage);

// ─── Admin routes ─────────────────────────────────────────────────────────────
// IMPORTANT: /stats MUST come before /:id, otherwise Express matches
// "stats" as an ObjectId and returns 400 "Invalid departure ID".
router.get(   "/stats",  requireAuth(), getDepartureStats);
router.get(   "/",       requireAuth(), getDepartures);
router.post(  "/",       requireAuth(), createDeparture);
router.put(   "/:id",    requireAuth(), updateDeparture);
router.delete("/:id",    requireAuth(), deleteDeparture);

// Public single-departure lookup (used by BookingPage to confirm slot availability)
// Placed last so named routes above are matched first.
router.get("/:id", getDepartureById);

export default router;