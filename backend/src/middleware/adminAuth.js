import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../utils/config.js';

const prisma = new PrismaClient();

export const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        const admin = await prisma.platformAdmin.findUnique({
            where: { id: decoded.adminId }
        });

        if (!admin || !admin.isActive) {
            return res.status(401).json({ success: false, error: 'Admin not found or inactive' });
        }

        req.admin = admin;
        req.token = token;
        next();
    } catch (error) {
        console.error('Admin Auth Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || !req.admin.isSuperAdmin) {
        return res.status(403).json({ success: false, error: 'Super Admin access required' });
    }
    next();
};
