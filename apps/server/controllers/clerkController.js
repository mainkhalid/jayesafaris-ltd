import { clerkClient } from "@clerk/express";

// ─── Class-based helpers (middleware, role checks) ────────────────────────────
export class ClerkController {
  /** Initialize user with default role */
  static async initializeUserRole(userId) {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "user" },
    });
    return { success: true, role: "user" };
  }

  /** Get user role from public metadata */
  static async getUserRole(userId) {
    const user = await clerkClient.users.getUser(userId);
    return user.publicMetadata?.role || "user";
  }

  /** Check if user is admin */
  static async isAdmin(userId) {
    const role = await ClerkController.getUserRole(userId);
    return role === "admin";
  }

  /** Middleware: require a specific role */
  static requireRole(requiredRole) {
    return async (req, res, next) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const userRole = await ClerkController.getUserRole(userId);
        if (requiredRole === "admin" && userRole !== "admin") {
          return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
        req.userRole = userRole;
        next();
      } catch (err) {
        console.error("Role check error:", err);
        res.status(500).json({ error: "Failed to verify user role" });
      }
    };
  }

  /** Middleware: attach role to req */
  static attachUserRole() {
    return async (req, res, next) => {
      try {
        if (req.auth?.userId) {
          req.userRole = await ClerkController.getUserRole(req.auth.userId);
        }
        next();
      } catch {
        next();
      }
    };
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/** GET /api/users  — paginated + searchable list */
export const listUsers = async (req, res) => {
  try {
    const { query = "", page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const response = await clerkClient.users.getUserList({
      limit:   Number(limit),
      offset,
      query:   query || undefined,
      orderBy: "-created_at",
    });

    const users = (response.data ?? response).map((u) => ({
      id:         u.id,
      firstName:  u.firstName  || "",
      lastName:   u.lastName   || "",
      fullName:   [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      email:      u.emailAddresses?.[0]?.emailAddress || "—",
      imageUrl:   u.imageUrl   || "",
      role:       u.publicMetadata?.role || "user",
      createdAt:  u.createdAt,
      lastSignIn: u.lastSignInAt,
    }));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: response.totalCount ?? users.length,
        page:  Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error("[listUsers]", err);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

/** PATCH /api/users/:userId/role */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role }   = req.body;

    const VALID_ROLES = ["user", "admin"];
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}.`,
      });
    }

    // Prevent self-demotion
    if (req.auth?.userId === userId && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role.",
      });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    res.status(200).json({ success: true, userId, role });
  } catch (err) {
    console.error("[updateUserRole]", err);
    res.status(500).json({ success: false, message: "Failed to update user role." });
  }
};

/** GET /api/users/:userId */
export const getUser = async (req, res) => {
  try {
    const u = await clerkClient.users.getUser(req.params.userId);
    res.status(200).json({
      success: true,
      data: {
        id:         u.id,
        fullName:   [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
        email:      u.emailAddresses?.[0]?.emailAddress || "—",
        imageUrl:   u.imageUrl || "",
        role:       u.publicMetadata?.role || "user",
        createdAt:  u.createdAt,
        lastSignIn: u.lastSignInAt,
      },
    });
  } catch (err) {
    console.error("[getUser]", err);
    res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
};