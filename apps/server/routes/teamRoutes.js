import express from "express";
import { requireAuth } from "@clerk/express";
import { ClerkController } from "../controllers/clerkController.js";
import {
  teamUpload,
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  reorderMembers,
} from "../controllers/teamController.js";

const router = express.Router();
const adminOnly = [requireAuth(), ClerkController.requireRole("admin")];

router.get("/all", getAllMembers);


router.post(  "/",         ...adminOnly, teamUpload, createMember);
router.put(   "/:id",      ...adminOnly, teamUpload, updateMember);
router.delete("/:id",      ...adminOnly,             deleteMember);
router.post(  "/reorder",  ...adminOnly,             reorderMembers);

export default router;