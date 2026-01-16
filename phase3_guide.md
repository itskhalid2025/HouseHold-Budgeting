# Phase 3: Household & Invitation System

> **Duration**: Days 6-7  
> **Prerequisites**: Phase 2 completed (auth working)  
> **Goal**: Enable household creation, member invitations via email/phone, and role management

---

## Phase Overview

This phase builds the multi-user household system. By the end, you will have:
- Household creation and management
- Invitation system via email or phone (unique identifiers)
- Role-based permissions (Admin, Editor, Viewer)
- Polling-based sync for data updates

---

## Task Checklist

### 1. Household Management

#### 1.1 Create Household Endpoints
- [ ] Create household controller
- [ ] Implement create household
- [ ] Implement get household
- [ ] Implement update household (admin only)
- [ ] Generate unique invite codes

**LLM Prompt for Household Controller:**
```
Create a household controller (backend/src/controllers/householdController.js).

Requirements:
- Export async function: createHousehold(req, res)
  - Extract name from req.body
  - User from req.user (authenticated)
  - Generate unique 8-character invite code (alphanumeric)
  - Create household in database with user as admin
  - Update user's householdId and role to ADMIN
  - Return: { success: true, household: { id, name, inviteCode } }

- Export async function: getHousehold(req, res)
  - Get householdId from req.user
  - Fetch household with members list
  - Return household with member details (name, email, role)
  - Don't expose sensitive data (password, phone of other members)

- Export async function: updateHousehold(req, res)
  - Only ADMIN can update
  - Update name or other settings
  - Return updated household

- Export async function: deleteHousehold(req, res)
  - Only ADMIN can delete
  - Soft delete (set deletedAt) or cascade delete all data
  - Remove all members' householdId references

Include proper error handling and authorization checks.
```

**Testing (Manual):**
| Test | Method | Expected Output |
|------|--------|-----------------|
| Create household | POST /api/households | 201, household with invite code |
| Get household | GET /api/households/:id | 200, household with members |
| Update (as admin) | PUT /api/households/:id | 200, updated household |
| Update (as viewer) | PUT /api/households/:id | 403, insufficient permissions |

**Example Input:**
```bash
curl -X POST http://localhost:3001/api/households \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Smith Family"}'
```

**Example Output:**
```json
{
  "success": true,
  "household": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Smith Family",
    "inviteCode": "ABC12345",
    "createdAt": "2024-01-16T10:00:00Z"
  }
}
```

---

### 2. Invitation System

#### 2.1 Create Invitation Endpoints
- [ ] Create invitation controller
- [ ] Implement send invitation (email or phone)
- [ ] Implement accept invitation
- [ ] Implement cancel invitation
- [ ] Add expiry handling (7 days)

**LLM Prompt for Invitation Controller:**
```
Create an invitation controller (backend/src/controllers/invitationController.js).

Requirements:
- Export async function: sendInvitation(req, res)
  - Only household ADMIN can send invitations
  - Extract: method ('email' or 'phone'), recipient, role
  - Validate recipient format based on method
  - Check for existing pending invitation to same recipient
  - Generate unique 64-character token
  - Set expiry to 7 days from now
  - Create invitation record in database
  - Log invitation details (actual email/SMS in production)
  - Return: { success: true, invitation: { id, status, expiresAt } }

- Export async function: getInvitations(req, res)
  - Get all invitations for user's household
  - Include status and recipient info

- Export async function: acceptInvitation(req, res)
  - Extract token from req.params
  - Find invitation by token
  - Validate: not expired, status is PENDING
  - If req.user exists (logged in):
    - Add user to household with invitation role
    - Mark invitation as ACCEPTED
  - If not logged in:
    - Return registration URL with pre-filled data
  - Return success with household info

- Export async function: cancelInvitation(req, res)
  - Only ADMIN or invitation creator can cancel
  - Mark as CANCELLED

Handle edge cases: duplicate invitations, expired tokens, already accepted.
```

**Testing (Manual):**
| Test | Input | Expected Output |
|------|-------|-----------------|
| Send email invite | `{"method":"email","recipient":"new@test.com","role":"EDITOR"}` | 201, invitation created |
| Send phone invite | `{"method":"phone","recipient":"+1555999888","role":"VIEWER"}` | 201, invitation created |
| Accept invite (logged in) | POST /api/invitations/:token/accept | 200, joined household |
| Accept expired invite | Old token | 400, "Invitation expired" |
| Duplicate invite | Same recipient again | 400, "Invitation already pending" |

**Example Input (Send Invitation):**
```bash
curl -X POST http://localhost:3001/api/invitations \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email",
    "recipient": "spouse@example.com",
    "role": "EDITOR"
  }'
```

**Example Output:**
```json
{
  "success": true,
  "invitation": {
    "id": "inv_123456",
    "recipientEmail": "spouse@example.com",
    "role": "EDITOR",
    "status": "PENDING",
    "expiresAt": "2024-01-23T10:00:00Z",
    "inviteLink": "http://localhost:5173/invite/abc123def456..."
  }
}
```

---

### 3. Role Management

