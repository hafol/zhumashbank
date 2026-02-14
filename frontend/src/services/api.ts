import axios from 'axios';

// Если мы на Vercel — берем ссылку из переменных. Если дома — localhost.
// МЫ ПИШЕМ ССЫЛКУ ПРЯМО СЮДА, ЧТОБЫ НАВЕРНЯКА!
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const API_BASE_URL = 'https://zhumash-backend.onrender.com';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    date: string;
}

export interface DashboardData {
    balance: number;
    income: number;
    expense: number;
    budget: number;
    recentTransactions: Transaction[];
    categoryStats: Array<{ name: string; value: number }>;
}

export interface AIAdvice {
    insights: string[];
    forecast: string;
    summary: string;
}

// API Service
export const apiService = {
    // Authentication
    async register(email: string, password: string, name: string): Promise<{ message: string }> {
        const response = await api.post('/api/auth/register', { email, password, name });
        return response.data;
    },

    async login(email: string, password: string): Promise<{ token: string; user: User }> {
        const response = await api.post('/api/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        return response.data;
    },

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('current_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Failed to parse user from local storage', error);
            localStorage.removeItem('current_user');
            return null;
        }
    },

    // Dashboard
    async getDashboard(): Promise<DashboardData> {
        const response = await api.get('/api/dashboard');
        return response.data;
    },

    async addTransaction(data: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        description?: string;
    }): Promise<Transaction> {
        const response = await api.post('/api/transactions', data);
        return response.data;
    },

    async deleteTransaction(id: number): Promise<void> {
        await api.delete(`/api/transactions/${id}`);
    },

    async clearTransactions(): Promise<void> {
        await api.delete('/api/transactions');
    },

    // Budget
    async setBudget(amount: number): Promise<{ id: number; amount: number; month: string }> {
        const response = await api.post('/api/budget', { amount });
        return response.data;
    },

    // Get transactions by category (for chart)
    async getTransactionsByCategory(): Promise<Array<{ name: string; value: number }>> {
        const response = await api.get('/api/transactions/category');
        return response.data;
    },

    // AI Advisor
    async getAIAdvisor(lang: string = 'en'): Promise<AIAdvice> {
        const response = await api.get(`/api/ai/advisor?lang=${lang}`);
        return response.data;
    },

    // AI Chat
    async sendChatMessage(message: string, history: any[] = [], lang: string = 'en'): Promise<{ reply: string }> {
        const response = await api.post('/api/ai/chat', { message, history, lang });
        return response.data;
    },

    async getInvestmentAdvice(lang: string = 'en', currency: string = 'USD'): Promise<any> {
        const response = await api.get(`/api/ai/investments?lang=${lang}&currency=${currency}`);
        return response.data;
    },

    async getSimulation(scenario: string, lang: string = 'en', currency: string = 'USD'): Promise<any> {
        const response = await api.post('/api/ai/simulate', { scenario, lang, currency });
        return response.data;
    },

    // AI Statement Analysis
    async uploadStatement(file: File): Promise<{ transactions: any[] }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/upload-statement', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Batch Import
    async importTransactions(transactions: any[]): Promise<{ message: string; count: number }> {
        const response = await api.post('/api/transactions/batch', { transactions });
        return response.data;
    },

    // Receipt Scanner
    async scanReceipt(file: Blob): Promise<{ success: boolean; receipt: any }> {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/api/receipts/scan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async confirmReceipt(receiptId: number, data: any): Promise<{ success: boolean; transactionId: number }> {
        const response = await api.post(`/api/receipts/${receiptId}/confirm`, data);
        return response.data;
    },

    async getReceipts(): Promise<any[]> {
        const response = await api.get('/api/receipts');
        return response.data;
    },

    // Anomaly Detection
    async checkAnomaly(transactionId: number): Promise<{ anomaly: boolean; alert?: any }> {
        const response = await api.post('/api/anomalies/check', { transactionId });
        return response.data;
    },

    async getAnomalyAlerts(): Promise<any[]> {
        const response = await api.get('/api/anomalies/alerts');
        return response.data;
    },
};

export default apiService;
