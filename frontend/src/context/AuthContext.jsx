import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, clearToken, getMe } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const token = getToken();
        if (token) {
            getMe()
                .then((data) => {
                    setUserState(data.user);
                    setUser(data.user);
                })
                .catch(() => {
                    clearToken();
                    setUserState(null);
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
    };

    const logout = () => {
        clearToken();
        setUserState(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        setUserState(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
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
