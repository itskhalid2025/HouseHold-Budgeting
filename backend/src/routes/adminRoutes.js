import express from 'express';
import { loginAdmin, getMe, createInvitation, getAllUsers, getAllHouseholds, updateUserRestriction, registerAdmin, getDashboardStats, getAiAnalytics, updateUser, deleteUser, updateHousehold, deleteHousehold, updateAllUserAiLimits } from '../controllers/adminController.js';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Protected
router.get('/me', authenticateAdmin, getMe);
router.post('/invite', authenticateAdmin, requireSuperAdmin, createInvitation);
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);
router.get('/ai-stats', authenticateAdmin, getAiAnalytics);

// Management
router.put('/users/ai-limits/bulk', authenticateAdmin, requireSuperAdmin, updateAllUserAiLimits); // Bulk Update BEFORE :userId
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/households', authenticateAdmin, getAllHouseholds);
router.patch('/users/:userId/restriction', authenticateAdmin, requireSuperAdmin, updateUserRestriction);
router.put('/users/:userId', authenticateAdmin, requireSuperAdmin, updateUser);
router.delete('/users/:userId', authenticateAdmin, requireSuperAdmin, deleteUser);

// Household Management
router.put('/households/:householdId', authenticateAdmin, requireSuperAdmin, updateHousehold);
router.delete('/households/:householdId', authenticateAdmin, requireSuperAdmin, deleteHousehold);

export default router;
