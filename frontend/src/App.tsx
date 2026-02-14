import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Trash2,
    Globe,
    LogOut,
    DollarSign,
    Check,
    X,
    FileText,
    Tag,
    Upload,
    UploadCloud,
    Settings,
    Sun,
    Moon,
    Sparkles,
    MessageCircle,
    Send,
    Bot,
    Loader2,
    LayoutDashboard,
    Receipt,
    AlertTriangle,
    Eye,
    EyeOff
} from 'lucide-react';
import { translations, Language } from './translations';
import { cn } from './utils/cn';
import apiService, { DashboardData } from './services/api';
import InvestmentAdvisor from './InvestmentAdvisor';
import WhatIfSimulator from './WhatIfSimulator';
import { ReceiptScanner } from './components/ReceiptScanner';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import GamificationWidget from './components/GamificationWidget';
import GamificationProfile from './components/GamificationProfile';

// --- CURRENCY CONFIGURATION ---
type CurrencyCode = 'USD' | 'KZT' | 'CNY';

interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    label: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', label: 'US Dollar' },
    KZT: { code: 'KZT', symbol: '₸', label: 'Kazakhstani Tenge' },
    CNY: { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' }
};

// Categories
const INCOME_CATEGORIES = {
    en: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    ru: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарок', 'Другое'],
    kz: ['Жалақы', 'Фриланс', 'Инвестиция', 'Сыйлық', 'Басқа']
} as const;

const EXPENSE_CATEGORIES = {
    en: ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'],
    ru: ['Еда и рестораны', 'Транспорт', 'Коммунальные услуги', 'Развлечения', 'Покупки', 'Здоровье', 'Образование', 'Другое'],
    kz: ['Тамақ пен мейрамхана', 'Көлік', 'Коммуналдық қызметтер', 'Ойын-сауық', 'Сатып алу', 'Денсаулық', 'Білім', 'Басқа']
} as const;

const getLocalizedCategory = (category: string, lang: Language): string => {
    // Check expenses
    const expenseIndex = (EXPENSE_CATEGORIES.en as readonly string[]).indexOf(category);
    if (expenseIndex !== -1) {
        return EXPENSE_CATEGORIES[lang][expenseIndex];
    }

    // Check income
    const incomeIndex = (INCOME_CATEGORIES.en as readonly string[]).indexOf(category);
    if (incomeIndex !== -1) {
        return INCOME_CATEGORIES[lang][incomeIndex];
    }

    return category; // Fallback to original
};

// Color palette
const COLORS = [
    '#f43f5e', // Rose
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#64748b', // Slate
];

// Helper function to format currency
const formatCurrency = (amount: number, currencyCode: CurrencyCode): string => {
    const currency = CURRENCIES[currencyCode];
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace(currency.code, currency.symbol); // Force symbol usage if needed
};

// Transaction Item Component
const TransactionItem: React.FC<{
    transaction: any;
    onDelete: (id: string) => void;
    currency: CurrencyCode;
    language: Language;
}> = ({ transaction, onDelete, currency, language }) => {
    const isIncome = transaction.type === 'income';
    return (
        <div className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-xl transition-transform group-hover:scale-110",
                    isIncome ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                )}>
                    {isIncome ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                        {transaction.description || getLocalizedCategory(transaction.category, language)}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {new Date(transaction.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="h-1 w-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {getLocalizedCategory(transaction.category, language)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className={cn(
                    "text-sm font-bold",
                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                </p>
                <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>
    );
};

// Auth Component
interface AuthProps {
    onLogin: (user: User) => void;
    t: any;
}

const Auth: React.FC<AuthProps> = ({ onLogin, t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                if (!email || !password || !name) throw new Error('Please fill all fields');
                await apiService.register(email, password, name);
                const { user } = await apiService.login(email, password);
                onLogin(user);
            } else {
                if (!email || !password) throw new Error('Please enter email and password');
                const { user } = await apiService.login(email, password);
                onLogin(user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900 mb-4">
                            <Wallet className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.welcome}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{isRegister ? 'Create a new account' : 'Sign in to continue'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                                    placeholder="user@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.password}</label>
                            <div className="relative">
                                <LogOut className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                                    placeholder={t.enterPassword}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isRegister ? t.register : t.login)}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                        >
                            {isRegister ? t.hasAccount : t.noAccount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Transaction Form Component
interface TransactionFormProps {
    type: 'income' | 'expense';
    onSubmit: (data: any) => void;
    onClose: () => void;
    t: any;
    language: Language;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, onSubmit, onClose, t, language }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const categories = type === 'income' ? INCOME_CATEGORIES[language] : EXPENSE_CATEGORIES[language];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;
        onSubmit({ type, amount: parseFloat(amount), category, description, date });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                        placeholder="Description (optional)"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.amount}</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                        placeholder={t.enterAmount}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
                <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all appearance-none bg-white"
                        required
                    >
                        <option value="">{t.selectCategory}</option>
                        {categories.map((cat, index) => {
                            const englishCategories = type === 'income' ? INCOME_CATEGORIES.en : EXPENSE_CATEGORIES.en;
                            return <option key={cat} value={englishCategories[index]}>{cat}</option>;
                        })}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.date}</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                    required
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg">{t.save}</button>
            </div>
        </form>
    );
};

