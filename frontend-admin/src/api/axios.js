
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api/admin',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If unauthorized, clear token (but maybe don't redirect aggressively to avoid loops)
            // Ideally, let the AuthContext handle redirection based on state
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
        }
        return Promise.reject(error);
    }
);

export default api;
