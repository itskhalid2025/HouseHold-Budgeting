import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../utils/config.js';

const prisma = new PrismaClient();

// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.platformAdmin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ success: false, error: 'Account disabled' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Create Token
        const token = jwt.sign(
            { adminId: admin.id, role: admin.adminLevel },
            config.jwt.secret,
            { expiresIn: '12h' }
        );

        // Update Login Stats
        await prisma.platformAdmin.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip
            }
        });

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.adminLevel,
                isSuperAdmin: admin.isSuperAdmin,
                avatarUrl: admin.avatarUrl
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get Current Admin
export const getMe = async (req, res) => {
    try {
        const admin = req.admin;
        res.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.adminLevel,
                isSuperAdmin: admin.isSuperAdmin,
                avatarUrl: admin.avatarUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Create Invitation (Super Admin Only)
export const createInvitation = async (req, res) => {
    try {
        const { email } = req.body;
        const inviterId = req.admin.id;

        // Check if exists
        const existingAdmin = await prisma.platformAdmin.findUnique({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
        }

        // Generate Token
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const invitation = await prisma.adminInvitation.create({
            data: {
                email,
                token,
                invitedById: inviterId,
                expiresAt
            }
        });

        // In real app, send email here. For now return token.
        res.json({
            success: true,
            message: 'Invitation created',
            invitationLink: `/admin/register?token=${token}`, // Frontend link
            token
        });

    } catch (error) {
        console.error('Invitation Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// List All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                household: {
                    select: { name: true }
                },
                aiLogs: {
                    select: { type: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: users.length,
            users: users.map(u => {
                // Calculate Monthly Usage
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthLogs = u.aiLogs.filter(l => new Date(l.createdAt) >= startOfMonth);

                return {
                    id: u.id,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    role: u.role,
                    householdName: u.household?.name || 'None',
                    aiRequestCount: u.aiRequestCount,
                    isAiRestricted: u.isAiRestricted,
                    emailVerified: u.emailVerified,
                    country: u.country,
                    aiSettings: u.aiSettings || {},
                    aiUsage: { // Lifetime
                        chat: u.aiLogs.filter(l => l.type === 'CHAT').length,
                        smartEntry: u.aiLogs.filter(l => l.type === 'SMART_ENTRY').length,
                        reports: u.aiLogs.filter(l => l.type === 'REPORT').length
                    },
                    aiUsageMonth: { // Current Month
                        total: monthLogs.length,
                        chat: monthLogs.filter(l => l.type === 'CHAT').length,
                        smartEntry: monthLogs.filter(l => l.type === 'SMART_ENTRY').length,
                        reports: monthLogs.filter(l => l.type === 'REPORT').length
                    },
                    createdAt: u.createdAt,
                    lastLoginAt: u.lastLoginAt
                };
            })
        });
    } catch (error) {
        console.error('List Users Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// List All Households
export const getAllHouseholds = async (req, res) => {
    try {
        const households = await prisma.household.findMany({
            include: {
                admin: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        country: true
                    }
                },
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        country: true
                    }
                },
                _count: {
                    select: { members: true }
                },
                aiLogs: {
                    select: { type: true, createdAt: true } // Added createdAt
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: households.length,
            households: households.map(h => {
                // Calculate Granular Usage
                const chatCount = h.aiLogs.filter(l => l.type === 'CHAT').length;
                const smartEntryCount = h.aiLogs.filter(l => l.type === 'SMART_ENTRY').length;
                const reportCount = h.aiLogs.filter(l => l.type === 'REPORT').length;

                // Calculate Monthly Usage
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthLogs = h.aiLogs.filter(l => new Date(l.createdAt) >= startOfMonth);

                return {
                    id: h.id,
                    name: h.name,
                    memberCount: h._count.members,
                    aiRequestCount: h.aiRequestCount,
                    country: h.country || h.admin?.country || null, // Fallback to owner's country
                    isCalculatedCountry: !h.country && !!h.admin?.country, // Flag for UI if needed
                    aiSettings: h.aiSettings || {},
                    aiUsage: {
                        chat: chatCount,
                        smartEntry: smartEntryCount,
                        reports: reportCount
                    },
                    aiUsageMonth: { // Current Month
                        total: monthLogs.length,
                        chat: monthLogs.filter(l => l.type === 'CHAT').length,
                        smartEntry: monthLogs.filter(l => l.type === 'SMART_ENTRY').length,
                        reports: monthLogs.filter(l => l.type === 'REPORT').length
                    },
                    createdAt: h.createdAt,
                    members: h.members,
                    admin: h.admin
                };
            })
        });
    } catch (error) {
        console.error('List Households Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update User Restrictions
export const updateUserRestriction = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isAiRestricted } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: { isAiRestricted }
        });

        res.json({ success: true, message: `User AI access ${isAiRestricted ? 'restricted' : 'enabled'}` });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update User (Profile & Settings)
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, emailVerified, password, aiSettings, isAiRestricted } = req.body;

        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
        if (isAiRestricted !== undefined) updateData.isAiRestricted = isAiRestricted;

        // Granular AI Settings
        if (aiSettings !== undefined) {
            updateData.aiSettings = aiSettings; // Prisma stores JSON directly
        }

        if (password) {
            const bcrypt = await import('bcrypt');
            updateData.passwordHash = await bcrypt.default.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};

// Delete User with proper cleanup/handover
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch user to verify existence and check context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                adminHouseholds: {
                    include: {
                        members: {
                            orderBy: { createdAt: 'asc' },
                            select: { id: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 2. Prepare database operations
        await prisma.$transaction(async (tx) => {
            // A. Handle Owned Households (Transfer or Delete)
            if (user.adminHouseholds && user.adminHouseholds.length > 0) {
                for (const household of user.adminHouseholds) {
                    const otherMembers = household.members.filter(m => m.id !== userId);

                    if (otherMembers.length > 0) {
                        // Promote the oldest remaining member (successor)
                        const successor = otherMembers[0];
                        console.log(`[DeleteUser] Transferring household ${household.id} ownership to ${successor.id}`);

                        await tx.household.update({
                            where: { id: household.id },
                            data: { adminId: successor.id }
                        });

                        await tx.user.update({
                            where: { id: successor.id },
                            data: { role: 'OWNER' }
                        });
                    } else {
                        // No other members - Delete the household entirely
                        console.log(`[DeleteUser] Deleting orphaned household ${household.id}`);
                        await tx.household.delete({
                            where: { id: household.id }
                        });
                    }
                }
            }

            // B. Delete User's Data (that doesn't cascade automatically)
            // Note: We delete these manually as schema might not have Cascade on all relations

            // Delete SplitExpenses linked to user's transactions first
            await tx.splitExpense.deleteMany({
                where: {
                    transaction: {
                        userId: userId
                    }
                }
            });

            await tx.transaction.deleteMany({ where: { userId } });
            await tx.income.deleteMany({ where: { userId } });
            await tx.loan.deleteMany({ where: { userId } });
            await tx.feedback.deleteMany({ where: { userId } });

            // Goals where user is creator
            await tx.goal.updateMany({
                where: { createdById: userId },
                data: { createdById: null } // Or delete? Keeping goal if household exists seems safer, just remove owner link
            });

            // Invitations sent by user
            await tx.invitation.deleteMany({ where: { invitedById: userId } });

            // C. Finally, Delete the User
            await tx.user.delete({
                where: { id: userId }
            });
        });

        res.json({ success: true, message: 'User and associated data deleted successfully' });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user. Ensure they are not the sole admin of a shared household.' });
    }
};

// Update Household
export const updateHousehold = async (req, res) => {
    try {
        const { householdId } = req.params;
        const { name, aiSettings, country } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (country !== undefined) updateData.country = country;
        if (aiSettings !== undefined) updateData.aiSettings = aiSettings;

        const household = await prisma.household.update({
            where: { id: householdId },
            data: updateData
        });

        res.json({ success: true, message: 'Household updated successfully', household });
    } catch (error) {
        console.error('Update Household Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update household' });
    }
};

// Delete Household
export const deleteHousehold = async (req, res) => {
    try {
        const { householdId } = req.params;

        // Prisma `onDelete: Cascade` on members/transactions typically handles relations
        // But `User` model `householdId` is optional. 
        // We probably want to free the members first or delete them? 
        // User requirements said "control... remove member". 
        // Usually, deleting a household implies disbanding it. Members become free agents.
        // But usually transactions are tied to household. They get deleted.

        // Let's manually set members householdId to null first to avoid deleting users?
        // OR does schema say `User.household` onDelete?
        // Schema: `household Household? @relation(fields: [householdId], references: [id])` - No Cascade.
        // So we must unlink members.

        await prisma.user.updateMany({
            where: { householdId },
            data: { householdId: null }
        });

        await prisma.household.delete({ where: { id: householdId } });

        res.json({ success: true, message: 'Household deleted successfully' });
    } catch (error) {
        console.error('Delete Household Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete household' });
    }
};

// Register Admin via Invitation
export const registerAdmin = async (req, res) => {
    try {
        const { token, password, firstName, lastName, username } = req.body;

        const invitation = await prisma.adminInvitation.findUnique({
            where: { token }
        });

        if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
            return res.status(400).json({ success: false, error: 'Invalid or expired invitation' });
        }

        // Hash Password
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(password, 10);

        // Create Admin
        await prisma.platformAdmin.create({
            data: {
                email: invitation.email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                username,
                adminLevel: 'STANDARD'
            }
        });

        // Mark invitation as used
        await prisma.adminInvitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() }
        });

        res.json({ success: true, message: 'Admin account created successfully' });

    } catch (error) {
        console.error('Admin Register Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const [
            userCount,
            householdCount,
            aiLogCount,
            recentLogs
        ] = await Promise.all([
            prisma.user.count(),
            prisma.household.count(),
            prisma.aiUsageLog.count(),
            prisma.aiUsageLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } }
                }

            })
        ]);

        // Calculate "New this week" for users (optional, simple approx for now)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsersCount = await prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } });
        const newHouseholdsCount = await prisma.household.count({ where: { createdAt: { gte: oneWeekAgo } } });

        // Calculate today's AI requests
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayAiCount = await prisma.aiUsageLog.count({ where: { createdAt: { gte: startOfDay } } });

        res.json({
            success: true,
            stats: {
                totalUsers: userCount,
                newUsers: newUsersCount,
                totalHouseholds: householdCount,
                newHouseholds: newHouseholdsCount,
                totalAiRequests: aiLogCount,
                todayAiRequests: todayAiCount
            },
            recentActivity: recentLogs.map(log => ({
                id: log.id,
                user: `${log.user.firstName} ${log.user.lastName}`,
                email: log.user.email,
                type: log.type,
                tokens: log.tokens,
                country: log.country,
                createdAt: log.createdAt
            }))
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get Detailed AI Analytics
export const getAiAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // 'month' (current) or 'history' (past year)

        // 1. Current Month Overview (Always needed for Stat Cards)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all logs for current month to calculate granular stats
        const currentMonthLogs = await prisma.aiUsageLog.findMany({
            where: { createdAt: { gte: startOfMonth } },
            select: { type: true, tokens: true, createdAt: true }
        });

        const stats = {
            totalRequests: currentMonthLogs.length,
            totalTokens: currentMonthLogs.reduce((acc, log) => acc + (log.tokens || 0), 0),
            byType: {
                CHAT: 0,
                SMART_ENTRY: 0,
                REPORT: 0
            }
        };

        currentMonthLogs.forEach(log => {
            if (stats.byType[log.type] !== undefined) {
                stats.byType[log.type]++;
            }
        });

        // 2. Trend Data (Dynamic based on period)
        let trendData = [];

        if (period === 'history') {
            // Last 12 Months
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
            twelveMonthsAgo.setDate(1); // Start of that month

            const historyLogs = await prisma.aiUsageLog.findMany({
                where: { createdAt: { gte: twelveMonthsAgo } },
                select: { createdAt: true, type: true }
            });

            // Bucket by Month
            const monthlyBuckets = {};
            // Initialize last 12 months with 0s
            for (let i = 0; i < 12; i++) {
                const d = new Date(twelveMonthsAgo);
                d.setMonth(d.getMonth() + i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthlyBuckets[key] = { total: 0, chat: 0, smartEntry: 0, report: 0 };
            }

            historyLogs.forEach(log => {
                const d = new Date(log.createdAt);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyBuckets[key]) {
                    monthlyBuckets[key].total++;
                    if (log.type === 'CHAT') monthlyBuckets[key].chat++;
                    else if (log.type === 'SMART_ENTRY') monthlyBuckets[key].smartEntry++;
                    else if (log.type === 'REPORT') monthlyBuckets[key].report++;
                }
            });

            // Format for frontend
            trendData = Object.entries(monthlyBuckets).sort().map(([key, data]) => {
                const [y, m] = key.split('-');
                const dateObj = new Date(parseInt(y), parseInt(m) - 1);
                return {
                    label: dateObj.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
                    value: data.total,
                    chat: data.chat,
                    smartEntry: data.smartEntry,
                    report: data.report
                };
            });

        } else {
            // Last 30 Days (Daily)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
            thirtyDaysAgo.setHours(0, 0, 0, 0);

            const dailyLogs = await prisma.aiUsageLog.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { createdAt: true, type: true }
            });

            const dailyBuckets = {};
            for (let i = 0; i < 30; i++) {
                const d = new Date(thirtyDaysAgo);
                d.setDate(d.getDate() + i);
                const key = d.toISOString().split('T')[0];
                dailyBuckets[key] = { total: 0, chat: 0, smartEntry: 0, report: 0 };
            }

            dailyLogs.forEach(log => {
                const key = log.createdAt.toISOString().split('T')[0];
                if (dailyBuckets[key]) {
                    dailyBuckets[key].total++;
                    if (log.type === 'CHAT') dailyBuckets[key].chat++;
                    else if (log.type === 'SMART_ENTRY') dailyBuckets[key].smartEntry++;
                    else if (log.type === 'REPORT') dailyBuckets[key].report++;
                }
            });

            trendData = Object.entries(dailyBuckets).sort().map(([key, data]) => {
                const d = new Date(key);
                return {
                    label: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                    value: data.total,
                    chat: data.chat,
                    smartEntry: data.smartEntry,
                    report: data.report
                };
            });
        }

        // 3. Service Distribution (Percentage)
        const total = stats.totalRequests || 1; // avoid div by 0
        const distribution = [
            { label: 'Smart Entry', type: 'SMART_ENTRY', count: stats.byType.SMART_ENTRY, percentage: Math.round((stats.byType.SMART_ENTRY / total) * 100), color: '#00ff9d' },
            { label: 'Advisor Chat', type: 'CHAT', count: stats.byType.CHAT, percentage: Math.round((stats.byType.CHAT / total) * 100), color: '#0066ff' },
            { label: 'Reports', type: 'REPORT', count: stats.byType.REPORT, percentage: Math.round((stats.byType.REPORT / total) * 100), color: '#bc13fe' }
        ].sort((a, b) => b.count - a.count);


        res.json({
            success: true,
            analytics: {
                stats: {
                    totalRequests: stats.totalRequests,
                    totalTokens: stats.totalTokens, // Cost Basis
                    avgLatency: '0.8s' // Mock
                },
                trend: trendData,
                distribution
            }
        });

    } catch (error) {
        console.error('AI Analytics Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update AI Limits for ALL Users (Bulk Action)
export const updateAllUserAiLimits = async (req, res) => {
    try {
        const { aiSettings } = req.body;

        if (!aiSettings) {
            return res.status(400).json({ success: false, error: 'AI Settings are required' });
        }

        // We use updateMany to apply this to every user in the database
        // NOTE: This OVERWRITES existing individual preferences, which is the intended "Global Reset" behavior.
        const result = await prisma.user.updateMany({
            data: {
                aiSettings: aiSettings
            }
        });

        res.json({
            success: true,
            message: `Successfully updated AI limits for ${result.count} users.`,
            count: result.count
        });

    } catch (error) {
        console.error('Bulk AI Update Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update global limits.' });
    }
};
