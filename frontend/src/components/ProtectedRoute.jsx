/**
 * @fileoverview ProtectedRoute Component
 *
 * Handles route protection for authenticated users and public route redirection.
 * Utilises AuthContext for authentication state and React Router for navigation.
 *
 * @module components/ProtectedRoute
 * @requires react-router-dom
 * @requires ../context/AuthContext
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // NEW: Force new users to join/create a household
    if (!user?.householdId && location.pathname !== '/household') {
        return <Navigate to="/household" replace />;
    }

    return children;
}

/**
 * PublicRoute - Wraps routes that should only be accessible when NOT logged in
 * Redirects to dashboard if user is already authenticated
 */
export function PublicRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect logic:
        // 1. If no household, go to /household (Priority 1)
        // 2. Else go to where they tried to go, or dashboard
        if (!user?.householdId) {
            return <Navigate to="/household" replace />;
        }

        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return children;
}

export default ProtectedRoute;
