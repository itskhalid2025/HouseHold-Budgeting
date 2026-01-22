/**
 * @fileoverview Authentication Context Provider
 *
 * Manages global authentication state, user profile data, and household information.
 * Provides login, logout, and session persistence logic for the entire frontend application.
 *
 * @module context/AuthContext
 * @requires react
 * @requires ../api/api
 */

import { createContext, useContext, useState, useEffect } from 'react';

import { getToken, getUser, setToken, setUser, clearToken, getMe, getHousehold } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);

    const [household, setHouseholdState] = useState(null);

    const refreshHousehold = async () => {
        try {
            const data = await getHousehold();
            setHouseholdState(data.household);
            return data.household;
        } catch (err) {
            console.error('Failed to refresh household', err);
        }
    };

    useEffect(() => {
        // Check for existing session on mount
        const token = getToken();
        if (token) {
            getMe()
                .then((data) => {
                    setUserState(data.user);
                    setUser(data.user);
                    if (data.user.householdId) {
                        return getHousehold().then(hData => setHouseholdState(hData.household));
                    }
                })
                .catch(() => {
                    clearToken();
                    setUserState(null);
                    setHouseholdState(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, token) => {
        setToken(token);
        setUser(userData);
        setUserState(userData);
        if (userData.householdId) {
            refreshHousehold();
        }
    };

    const logout = () => {
        clearToken();
        setUserState(null);
        setHouseholdState(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        setUserState(userData);
    };

    return (
        <AuthContext.Provider value={{
            user,
            household,
            currency: household?.currency || 'USD',
            loading,
            login,
            logout,
            updateUser,
            refreshHousehold,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
