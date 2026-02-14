import axios from 'axios';

// МЫ ПИШЕМ ССЫЛКУ ПРЯМО СЮДА, ЧТОБЫ НАВЕРНЯКА!
// (раньше использовалась переменная окружения или localhost)
// const api = axios.create({
//    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
// });

const api = axios.create({
    baseURL: 'https://zhumash-backend.onrender.com/api',
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
