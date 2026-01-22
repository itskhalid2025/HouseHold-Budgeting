import axios from './axios';

// ================== ADMIN API SERVICE ==================

const api = {
    // ---- Dashboard ----
    getDashboardStats: async () => {
        const response = await axios.get('/dashboard');
        return response.data;
    },

    // ---- Users ----
    getUsers: async (page = 1, limit = 20, search = '') => {
        const response = await axios.get('/users', { params: { page, limit, search } });
        return response.data;
    },

    getUserDetail: async (id) => {
        const response = await axios.get(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id, data) => {
        const response = await axios.patch(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axios.delete(`/users/${id}`);
        return response.data;
    },

    // ---- Households ----
    getHouseholds: async (page = 1, limit = 20, search = '') => {
        const response = await axios.get('/households', { params: { page, limit, search } });
        return response.data;
    },

    getHouseholdDetail: async (id) => {
        const response = await axios.get(`/households/${id}`);
        return response.data;
    },

    updateHousehold: async (id, data) => {
        const response = await axios.patch(`/households/${id}`, data);
        return response.data;
    },

    deleteHousehold: async (id) => {
        const response = await axios.delete(`/households/${id}`);
        return response.data;
    },

    // ---- Analytics ----
    getAnalytics: async (timeRange = '30d') => {
        const response = await axios.get('/analytics', { params: { timeRange } });
        return response.data;
    },

    // ---- Reports ----
    generateReport: async (config) => {
        const response = await axios.post('/reports/generate', config);
        return response.data;
    },

    getReports: async () => {
        const response = await axios.get('/reports');
        return response.data;
    },

    downloadReport: async (id) => {
        const response = await axios.get(`/reports/${id}/download`, { responseType: 'blob' });
        return response.data;
    },

    // ---- Audit Log ----
    getAuditLog: async (page = 1, limit = 50) => {
        const response = await axios.get('/audit-log', { params: { page, limit } });
        return response.data;
    },
};

export default api;
