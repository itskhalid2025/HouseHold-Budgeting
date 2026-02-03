/**
 * @fileoverview Frontend API client
 *
 * Provides a centralised interface for all backend API interactions using Fetch.
 * Handles authentication headers, token persistence, and error response formatting.
 *
 * @module api/api
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Request tracking for "Waking up" notification
let activeRequests = 0;
let slowTimer = null;

function startRequest() {
    activeRequests++;
    if (!slowTimer) {
        slowTimer = setTimeout(() => {
            if (activeRequests > 0) {
                window.dispatchEvent(new CustomEvent('api-slow'));
            }
        }, 1500); // Trigger after 1.5 seconds
    }
}

function stopRequest() {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        if (slowTimer) {
            clearTimeout(slowTimer);
            slowTimer = null;
        }
        window.dispatchEvent(new CustomEvent('api-ready'));
    }
}

// AI Request tracking
function startAIRequest() {
    window.dispatchEvent(new CustomEvent('ai-processing-start'));
}

function stopAIRequest() {
    window.dispatchEvent(new CustomEvent('ai-processing-complete'));
}

// Wrapper for fetch to track loading state
async function trackedFetch(...args) {
    if (!navigator.onLine) {
        throw new Error('Offline');
    }
    startRequest();
    try {
        const response = await window.fetch(...args);
        return response;
    } finally {
        stopRequest();
    }
}


// Helper for handling responses
// Helper for handling responses
async function handleResponse(response) {
    // 1. Check for AI Warning Header
    const warning = response.headers.get('X-AI-Warning');
    if (warning) {
        window.dispatchEvent(new CustomEvent('ai-warning', { detail: warning }));
    }

    // 2. Parse JSON safely
    const contentType = response.headers.get("content-type");
    let data = {};

    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        // Fallback for non-JSON responses might be needed but usually our API is JSON.
        // If 204 No Content, data stays empty.
    }

    if (!response.ok) {
        // Check for specific error codes for Events
        if (data.code && (
            data.code.startsWith('LIMIT_') ||
            data.code.startsWith('FEATURE_') ||
            data.code.includes('RESTRICTED')
        )) {
            window.dispatchEvent(new CustomEvent('ai-error', { detail: data.error }));
        }

        // Log detailed error info for debugging
        console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: data.error,
            details: data.details || data.message || data,
            validationErrors: data.errors // Zod validation errors
        });
        const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
        if (data.errors) error.validationErrors = data.errors;
        throw error;
    }
    return data;
}

// Get stored token
export function getToken() {
    return localStorage.getItem('token');
}

// Set token
export function setToken(token) {
    localStorage.setItem('token', token);
}

// Clear token
export function clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Get stored user
export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set user
export function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Auth headers
function authHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
}

// ================== AUTH API ==================

export async function register(userData) {
    const response = await trackedFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await handleResponse(response);
    if (data.token) {
        setToken(data.token);
        setUser(data.user);
    }
    return data;
}

export async function login(email, password) {
    const response = await trackedFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
        setToken(data.token);
        setUser(data.user);
    }
    return data;
}

export async function logout() {
    clearToken();
}

export async function forgotPassword(email) {
    const response = await trackedFetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(response);
}

export async function resetPassword(token, newPassword) {
    const response = await trackedFetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(response);
}

export async function getMe() {
    const response = await trackedFetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateProfile(userData) {
    const response = await trackedFetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(userData)
    });
    const data = await handleResponse(response);
    if (data.user) {
        setUser(data.user);
    }
    return data;
}

// ================== HOUSEHOLD API ==================

export async function createHousehold(name) {
    const response = await trackedFetch(`${API_BASE_URL}/households`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name })
    });
    return handleResponse(response);
}

export async function getHousehold() {
    const response = await trackedFetch(`${API_BASE_URL}/households?_t=${Date.now()}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateHousehold(data) {
    const response = await trackedFetch(`${API_BASE_URL}/households`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function joinHousehold(inviteCode) {
    const response = await trackedFetch(`${API_BASE_URL}/households/join`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ inviteCode })
    });
    return handleResponse(response);
}

export async function leaveHousehold() {
    const response = await trackedFetch(`${API_BASE_URL}/households/leave`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function removeMember(memberId) {
    const response = await trackedFetch(`${API_BASE_URL}/households/members/${memberId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateMemberRole(memberId, role) {
    const response = await trackedFetch(`${API_BASE_URL}/households/members/${memberId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role })
    });
    return handleResponse(response);
}

export async function getMembers() {
    const response = await trackedFetch(`${API_BASE_URL}/households/members`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== INVITATION API ==================

export async function sendInvitation(email, role) {
    const response = await trackedFetch(`${API_BASE_URL}/invitations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, role })
    });
    return handleResponse(response);
}

export async function getInvitations() {
    const response = await trackedFetch(`${API_BASE_URL}/invitations`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function acceptInvitation(token) {
    const response = await trackedFetch(`${API_BASE_URL}/invitations/${token}/accept`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== JOIN REQUEST API ==================

export async function submitJoinRequest(inviteCode) {
    const response = await trackedFetch(`${API_BASE_URL}/join-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ inviteCode })
    });
    return handleResponse(response);
}

export async function getJoinRequests() {
    const response = await trackedFetch(`${API_BASE_URL}/join-requests`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getMyJoinRequestStatus() {
    const response = await trackedFetch(`${API_BASE_URL}/join-requests/my-status`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function approveJoinRequest(requestId, role) {
    const response = await trackedFetch(`${API_BASE_URL}/join-requests/${requestId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ role })
    });
    return handleResponse(response);
}

export async function rejectJoinRequest(requestId) {
    const response = await trackedFetch(`${API_BASE_URL}/join-requests/${requestId}/reject`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== TRANSACTION API ==================

export async function addTransaction(transactionData) {
    const response = await trackedFetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
}

export async function getTransactions(params = {}) {
    const queryParams = new URLSearchParams(params);
    queryParams.append('_t', Date.now()); // Cache busting
    const response = await trackedFetch(`${API_BASE_URL}/transactions?${queryParams.toString()}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getTransactionSummary(params = {}) {
    const queryParams = new URLSearchParams(params);
    queryParams.append('_t', Date.now());
    const response = await trackedFetch(`${API_BASE_URL}/transactions/summary?${queryParams.toString()}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateTransaction(id, data) {
    const response = await trackedFetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function deleteTransaction(id) {
    const response = await trackedFetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== INCOME API ==================

export async function addIncome(incomeData) {
    console.log('📤 Sending addIncome request:', JSON.stringify(incomeData, null, 2));
    const response = await trackedFetch(`${API_BASE_URL}/incomes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(incomeData)
    });
    return handleResponse(response);
}

export async function getIncomes(active = true) {
    const response = await trackedFetch(`${API_BASE_URL}/incomes?active=${active}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getMonthlyIncomeTotal(params = {}) {
    const queryParams = new URLSearchParams(params);
    queryParams.append('_t', Date.now());
    const response = await trackedFetch(`${API_BASE_URL}/incomes/monthly-total?${queryParams.toString()}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateIncome(id, data) {
    const response = await trackedFetch(`${API_BASE_URL}/incomes/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function deleteIncome(id) {
    const response = await trackedFetch(`${API_BASE_URL}/incomes/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== GOALS (SAVINGS) API ==================

export async function addGoal(goalData) {
    const response = await trackedFetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(goalData)
    });
    return handleResponse(response);
}

export async function getGoals(active = true) {
    const response = await trackedFetch(`${API_BASE_URL}/goals?active=${active}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getGoalSummary(params = {}) {
    const queryParams = new URLSearchParams(params);
    queryParams.append('_t', Date.now());
    const response = await trackedFetch(`${API_BASE_URL}/goals/summary?${queryParams.toString()}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateGoal(id, data) {
    const response = await trackedFetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function deleteGoal(id) {
    const response = await trackedFetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// Add funds to a goal
export async function addContribution(goalId, amountOrData) {
    let payload = {};
    if (typeof amountOrData === 'object') {
        payload = amountOrData;
    } else {
        payload = { amount: amountOrData };
    }

    console.log('💰 Adding contribution:', { goalId, ...payload });
    const response = await trackedFetch(`${API_BASE_URL}/goals/${goalId}/contribute`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
}

// ================== VOICE INPUT API ==================

export async function parseVoiceInput(input) {
    console.log('🎤 Smart Input:', input);
    startAIRequest(); // Start AI tracking
    try {
        let response;
        const token = getToken();
        // Headers for FormData (let browser set Content-Type)
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Text handling headers (requires Content-Type)
        const authHeaders = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };

        if (input instanceof Blob) {
            console.log('🎤 Sending Audio File...');
            const formData = new FormData();
            formData.append('audio', input, 'voice-input.webm');

            response = await trackedFetch(`${API_BASE_URL}/smart/entry`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
        } else {
            console.log('📝 Sending Text...');
            response = await trackedFetch(`${API_BASE_URL}/smart/entry`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ text: input })
            });
        }

        // The Smart Controller now returns { success, count, entries: [...] }
        const result = await handleResponse(response);
        console.log('🎤 Smart Entry Result:', result); // DEBUG

        // Handle multiple entries
        if (result.success && result.entries && result.entries.length > 0) {
            // If multiple entries, summarize
            if (result.count > 1) {
                const totalAmount = result.entries.reduce((sum, e) => sum + parseFloat(e.record.amount), 0);
                const descriptions = result.entries.map(e => e.classification.description).join(', ');

                return {
                    isCreated: true,
                    type: 'Multiple',
                    description: descriptions,
                    amount: totalAmount.toFixed(2),
                    count: result.count,
                    entries: result.entries
                };
            } else {
                // Single entry - return as before
                const entry = result.entries[0];
                return {
                    isCreated: true,
                    action: result.action,
                    table: entry.table,
                    description: entry.classification.description,
                    amount: entry.record.amount,
                    date: entry.record.date || entry.record.startDate,
                    type: entry.classification.type,
                    category: entry.classification.category
                };
            }
        }

        return result;
    } finally {
        stopAIRequest(); // Stop AI tracking
    }
}

export async function analyzeImage(files) {
    console.log('🖼️ Analyzing Image(s)...');
    startAIRequest();
    try {
        const token = getToken();
        // Headers (let browser set Content-Type for FormData)
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formData = new FormData();

        // Handle array of files
        if (Array.isArray(files)) {
            files.forEach(file => {
                formData.append('images', file);
            });
        } else {
            formData.append('images', files); // Fallback for single file
        }

        const response = await trackedFetch(`${API_BASE_URL}/smart/analyze-image`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const result = await handleResponse(response);
        console.log('🖼️ Image Analysis Result:', result);

        // Standardize output format to match voice/text entry
        if (result.success && result.entries && result.entries.length > 0) {
            if (result.count > 1) {
                const totalAmount = result.entries.reduce((sum, e) => sum + parseFloat(e.record.amount), 0);
                const descriptions = result.entries.map(e => e.classification.description).join(', ');
                return {
                    isCreated: true,
                    type: 'Multiple (Receipt)',
                    description: descriptions,
                    amount: totalAmount.toFixed(2),
                    count: result.count,
                    entries: result.entries
                };
            } else {
                const entry = result.entries[0];
                return {
                    isCreated: true,
                    action: result.action,
                    table: entry.table,
                    description: entry.classification.description,
                    amount: entry.record.amount,
                    date: entry.record.date || entry.record.startDate,
                    type: entry.classification.type,
                    category: entry.classification.category
                };
            }
        }
        return result;
    } finally {
        stopAIRequest();
    }
}

// ================== PHASE 6: REPORTS API ==================

export async function getReports() {
    console.log('📊 Fetching reports');
    const response = await trackedFetch(`${API_BASE_URL}/reports`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getLatestReport(type = 'weekly') {
    console.log('📊 Fetching latest report:', type);
    const response = await trackedFetch(`${API_BASE_URL}/reports/latest?type=${type}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function generateReport(reportType = 'weekly', dateStart = null, dateEnd = null, userIds = []) {
    console.log('📊 Generating report:', reportType, userIds?.length ? `for ${userIds.length} users` : 'household');
    startAIRequest();
    try {
        const response = await trackedFetch(`${API_BASE_URL}/reports/generate`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ reportType, dateStart, dateEnd, userIds })
        });
        return handleResponse(response);
    } finally {
        stopAIRequest();
    }
}

export async function getReportById(id) {
    console.log('📊 Fetching report:', id);
    const response = await trackedFetch(`${API_BASE_URL}/reports/${id}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== PHASE 6: ADVISOR API ==================

export async function chatWithAdvisor(message, conversationId = null) {
    console.log('🤖 Sending to advisor:', message.substring(0, 50));
    startAIRequest();
    try {
        const response = await trackedFetch(`${API_BASE_URL}/advisor/chat`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message, conversationId })
        });
        return handleResponse(response);
    } finally {
        stopAIRequest();
    }
}

export async function getRecommendations() {
    console.log('💡 Getting recommendations');
    startAIRequest();
    try {
        const response = await trackedFetch(`${API_BASE_URL}/advisor/recommendations`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    } finally {
        stopAIRequest();
    }
}

export async function generateChartConfig(query) {
    console.log('📈 Generating chart config:', query);
    startAIRequest();
    try {
        const response = await trackedFetch(`${API_BASE_URL}/advisor/chart`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ query })
        });
        return handleResponse(response);
    } finally {
        stopAIRequest();
    }
}

export async function getConversationHistory(conversationId) {
    console.log('📜 Getting conversation history');
    const response = await trackedFetch(`${API_BASE_URL}/advisor/history/${conversationId}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function clearConversation(conversationId) {
    console.log('🧹 Clearing conversation');
    const response = await trackedFetch(`${API_BASE_URL}/advisor/history/${conversationId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== ADMIN API ==================

export async function adminLogin(email, password) {
    const response = await trackedFetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
}

export async function getAdminMe() {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
}

export async function inviteAdmin(email) {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/invite`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
    return handleResponse(response);
}

export async function registerAdmin(data) {
    const response = await trackedFetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function getAdminUsers() {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/users?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
}

export async function getAdminHouseholds() {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/households?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
}

export async function getAdminDashboardStats() {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/dashboard-stats?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
}

export async function toggleUserAiRestriction(userId, isRestricted) {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/users/${userId}/restriction`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAiRestricted: isRestricted })
    });
    return handleResponse(response);
}



export const updateUserAdmin = async (userId, data) => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteUserAdmin = async (userId) => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

export const updateAllUsersAiLimits = async (aiSettings) => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/users/ai-limits/bulk`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aiSettings }),
    });
    return handleResponse(response);
};

export const updateHouseholdAdmin = async (householdId, data) => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/households/${householdId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteHouseholdAdmin = async (householdId) => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/households/${householdId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

export const getAdminAiStats = async (period = 'month') => {
    const token = localStorage.getItem('adminToken');
    const response = await trackedFetch(`${API_BASE_URL}/admin/ai-stats?period=${period}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

// ================== GAMIFICATION API ==================

export async function getGamificationStatus() {
    const response = await trackedFetch(`${API_BASE_URL}/gamification/status`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== DYNAMIC INSIGHTS API ==================

/**
 * Get daily AI-generated financial news and motivation
 * @returns {Promise<Object>}
 */
export async function getDailyInsight() {
    const response = await trackedFetch(`${API_BASE_URL}/insights/daily`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getLeaderboard(type = 'global', scope = 'country') {
    console.log('🏆 Fetching leaderboard:', type, scope);
    const response = await trackedFetch(`${API_BASE_URL}/gamification/leaderboard?type=${type}&scope=${scope}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}


