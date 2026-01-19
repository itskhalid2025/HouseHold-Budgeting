
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const token = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminUser');

        if (token && storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post('/auth/login', { identifier, password });
            const { admin, token } = response.data;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(admin));
            setAdmin(admin);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