#### 3.1 Implement Role-Based Access
- [ ] Create role update endpoint
- [ ] Implement member removal
- [ ] Add permission checks to all household routes

**LLM Prompt for Member Management:**
```
Add member management to householdController.js.

Requirements:
- Export async function: updateMemberRole(req, res)
  - Only ADMIN can change roles
  - Extract memberId and newRole from req.body
  - Cannot change own role (prevent admin lockout)
  - Cannot remove last ADMIN
  - Update user's role in database
  - Return: { success: true, member: { id, name, role } }

- Export async function: removeMember(req, res)
  - Only ADMIN can remove members
  - Cannot remove self
  - Remove user's householdId (set to null)
  - Set user's role to VIEWER
  - Return: { success: true, message: "Member removed" }

- Export async function: leaveHousehold(req, res)
  - Any member can leave
  - If ADMIN and only admin: must transfer admin first or delete household
  - Remove user's householdId
  - Return: { success: true, message: "Left household" }
```

**Testing (Manual):**
| Test | Input | Expected Output |
|------|-------|-----------------|
| Change member role | `{"memberId":"xxx","role":"ADMIN"}` | 200, role updated |
| Remove member | DELETE /api/households/members/:id | 200, member removed |
| Leave household | POST /api/households/leave | 200, left successfully |
| Admin remove self | DELETE self | 400, "Cannot remove yourself" |

---

### 4. Polling-Based Sync

#### 4.1 Set Up Polling Service (Frontend)
- [ ] Create usePolling hook
- [ ] Implement auto-refresh for household data
- [ ] Handle stale data detection
- [ ] Add manual refresh button

**LLM Prompt for Polling Hook:**
```
Create a React hook (frontend/src/hooks/usePolling.js) for auto-refresh data sync.

Requirements:
- Export function: usePolling(fetchFunction, interval = 30000)
  - Call fetchFunction on mount
  - Set up interval to refetch
  - Clear interval on unmount
  - Return: { data, loading, error, refetch, lastUpdated }

- Export function: useHouseholdSync()
  - Use usePolling to fetch household data every 30 seconds
  - Track lastSyncedAt timestamp
  - Compare with server timestamp to detect stale data
  - Show "New updates available" toast if stale
  - Return household data

Example usage:
const { data: household, refetch, lastUpdated } = useHouseholdSync();
```

**Polling Service (Backend):**
```javascript
// Add to household response
{
  "household": { ... },
  "serverTimestamp": Date.now(),
  "hasNewData": true  // Compare with client's last fetch
}
```

---

## Testing Checklist

### Manual Testing

```bash
# Test 1: Create household
curl -X POST http://localhost:3001/api/households \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Family"}'

# Test 2: Send invitation
curl -X POST http://localhost:3001/api/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"method":"email","recipient":"test2@test.com","role":"EDITOR"}'

# Test 3: Accept invitation (after registering test2@test.com)
curl -X POST http://localhost:3001/api/invitations/$INVITE_TOKEN/accept \
  -H "Authorization: Bearer $TOKEN2"

# Test 4: Get household members
curl http://localhost:3001/api/households/$HOUSEHOLD_ID/members \
  -H "Authorization: Bearer $TOKEN"
```

### Verification Checklist

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Create household | Admin role assigned | - [ ] Pass |
| Send email invitation | Invitation created | - [ ] Pass |
| Send phone invitation | Invitation created | - [ ] Pass |
| Accept invitation | User joins household | - [ ] Pass |
| Expired invitation | Error returned | - [ ] Pass |
| Change member role (admin) | Role updated | - [ ] Pass |
| Change role (non-admin) | 403 Forbidden | - [ ] Pass |
| Remove member (admin) | Member removed | - [ ] Pass |
| Leave household | Successfully left | - [ ] Pass |
| Polling refresh | Data updates every 30s | - [ ] Pass |

---

## Files Created in This Phase

```
backend/src/
├── controllers/
│   ├── householdController.js
│   └── invitationController.js
├── routes/
│   ├── households.js
│   └── invitations.js
└── utils/
    └── generateCode.js

frontend/src/
├── hooks/
│   └── usePolling.js
```

---

## Integration with Previous Phases

1. **Update server.js**:
```javascript
import householdRoutes from './routes/households.js';
import invitationRoutes from './routes/invitations.js';

app.use('/api/households', authenticate, householdRoutes);
app.use('/api/invitations', invitationRoutes);
```

2. **Use auth middleware** from Phase 2 for protected routes

---

## Completion Criteria

Phase 3 is complete when:

- [ ] Households can be created
- [ ] Invitations can be sent via email or phone
- [ ] Invitations can be accepted
- [ ] Role permissions enforced (Admin/Editor/Viewer)
- [ ] Members can be managed (role change, removal)
- [ ] Polling hook refreshes data every 30s
- [ ] All tests pass

---

## Next Phase Preview

**Phase 4: Transaction & Income Tracking** will:
- Add transaction CRUD operations
- Implement income tracking
- Add voice input with Web Speech API
- Set up Opik tracing for inputs

Before moving to Phase 4, ensure all Phase 3 tests pass!
