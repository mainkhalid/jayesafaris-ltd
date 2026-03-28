import express from "express";
import {
  createCustomQuote,
  getCustomQuotes,
  getCustomQuoteById,
  updateCustomQuote,
  deleteCustomQuote,
  getCustomQuoteStats,
} from "../controllers/customQuoteController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/", createCustomQuote);
router.get("/stats", requireAuth(), getCustomQuoteStats);
router.get("/", requireAuth(), getCustomQuotes);
router.get("/:id", requireAuth(), getCustomQuoteById);
router.put("/:id", requireAuth(), updateCustomQuote);
router.delete("/:id", requireAuth(), deleteCustomQuote);

export default router;
