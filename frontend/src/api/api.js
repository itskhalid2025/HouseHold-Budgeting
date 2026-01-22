// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Helper for handling responses
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(response);
}

export async function resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    return handleResponse(response);
}

export async function getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== HOUSEHOLD API ==================

export async function createHousehold(name) {
    const response = await fetch(`${API_BASE_URL}/households`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name })
    });
    return handleResponse(response);
}

export async function getHousehold() {
    const response = await fetch(`${API_BASE_URL}/households`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function joinHousehold(inviteCode) {
    const response = await fetch(`${API_BASE_URL}/households/join`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ inviteCode })
    });
    return handleResponse(response);
}

export async function leaveHousehold() {
    const response = await fetch(`${API_BASE_URL}/households/leave`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== INVITATION API ==================

export async function sendInvitation(email, role) {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, role })
    });
    return handleResponse(response);
}

export async function getInvitations() {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function acceptInvitation(token) {
    const response = await fetch(`${API_BASE_URL}/invitations/${token}/accept`, {
        method: 'POST',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== TRANSACTION API ==================

export async function addTransaction(transactionData) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
}

export async function getTransactions(params = {}) {
    // Build query string
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/transactions${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getTransactionSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/transactions/summary${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateTransaction(id, data) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function deleteTransaction(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== INCOME API ==================

export async function addIncome(incomeData) {
    const response = await fetch(`${API_BASE_URL}/incomes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(incomeData)
    });
    return handleResponse(response);
}

export async function getIncomes(active = true) {
    const response = await fetch(`${API_BASE_URL}/incomes?active=${active}`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function getMonthlyIncomeTotal() {
    const response = await fetch(`${API_BASE_URL}/incomes/monthly-total`, {
        headers: authHeaders()
    });
    return handleResponse(response);
}

export async function updateIncome(id, data) {
    const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}

export async function deleteIncome(id) {
    const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
}

// ================== VOICE INPUT API ==================

export async function parseVoiceInput(transcript) {
    // This endpoint will be implemented in Phase 4 backend
    // For now, we can structure it but it might return 501 Not Implemented
    // const response = await fetch(`${API_BASE_URL}/voice/parse`, { ... });

    // Placeholder mock response until backend is ready
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                description: transcript,
                amount: null,
                date: new Date().toISOString().split('T')[0]
            });
        }, 500);
    });
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
    sendInvitation,
    getInvitations,
    acceptInvitation,
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
    parseVoiceInput,
    getToken,
    getUser,
    clearToken
};
