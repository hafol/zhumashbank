import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Sparkles,
    Play,
    Calendar,
    TrendingUp,
    AlertCircle,
    Loader2,
    CheckCircle2,
    HelpCircle
} from 'lucide-react';
import apiService from './services/api';
import { Language } from './translations';
import { cn } from './utils/cn';

interface WhatIfSimulatorProps {
    language: Language;
    currency: string;
    isDarkMode: boolean;
}

const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ language, currency, isDarkMode }) => {
    const [scenario, setScenario] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scenario.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const result = await apiService.getSimulation(scenario, language, currency);
            // Validate and ensure months are properly formatted
            if (result.projectedData && Array.isArray(result.projectedData)) {
                // Sort by month to ensure chronological order
                result.projectedData = result.projectedData.map((item: any, index: number) => ({
                    ...item,
                    balance: parseFloat(item.balance) || 0,
                    // Ensure month format is correct
                    month: item.month || `Month ${index + 1}`
                }));
            }
            setData(result);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Simulation failed. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {language === 'ru' ? 'ИИ-Симулятор "Что если?"' : language === 'kz' ? 'ИИ "Егер де..." Симуляторы' : 'AI "What-If" Simulator'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {language === 'ru' ? 'Моделируйте свои финансовые решения и смотрите в будущее' : 'Model your financial decisions and look into the future'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSimulate} className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            placeholder={language === 'ru' ? 'Например: "Что будет, если я куплю машину за 5 млн в кредит под 15% и буду откладывать по 50к ежемесячно?"' : 'E.g., What if I buy a car for $10k with a loan and save $500 monthly?'}
                            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white text-lg"
                        />
                        <button
                            type="submit"
                            disabled={loading || !scenario.trim()}
                            className="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                            {language === 'ru' ? 'Запустить симуляцию' : 'Run Simulation'}
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-indigo-100 dark:border-slate-700 rounded-full" />
                        <div className="absolute top-0 left-0 h-20 w-20 border-4 border-t-indigo-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500 animate-pulse" />
                    </div>
                    <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                        {language === 'ru' ? 'Просчитываем варианты будущего...' : 'Calculating possible futures...'}
                    </p>
                </div>
            )}

            {data && !loading && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* Main Chart Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                                    {language === 'ru' ? 'Прогноз баланса на 5 лет' : '5-Year Balance Projection'}
                                </h3>
                                {data.projectedData && data.projectedData.length > 0 && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        {language === 'ru' ? 'С' : 'From'} {data.projectedData[0].month} {language === 'ru' ? 'по' : 'to'} {data.projectedData[data.projectedData.length - 1].month}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.projectedData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        interval={Math.floor(data.projectedData.length / 12) || 4}
                                        stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`}
                                        stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                                    />
                                    <Tooltip
                                        formatter={(val: number | undefined) => [val ? formatCurrency(val) : '0', language === 'ru' ? 'Баланс' : 'Balance']}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: isDarkMode ? '#1e293b' : '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Card */}
                        <div className="lg:col-span-1 bg-indigo-500 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="h-5 w-5" />
                                <h4 className="font-bold uppercase tracking-wider text-sm opacity-80">AI Analysis</h4>
                            </div>
                            <p className="text-lg leading-relaxed font-medium">
                                {data.summary}
                            </p>
                        </div>

                        {/* Milestones Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                {language === 'ru' ? 'Ключевые события' : 'Key Milestones'}
                            </h4>
                            <div className="space-y-6">
                                {data.milestones.map((ms: any, i: number) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i !== data.milestones.length - 1 && (
                                            <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
                                        )}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100 dark:border-indigo-800">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-indigo-500 uppercase">{ms.month}</span>
                                                <h5 className="text-lg font-bold text-slate-800 dark:text-white">{ms.title}</h5>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{ms.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!data && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            title: language === 'ru' ? 'Кредит на авто' : 'Auto Loan',
                            scenario: language === 'ru' ? 'Что будет, если я куплю машину за 5 млн в кредит под 15% на 3 года?' : 'What if I buy a 5M car with a 15% 3-year loan?'
                        },
                        {
                            title: language === 'ru' ? 'Пассивный доход' : 'Passive Income',
                            scenario: language === 'ru' ? 'Что если я буду инвестировать по 100 000₸ каждый месяц под 12% годовых?' : 'What if I invest 100k monthly at 12% APR?'
                        },
                        {
                            title: language === 'ru' ? 'Увольнение' : 'Job Loss',
                            scenario: language === 'ru' ? 'Что если я уволюсь и полгода не буду работать, живя на накопления?' : 'What if I quit and live on savings for 6 months?'
                        }
                    ].map((example, i) => (
                        <button
                            key={i}
                            onClick={() => setScenario(example.scenario)}
                            className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 text-left hover:border-indigo-500/50 transition-all shadow-sm group"
                        >
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-fit mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-white mb-2">{example.title}</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">{example.scenario}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WhatIfSimulator;
