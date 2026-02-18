const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const ClerkController = require('../controllers/clerkController');

router.get('/role', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const role = await ClerkController.getUserRole(userId);
    
    res.json({ 
      success: true,
      role,
      userId 
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user role',
      message: error.message 
    });
  }
});

/**
 * Get current user's profile information
 * GET /api/user/profile
 */
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const role = await ClerkController.getUserRole(userId);
    const isAdmin = await ClerkController.isAdmin(userId);
    
    res.json({ 
      success: true,
      userId,
      role,
      isAdmin
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error.message 
    });
  }
});

/**
 * Initialize role for new user (called on first login)
 * POST /api/user/initialize
 */
router.post('/initialize', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user already has a role
    const existingRole = await ClerkController.getUserRole(userId);
    
    if (existingRole) {
      return res.json({ 
        success: true,
        message: 'User already initialized',
        role: existingRole 
      });
    }

    // Initialize with default role
    const result = await ClerkController.initializeUserRole(userId);
    
    res.json({ 
      success: true,
      message: 'User role initialized',
      ...result 
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({ 
      error: 'Failed to initialize user',
      message: error.message 
    });
  }
});

/**
 * GET /api/user/is-admin
 */
router.get('/is-admin', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = await ClerkController.isAdmin(userId);
    
    res.json({ 
      success: true,
      isAdmin 
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ 
      error: 'Failed to check admin status',
      message: error.message 
    });
  }
});

module.exports = router;