import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // Decode the token to get basic user info
                    const decoded = JSON.parse(atob(token.split('.')[1]));
                    setUser({ 
                        id: decoded.id, 
                        student: decoded.student, 
                        name: decoded.name, 
                        email: decoded.email 
                    });
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error("Invalid token:", error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            // Auto-login after successful registration
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        api.defaults.headers.common['Authorization'] = '';
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);