/**
 * @fileoverview Authorization Middleware
 *
 * Provides various middleware functions for enforcing role‑based access control (RBAC),
 * household membership verification, and cross‑household access permissions.
 *
 * @module middleware/authorize
 * @requires ../services/db
 */

import prisma from '../services/db.js';

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has one of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to require user belongs to a household
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireHousehold = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.householdId) {
    return res.status(403).json({
      success: false,
      error: 'No household assigned. Please create or join a household first.'
    });
  }

  next();
};

/**
 * Middleware factory to verify user has access to requested household
 * Checks if requested householdId matches user's householdId or if user is household admin
 * @param {string} paramName - Name of the route parameter containing householdId (default: 'householdId')
 * @returns {Function} Express middleware function
 */
export const requireHouseholdAccess = (paramName = 'householdId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const requestedHouseholdId = req.params[paramName] || req.body[paramName];

    if (!requestedHouseholdId) {
      return res.status(400).json({
        success: false,
        error: `Missing ${paramName} parameter`
      });
    }

    // Allow if user belongs to the household
    if (req.user.householdId === requestedHouseholdId) {
      return next();
    }

    // Check if user is the household admin (for admin privileges)
    if (req.user.role === 'OWNER') {
      const household = await prisma.household.findUnique({
        where: { id: requestedHouseholdId },
        select: { adminId: true }
      });

      if (household && household.adminId === req.user.id) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied to this household'
    });
  };
};
