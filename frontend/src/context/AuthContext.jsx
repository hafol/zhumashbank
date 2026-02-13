import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { translations } from '../translations';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedLanguage = localStorage.getItem('language') || 'en';
        const storedTheme = localStorage.getItem('theme') || 'dark';
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLanguage(storedLanguage);
        setTheme(storedTheme);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (name, email, password) => {
        await api.post('/auth/register', { name, email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const t = (key) => {
        const trans = translations[language] || translations.en;
        return trans[key] || key;
    };

    const setLanguageValue = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const setThemeValue = (themeValue) => {
        setTheme(themeValue);
        localStorage.setItem('theme', themeValue);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading,
            language,
            setLanguage: setLanguageValue,
            theme,
            setTheme: setThemeValue,
            t
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
