import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

    useEffect(() => {
        checkAppState();
    }, []);

    const checkAppState = async () => {
        try {
            setIsLoadingPublicSettings(true);
            setAuthError(null);

            // Mock App Settings
            setAppPublicSettings({ id: 'mock_app_id', public_settings: {} });
            
            // Check auth
            await checkUserAuth();
            setIsLoadingPublicSettings(false);
        } catch (error) {
            console.error('Unexpected error:', error);
            setAuthError({
                type: 'unknown',
                message: error.message || 'An unexpected error occurred'
            });
            setIsLoadingPublicSettings(false);
            setIsLoadingAuth(false);
        }
    };

    const checkUserAuth = async () => {
        try {
            // Now check if the user is authenticated
            setIsLoadingAuth(true);
            const currentUser = await apiClient.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAuthChecked(true);

            // If user auth fails, it might be an expired token
            if (error.status === 401 || error.status === 403) {
                setAuthError({
                    type: 'auth_required',
                    message: 'Authentication required'
                });
            }
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect) {
            // Use the SDK's logout method which handles token cleanup and redirect
            apiClient.auth.logout(window.location.href);
        } else {
            // Just remove the token without redirect
            apiClient.auth.logout();
        }
    };

    const navigateToLogin = () => {
        // Use the SDK's redirectToLogin method
        apiClient.auth.redirectToLogin(window.location.href);
    };

    const updateCurrentUser = async (profileData) => {
        const updated = await apiClient.auth.updateProfile(profileData);
        setUser(prev => ({ ...prev, ...profileData }));
        return updated;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            authChecked,
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState,
            updateCurrentUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
