# Controller Logging Enhancement Guide

This document explains how to use the new logging utility across all controllers for better debugging.

## Quick Start

Import the logger at the top of any controller:

```javascript
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';
```

## Usage Examples

### 1. Log Function Entry
```javascript
export const register = async (req, res) => {
    logEntry('authController', 'register', { email: req.body.email, phone: req.body.phone });
    // ... rest of function
}
```

### 2. Log Database Operations
```javascript
logDB('create', 'User', { email: newUser.email });
const user = await prisma.user.create({ data: userData });
```

### 3. Log Success
```javascript
logSuccess('authController', 'register', { userId: user.id });
res.status(201).json({ success: true, userId: user.id });
```

### 4. Log Errors
```javascript
catch (error) {
    logError('authController', 'register', error);
    res.status(500).json({ error: 'Registration failed' });
}
```

## Logging Pattern for All Controllers

```javascript
export const someAction = async (req, res) => {
    logEntry('controllerName', 'actionName', { param1: req.body.param1 });
    
    try {
        logDB('create', 'ModelName', { id: 'xyz' });
        const result = await prisma.model.create({ ... });
        
        logSuccess('controllerName', 'actionName', { id: result.id });
        res.json({ success: true, data: result });
    } catch (error) {
        logError('controllerName', 'actionName', error);
        res.status(500).json({ error: 'Action failed' });
    }
};
```

## Console Output Example

```
▶ [authController.register] 2026-01-23T14:15:00.000Z
📝 Params: { email: 'user@example.com', phone: '+1234567890' }
➕ DB.create(User) { email: 'user@example.com' }
✅ [authController.register] Success
📤 Result: {"userId":"abc-123"}...
```

## Files to Update

Add logging to these controllers:
- [ ] authController.js
- [ ] goalController.js
- [ ] householdController.js
- [ ] incomeController.js
- [ ] invitationController.js
- [ ] joinRequestController.js
- [ ] transactionController.js
- [x] smartController.js (already has custom logs)

## Benefits

1. **Consistent Format**: All logs follow the same pattern
2. **Color Coded**: Easy to spot errors, successes, and DB operations
3. **Automatic Sanitization**: Passwords and tokens are automatically hidden
4. **Timestamped**: Every entry has a timestamp
5. **Reduced Boilerplate**: Simple function calls instead of complex console.log statements
