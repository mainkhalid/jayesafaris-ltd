import express from "express";
import { requireAuth } from "@clerk/express";
import { ClerkController } from "../controllers/clerkController.js";
import upload from "../middleware/upload.js";
import { uploadImage } from "../config/cloudinary.js";

const router = express.Router();
const adminOnly = [requireAuth(), ClerkController.requireRole("admin")];

/**
 * POST /api/upload/single
 * Body: multipart/form-data  { image: File, folder?: string }
 * Returns: { url, publicId }
 */
router.post(
  "/single",
  ...adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided." });
      }
      const folder = req.body?.folder || "jaye-safaris/misc";
      const result = await uploadImage(req.file.buffer, folder);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error("[upload/single]", err);
      res.status(500).json({ success: false, message: err.message || "Upload failed." });
    }
  }
);

export default router;