// AI Components
const AIAdvisor: React.FC<{ advice: any; loading: boolean; error: string | null; onRetry: () => void; t: any }> = ({ advice, loading, error, onRetry, t }) => {
    if (loading) return <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-8 animate-pulse text-center"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" /><p className="text-slate-500">Thinking...</p></div>;
    if (error) return <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 mb-8 flex items-center justify-between"><div className="flex items-center gap-3 text-red-600 dark:text-red-400"><X className="h-5 w-5" /><span className="text-sm font-medium">{error}</span></div><button onClick={onRetry} className="text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30">Retry</button></div>;
    if (!advice) return <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 mb-8 text-center text-slate-500"><p className="mb-4">{t.noAdvisorData}</p><button onClick={onRetry} className="text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">Check insights</button></div>;

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6 mb-8 relative group transition-all hover:shadow-xl">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-500 rounded-lg shadow-lg"><Sparkles className="h-4 w-4 text-white" /></div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.aiAdvisor}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">{t.insights}</h4>
                        <ul className="space-y-2">
                            {advice.insights.map((insight: string, i: number) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="text-indigo-500 font-bold">•</span>{insight}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-indigo-50/50">
                        <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">{t.forecast}</h4>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mb-3">{advice.forecast}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-indigo-100">{advice.summary}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIChatAssistant: React.FC<{ isOpen: boolean; onClose: () => void; messages: any[]; onSend: (msg: string) => void; isTyping: boolean; t: any }> = ({ isOpen, onClose, messages, onSend, isTyping, t }) => {
    const [input, setInput] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) { onSend(input); setInput(''); }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-[380px] h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 transition-all">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="bg-white/20 p-2 rounded-lg"><Bot className="h-5 w-5" /></div><h3 className="font-bold text-sm">{t.aiAssistant}</h3></div>
                <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-8"><Bot className="h-12 w-12 mb-2" /><p className="text-sm">{t.askAi}</p></div>}
                {messages.map((m, i) => <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}><div className={cn("max-w-[85%] p-3 rounded-2xl text-sm", m.role === 'user' ? "bg-emerald-500 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none")}>{m.content}</div></div>)}
                {isTyping && <div className="flex items-start"><div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl flex gap-1"><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" /><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.askAi} className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-emerald-500" />
                <button type="submit" disabled={!input.trim() || isTyping} className="bg-emerald-500 text-white p-2 rounded-xl disabled:opacity-50"><Send className="h-5 w-5" /></button>
            </form>
        </div>
    );
};

