const { clerkClient } = require('@clerk/express');

class ClerkController {
  /**
   * Initialize user with default role (user)
   */
  static async initializeUserRole(userId) {
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'user'
        }
      });
      console.log(`Initialized role for user: ${userId}`);
      return { success: true, role: 'user' };
    } catch (error) {
      console.error('Error initializing user role:', error);
      throw error;
    }
  }

  /**
   * Get user role from metadata
   */
  static async getUserRole(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return user.publicMetadata?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin function)
   */
  static async updateUserRole(userId, newRole) {
    try {
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role. Must be "user" or "admin"');
      }

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: newRole
        }
      });
      console.log(`Updated role for user ${userId} to: ${newRole}`);
      return { success: true, role: newRole };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(userId) {
    try {
      const role = await this.getUserRole(userId);
      return role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Middleware to require specific role
   */
  static requireRole(requiredRole) {
    return async (req, res, next) => {
      try {
        const userId = req.auth.userId;
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRole = await ClerkController.getUserRole(userId);
        
        if (requiredRole === 'admin' && userRole !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        req.userRole = userRole;
        next();
      } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ error: 'Failed to verify user role' });
      }
    };
  }

  /**
   * Middleware to attach user role to request
   */
  static attachUserRole() {
    return async (req, res, next) => {
      try {
        if (req.auth?.userId) {
          req.userRole = await ClerkController.getUserRole(req.auth.userId);
        }
        next();
      } catch (error) {
        console.error('Error attaching user role:', error);
        next();
      }
    };
  }
}

module.exports = ClerkController;