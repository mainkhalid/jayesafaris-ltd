import express from "express";
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
} from "../controllers/inquiryController.js";
import { requireAuth, clerkMiddleware } from "@clerk/express";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
// Anyone can submit an inquiry (signed in or not)
router.post("/", createInquiry);

// ── Admin-only (Clerk auth required) ──────────────────────────────────────────
// requireAuth() rejects requests without a valid Clerk session token
router.get(  "/stats",  requireAuth(), getInquiryStats);
router.get(  "/",       requireAuth(), getInquiries);
router.get(  "/:id",    requireAuth(), getInquiryById);
router.put(  "/:id",    requireAuth(), updateInquiry);
router.delete("/:id",   requireAuth(), deleteInquiry);

export default router;