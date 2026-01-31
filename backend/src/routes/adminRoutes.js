import express from 'express';
import { loginAdmin, getMe, createInvitation, getAllUsers, getAllHouseholds, updateUserRestriction, registerAdmin } from '../controllers/adminController.js';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Protected
router.get('/me', authenticateAdmin, getMe);
router.post('/invite', authenticateAdmin, requireSuperAdmin, createInvitation);

// Management
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/households', authenticateAdmin, getAllHouseholds);
router.patch('/users/:userId/restriction', authenticateAdmin, requireSuperAdmin, updateUserRestriction);

export default router;
