import { createContext, useContext, useState, useEffect } from 'react';
import { setTokens, clearTokens, getStoredTokens, apiFetch } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getStoredTokens();
        if (stored.accessToken) {
            apiFetch('/auth/me')
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error('Not authenticated');
                })
                .then((userData) => setUser(userData))
                .catch(() => {
                    clearTokens();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        setUser(userData);
    };

    const logout = async () => {
        const stored = getStoredTokens();
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: stored.refreshToken }),
            });
        } catch {
            // ignore
        }
        clearTokens();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
