import express from "express";
import { requireAuth } from "@clerk/express";
import { ClerkController } from "../controllers/clerkController.js";
import {
  getGeneral, saveGeneral,
  getSocial, saveSocial,
  getBookingSettings, saveBookingSettings,
} from "../controllers/settingsController.js";

const router = express.Router();
const adminOnly = [requireAuth(), ClerkController.requireRole("admin")];

router.get( "/general", ...adminOnly, getGeneral);
router.post("/general", ...adminOnly, saveGeneral);

router.get( "/social",  ...adminOnly, getSocial);
router.post("/social",  ...adminOnly, saveSocial);

router.get( "/booking", ...adminOnly, getBookingSettings);
router.post("/booking", ...adminOnly, saveBookingSettings);

export default router;