// Dashboard Content Props
interface DashboardProps {
    user: User;
    data: DashboardData | null;
    onLogout: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    refreshData: () => void;
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    advice: any;
    loadingAdvice: boolean;
    adviceError: string | null;
    fetchAIAdvice: () => void;
    activeTab: 'dashboard' | 'investments' | 'simulator' | 'receipts' | 'alerts';
    setActiveTab: (tab: 'dashboard' | 'investments' | 'simulator' | 'receipts' | 'alerts') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    user, data, onLogout, language, setLanguage, refreshData, currency, setCurrency,
    isDarkMode, setIsDarkMode, advice, loadingAdvice, fetchAIAdvice, adviceError, activeTab, setActiveTab
}) => {
    const t = translations[language];
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [aiTransactions, setAiTransactions] = useState<any[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isGamificationOpen, setIsGamificationOpen] = useState(false);

    const handleSendMessage = async (msg: string) => {
        setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
        setIsTyping(true);
        try {
            const history = chatMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
            const response = await apiService.sendChatMessage(msg, history, language);
            setChatMessages(prev => [...prev, { role: 'ai', content: response.reply }]);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'AI Assistant error. Please try again.';
            setChatMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        } finally { setIsTyping(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const response = await apiService.uploadStatement(file);
            setAiTransactions(response.transactions);
            setIsUploadModalOpen(false);
            setIsReviewOpen(true);
        } catch (error) { alert('Failed to analyze statement.'); } finally { setUploading(false); e.target.value = ''; }
    };

    const handleConfirmImport = async () => {
        try {
            await apiService.importTransactions(aiTransactions);
            setIsReviewOpen(false);
            setAiTransactions([]);
            refreshData();
        } catch (error) { alert('Failed to import.'); }
    };

    const expenseData = useMemo(() => {
        if (!data?.categoryStats) return [];
        return data.categoryStats.map(stat => ({ ...stat, name: getLocalizedCategory(stat.name, language) }));
    }, [data, language]);

    const handleAddTransaction = async (formData: any) => {
        try { await apiService.addTransaction(formData); refreshData(); setShowIncomeModal(false); setShowExpenseModal(false); }
        catch (error) { alert('Failed to save.'); }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!window.confirm('Delete this transaction?')) return;
        try { await apiService.deleteTransaction(Number(id)); refreshData(); } catch (error) { alert('Failed to delete.'); }
    };

    const handleClearTransactions = async () => {
        try { await apiService.clearTransactions(); refreshData(); alert('Data cleared.'); } catch (error) { alert('Failed to clear.'); }
    };

    const handleSetBudget = async () => {
        const budgetValue = parseFloat(budgetInput);
        if (isNaN(budgetValue) || budgetValue < 0) return;
        try { await apiService.setBudget(budgetValue); refreshData(); setShowBudgetModal(false); setBudgetInput(''); } catch (error) { alert('Failed.'); }
    };

    if (!data) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">Loading...</div>;
    const remainingBudget = (data.budget || 0) - (data.expense || 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl"><Wallet className="h-5 w-5 text-white" /></div>
                        <span className="font-semibold dark:text-white capitalize">{activeTab}</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl border dark:border-slate-700/50">
                        {[
                            { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
                            { id: 'investments', label: t.investments, icon: TrendingUp },
                            { id: 'simulator', label: t.simulator || 'Simulator', icon: Sparkles },
                            { id: 'receipts', label: t.receipts, icon: Receipt },
                            { id: 'alerts', label: t.alerts, icon: AlertTriangle }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <tab.icon size={18} />{tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsUploadModalOpen(true)} className="p-2 text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Upload className="h-5 w-5" /></button>
                        <button onClick={() => setShowSettingsModal(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Settings className="h-5 w-5" /></button>
                        <button onClick={onLogout} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><LogOut className="h-5 w-5" /></button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'dashboard' ? (
                    <>
                        <AIAdvisor advice={advice} loading={loadingAdvice} error={adviceError} onRetry={fetchAIAdvice} t={t} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                    <h3 className="text-slate-500 text-sm font-medium mb-1">{t.balance}</h3>
                                    <p className="text-3xl font-bold dark:text-white">{formatCurrency(data.balance, currency)}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                    <h3 className="text-slate-500 text-sm font-medium mb-1">{t.totalIncome}</h3>
                                    <p className="text-3xl font-bold text-emerald-600">{formatCurrency(data.income, currency)}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                    <h3 className="text-slate-500 text-sm font-medium mb-1">{t.totalExpense}</h3>
                                    <p className="text-3xl font-bold text-rose-600">{formatCurrency(data.expense, currency)}</p>
                                </div>
                        </div>

                        {/* Gamification Widget */}
                        <div className="mb-8 cursor-pointer" onClick={() => setIsGamificationOpen(true)}>
                            <GamificationWidget 
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <div><h3 className="font-semibold dark:text-white">{t.monthlyBudget}</h3><p className="text-sm text-slate-500">{t.keepTrack}</p></div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold dark:text-white">{formatCurrency(remainingBudget, currency)}</p>
                                    <button onClick={() => setShowBudgetModal(true)} className="text-xs text-emerald-600 font-bold hover:underline">Set Budget</button>
                                </div>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-500", remainingBudget < 0 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min((data.expense / (data.budget || 1)) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setShowIncomeModal(true)} className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all"><Plus size={20} />{t.addIncome}</button>
                            <button onClick={() => setShowExpenseModal(true)} className="p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none transition-all"><Plus size={20} />{t.addExpense}</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                <h3 className="font-semibold dark:text-white mb-6 uppercase text-sm tracking-wider">{t.expensesByCategory}</h3>
                                <div className="h-[300px]">
                                    {expenseData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {expenseData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50"><Globe size={48} className="mb-2" /><p className="text-sm">{t.noExpenseData}</p></div>}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold dark:text-white">{t.recentTransactions}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsUploadModalOpen(true)} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100/50"><Upload size={14} className="inline mr-1" />PDF</button>
                                        <button onClick={() => setIsClearConfirmOpen(true)} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-100/50"><Trash2 size={14} className="inline mr-1" />{t.clearAll}</button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {data.recentTransactions?.length ? data.recentTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} onDelete={handleDeleteTransaction} currency={currency} language={language} />)
                                        : <div className="text-center py-12 text-slate-400"><p>{t.noTransactions}</p></div>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'investments' ? (
                    <InvestmentAdvisor language={language} currency={currency} isDarkMode={isDarkMode} />
                ) : activeTab === 'simulator' ? (
                    <WhatIfSimulator language={language} currency={currency} isDarkMode={isDarkMode} />
                ) : activeTab === 'receipts' ? (
                    <div className="max-w-2xl"><ReceiptScanner language={language} isDarkMode={isDarkMode} /></div>
                ) : (
                    <div className="max-w-4xl"><AnomalyAlerts language={language} isDarkMode={isDarkMode} /></div>
                )}
            </main>

            {/* Gamification Modal */}
            <GamificationProfile 
                isOpen={isGamificationOpen}
                onClose={() => setIsGamificationOpen(false)}
                language={language}
                isDarkMode={isDarkMode}
            />

            <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 p-4 bg-emerald-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-all z-40"><MessageCircle size={24} /></button>
            <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={chatMessages} onSend={handleSendMessage} isTyping={isTyping} t={t} />

            <Modal isOpen={showIncomeModal} onClose={() => setShowIncomeModal(false)} title={t.addIncome}><TransactionForm type="income" onSubmit={handleAddTransaction} onClose={() => setShowIncomeModal(false)} t={t} language={language} /></Modal>
            <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title={t.addExpense}><TransactionForm type="expense" onSubmit={handleAddTransaction} onClose={() => setShowExpenseModal(false)} t={t} language={language} /></Modal>
            <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title={t.monthlyBudget}>
                <div className="space-y-4">
                    <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="0.00" className="w-full p-3 border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl" />
                    <div className="flex gap-3"><button onClick={() => setShowBudgetModal(false)} className="flex-1 py-3 border dark:border-slate-600 dark:text-slate-300 rounded-xl">{t.cancel}</button><button onClick={handleSetBudget} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold">{t.save}</button></div>
                </div>
            </Modal>
            <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title={t.settings}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">{t.language}</label>
                        <div className="flex gap-2">{(['en', 'ru', 'kz'] as Language[]).map(lang => <button key={lang} onClick={() => setLanguage(lang)} className={cn("flex-1 py-2 rounded-lg text-sm", language === lang ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300")}>{lang === 'en' ? 'EN' : lang === 'ru' ? 'РУ' : 'ҚАЗ'}</button>)}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">Currency</label>
                        <div className="grid grid-cols-3 gap-2">{(Object.values(CURRENCIES)).map(curr => <button key={curr.code} onClick={() => setCurrency(curr.code)} className={cn("py-2 rounded-lg text-sm", currency === curr.code ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-nowrap dark:text-slate-300")}>{curr.symbol} {curr.code}</button>)}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-white">{t.theme}</label>
                        <div className="flex gap-2">
                            <button onClick={() => setIsDarkMode(false)} className={cn("flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2", !isDarkMode ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 dark:text-slate-300")}><Sun size={16} />{t.lightMode}</button>
                            <button onClick={() => setIsDarkMode(true)} className={cn("flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2", isDarkMode ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 dark:text-slate-300")}><Moon size={16} />{t.darkMode}</button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isClearConfirmOpen} onClose={() => setIsClearConfirmOpen(false)} title="Clear Data">
                <div className="space-y-4">
                    <p className="text-sm p-4 bg-rose-50 text-rose-600 rounded-xl">{t.confirmClear}</p>
                    <div className="flex gap-3"><button onClick={() => setIsClearConfirmOpen(false)} className="flex-1 py-3 border rounded-xl">{t.cancel}</button><button onClick={() => { handleClearTransactions(); setIsClearConfirmOpen(false); }} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold">{t.clearAll}</button></div>
                </div>
            </Modal>

            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={cn("rounded-2xl w-full max-w-md p-6 relative", isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900")}>
                        <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Upload size={24} className="text-emerald-500" />Import PDF</h2>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 transition-colors cursor-pointer relative">
                            <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                            {uploading ? <Loader2 size={40} className="animate-spin text-emerald-500" /> : <UploadCloud size={48} className="text-slate-400" />}
                            <span className="text-sm font-medium">{uploading ? "Analyzing..." : "Click or Drag PDF"}</span>
                        </div>
                    </div>
                </div>
            )}

            {isReviewOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={cn("rounded-2xl w-full max-w-4xl p-6 relative max-h-[90vh] flex flex-col", isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900")}>
                        <button onClick={() => setIsReviewOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-4">Review Imports</h2>
                        <div className="overflow-y-auto flex-1 mb-6 border rounded-xl border-slate-200 dark:border-slate-700">
                            <table className="w-full text-left text-sm">
                                <thead className={cn("sticky top-0", isDarkMode ? "bg-slate-700" : "bg-slate-100")}><tr><th className="p-3">Date</th><th className="p-3">Desc</th><th className="p-3">Cat</th><th className="p-3 text-right">Amount</th></tr></thead>
                                <tbody>
                                    {aiTransactions.map((tx, i) => (
                                        <tr key={i} className="border-b dark:border-slate-700 last:border-0">
                                            <td className="p-3 text-slate-500">{tx.date}</td>
                                            <td className="p-3 font-medium">{tx.description}</td>
                                            <td className="p-3"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px]">{getLocalizedCategory(tx.category, language)}</span></td>
                                            <td className={cn("p-3 text-right font-bold", tx.type === 'income' ? "text-emerald-500" : "text-rose-500")}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setIsReviewOpen(false)} className="px-4 py-2">Cancel</button>
                            <button onClick={handleConfirmImport} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"><Check size={18} />Import {aiTransactions.length} items</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gamification Profile Modal */}
            <GamificationProfile
                isOpen={isGamificationOpen}
                onClose={() => setIsGamificationOpen(false)}
                language={language}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

// App component
const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [currency, setCurrency] = useState<CurrencyCode>(() => (localStorage.getItem('finance_currency') as CurrencyCode) || 'USD');
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('finance_theme') === 'dark');

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('finance_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => { localStorage.setItem('finance_currency', currency); }, [currency]);

    const [advice, setAdvice] = useState<any>(null);
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [adviceError, setAdviceError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'investments' | 'simulator' | 'receipts' | 'alerts'>('dashboard');

    const loadDashboard = async () => {
        try { const data = await apiService.getDashboard(); setDashboardData(data); }
        catch (error) { apiService.logout(); setUser(null); }
    };

    const fetchAIAdvice = async () => {
        setLoadingAdvice(true);
        setAdviceError(null);
        try { const aiAdvice = await apiService.getAIAdvisor(language); setAdvice(aiAdvice); }
        catch (error: any) { setAdviceError(error.response?.data?.error || 'AI Advisor unavailable'); }
        finally { setLoadingAdvice(false); }
    };

    useEffect(() => { const curr = apiService.getCurrentUser(); if (curr) setUser(curr); }, []);
    useEffect(() => { if (user) { loadDashboard(); fetchAIAdvice(); } }, [user, language]);

    const handleLogin = (user: User) => { setUser(user); loadDashboard(); };
    const handleLogout = () => { apiService.logout(); setUser(null); setDashboardData(null); };

    if (!user) return <Auth onLogin={handleLogin} t={translations[language]} />;

    return (
        <Dashboard
            user={user} data={dashboardData} onLogout={handleLogout} language={language} setLanguage={setLanguage}
            refreshData={loadDashboard} currency={currency} setCurrency={setCurrency} isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode} advice={advice} loadingAdvice={loadingAdvice} adviceError={adviceError}
            fetchAIAdvice={fetchAIAdvice} activeTab={activeTab} setActiveTab={setActiveTab}
        />
    );
};

export default App;

export interface User {
  id: number;
  name: string;
  email: string;
}
