import { z } from 'zod';

/**
 * Validation middleware using Zod schemas
 * Provides input validation for authentication and user management endpoints
 */

// Phone number regex for E.164 format (+1234567890)
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),

  phone: z.string()
    .regex(phoneRegex, { message: 'Phone must be in E.164 format (e.g., +1234567890)' }),

  password: z.string()
    .regex(passwordRegex, {
      message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
    }),

  firstName: z.string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be at most 50 characters' }),

  lastName: z.string()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be at most 50 characters' }),

  currency: z.string()
    .length(3, { message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR)' })
    .toUpperCase()
    .default('USD')
});

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),

  password: z.string()
    .min(1, { message: 'Password is required' })
});

/**
 * Schema for updating user profile
 */
export const updateUserSchema = z.object({
  firstName: z.string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be at most 50 characters' })
    .optional(),

  lastName: z.string()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be at most 50 characters' })
    .optional(),

  timezone: z.string().optional(),

  avatarUrl: z.string().url({ message: 'Avatar URL must be a valid URL' }).optional()
});

/**
 * Schema for password reset request
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' })
});

/**
 * Schema for password reset
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),

  newPassword: z.string()
    .regex(passwordRegex, {
      message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
    })
});

// Schema for creating a household
export const createHouseholdSchema = z.object({
  name: z.string().min(2, { message: 'Household name must be at least 2 characters' }).max(50)
});

// Schema for updating a household
export const updateHouseholdSchema = z.object({
  name: z.string().min(2, { message: 'Household name must be at least 2 characters' }).max(50)
});

// Schema for joining via code
export const joinHouseholdSchema = z.object({
  inviteCode: z.string().length(8, { message: 'Invite code must be exactly 8 characters' })
});

// Schema for updating member role
export const updateRoleSchema = z.object({
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER'], { message: 'Invalid role' })
});

// Schema for sending invitation
export const sendInvitationSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, { message: 'Invalid phone format' }).optional(),
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER'], { message: 'Invalid role' })
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

// =========== PHASE 4: TRANSACTIONS & INCOME ===========

// Schema for adding a transaction
export const addTransactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  merchant: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.enum(['NEED', 'WANT']).optional().default('NEED')
});

// Schema for updating a transaction
export const updateTransactionSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  merchant: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.enum(['NEED', 'WANT']).optional()
});

// Schema for adding income
export const addIncomeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  source: z.string().min(1, "Source is required"),
  type: z.enum(['PRIMARY', 'VARIABLE', 'PASSIVE']),
  frequency: z.enum(['ONE_TIME', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

// Schema for updating income
export const updateIncomeSchema = z.object({
  amount: z.number().positive().optional(),
  source: z.string().min(1).optional(),
  type: z.enum(['PRIMARY', 'VARIABLE', 'PASSIVE']).optional(),
  frequency: z.enum(['ONE_TIME', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  isActive: z.boolean().optional()
});

// Validation middleware factory
/**
 * Validation middleware factory
 * Creates middleware that validates req.body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate and parse the request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format validation errors for user-friendly response
        // Safety check for error.errors
        const errorList = error.errors || [];

        const errors = errorList.map(err => ({
          field: err.path ? err.path.join('.') : 'unknown',
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors
        });
      }

      // Handle unexpected errors
      return res.status(500).json({
        success: false,
        error: 'Internal server error during validation'
      });
    }
  };
};
