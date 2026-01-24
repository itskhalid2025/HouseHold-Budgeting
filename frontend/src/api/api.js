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

// Wrapper for fetch to track loading state
async function trackedFetch(...args) {
    startRequest();
    try {
        const response = await window.fetch(...args);
        return response;
    } finally {
        stopRequest();
    }
}


// Helper for handling responses
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        // Log detailed error info for debugging
        console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: data.error,
            details: data.details || data.message || data,
            validationErrors: data.errors // Zod validation errors
        });
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
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

export async function getMonthlyIncomeTotal() {
    const response = await trackedFetch(`${API_BASE_URL}/incomes/monthly-total?_t=${Date.now()}`, {
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

export async function getGoalSummary() {
    const response = await trackedFetch(`${API_BASE_URL}/goals/summary?_t=${Date.now()}`, {
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

// ================== VOICE INPUT API ==================

export async function parseVoiceInput(transcript) {
    console.log('🎤 Voice Input:', transcript);
    const response = await trackedFetch(`${API_BASE_URL}/smart/entry`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: transcript })
    });

    // The Smart Controller now returns { success, count, entries: [...] }
    const result = await handleResponse(response);

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

export async function generateReport(reportType = 'weekly', dateStart = null, dateEnd = null) {
    console.log('📊 Generating report:', reportType);
    const response = await trackedFetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reportType, dateStart, dateEnd })
    });
    return handleResponse(response);
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
    const response = await trackedFetch(`${API_BASE_URL}/advisor/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message, conversationId })
    });
    return handleResponse(response);
}

export async function getRecommendations() {
    console.log('💡 Getting recommendations');
    const response = await trackedFetch(`${API_BASE_URL}/advisor/recommendations`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function generateChartConfig(query) {
    console.log('📈 Generating chart config:', query);
    const response = await trackedFetch(`${API_BASE_URL}/advisor/chart`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query })
    });
    return handleResponse(response);
}

export async function getConversationHistory(conversationId) {
    console.log('📜 Getting conversation history');
    const response = await trackedFetch(`${API_BASE_URL}/advisor/history/${conversationId}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function clearConversation(conversationId) {
    console.log('🗑️ Clearing conversation');
    const response = await trackedFetch(`${API_BASE_URL}/advisor/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

export default {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    createHousehold,
    getHousehold,
    joinHousehold,
    leaveHousehold,
    removeMember,
    updateMemberRole,
    sendInvitation,
    getInvitations,
    acceptInvitation,
    submitJoinRequest,
    getJoinRequests,
    getMyJoinRequestStatus,
    approveJoinRequest,
    rejectJoinRequest,
    addTransaction,
    getTransactions,
    getTransactionSummary,
    updateTransaction,
    deleteTransaction,
    addIncome,
    getIncomes,
    getMonthlyIncomeTotal,
    updateIncome,
    deleteIncome,
    addGoal,
    getGoals,
    getGoalSummary,
    updateGoal,
    deleteGoal,
    parseVoiceInput,
    getToken,
    getUser,
    clearToken,
    // Phase 6
    getReports,
    getLatestReport,
    generateReport,
    getReportById,
    chatWithAdvisor,
    getRecommendations,
    generateChartConfig,
    getConversationHistory,
    clearConversation
};
