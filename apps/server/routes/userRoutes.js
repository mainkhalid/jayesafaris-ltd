import express from "express";
import { requireAuth } from "@clerk/express";
import { ClerkController, listUsers, updateUserRole, getUser } from "../controllers/clerkController.js";

const router = express.Router();

// ─── Admin-only middleware stack ──────────────────────────────────────────────
const adminOnly = [requireAuth(), ClerkController.requireRole("admin")];

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get(   "/",             ...adminOnly, listUsers);
router.get(   "/:userId",      ...adminOnly, getUser);
router.patch( "/:userId/role", ...adminOnly, updateUserRole);

// ─── Current-user helpers ─────────────────────────────────────────────────────

/** GET /api/users/role */
router.get("/role", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const role = await ClerkController.getUserRole(userId);
    res.json({ success: true, role, userId });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user role", message: err.message });
  }
});

/** GET /api/users/profile */
router.get("/profile", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const role    = await ClerkController.getUserRole(userId);
    const isAdmin = await ClerkController.isAdmin(userId);
    res.json({ success: true, userId, role, isAdmin });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile", message: err.message });
  }
});

/** POST /api/users/initialize */
router.post("/initialize", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const existingRole = await ClerkController.getUserRole(userId);
    if (existingRole) {
      return res.json({ success: true, message: "User already initialized", role: existingRole });
    }
    const result = await ClerkController.initializeUserRole(userId);
    res.json({ success: true, message: "User role initialized", ...result });
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize user", message: err.message });
  }
});

/** GET /api/users/is-admin */
router.get("/is-admin", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await ClerkController.isAdmin(userId);
    res.json({ success: true, isAdmin });
  } catch (err) {
    res.status(500).json({ error: "Failed to check admin status", message: err.message });
  }
});

export default router;