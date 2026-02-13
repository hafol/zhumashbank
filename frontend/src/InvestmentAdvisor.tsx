import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Briefcase,
    ArrowRight,
    Lightbulb,
    Target,
    Loader2,
    RefreshCw
} from 'lucide-react';
import apiService from './services/api';
import { Language } from './translations';

interface InvestmentAdvisorProps {
    language: Language;
    currency: string;
    isDarkMode: boolean;
}

const InvestmentAdvisor: React.FC<InvestmentAdvisorProps> = ({ language, currency }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const advice = await apiService.getInvestmentAdvice(language, currency);
            setData(advice);
        } catch (err: any) {
            console.error('Failed to fetch investment advice', err);
            const errorMsg = err.response?.data?.error || 'Failed to load recommendations';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [language, currency]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">
                    {language === 'ru' ? 'Анализируем ваш потенциал...' : language === 'kz' ? 'Әлеуетіңізді талдаудамыз...' : 'Analyzing your potential...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
                    <RefreshCw className="h-8 w-8 text-red-500 cursor-pointer" onClick={fetchData} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error}</h3>
                <button
                    onClick={fetchData}
                    className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                >
                    {language === 'ru' ? 'Попробовать снова' : language === 'kz' ? 'Қайтадан көру' : 'Try Again'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Score Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4">
                            {language === 'ru' ? 'Ваш инвестиционный потенциал' : language === 'kz' ? 'Сіздің инвестициялық әлеуетіңіз' : 'Your Investment Potential'}
                        </h2>
                        <p className="text-emerald-50/80 max-w-xl text-lg leading-relaxed">
                            {data.analysis}
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-full w-40 h-40 border border-white/20">
                        <span className="text-5xl font-black">{data.investmentScore}</span>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Points</span>
                    </div>
                </div>
                {/* Abstract background shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-teal-400/20 rounded-full blur-3xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recommendations */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {language === 'ru' ? 'Рекомендованные активы' : language === 'kz' ? 'Ұсынылған активтер' : 'Recommended Assets'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {data.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase rounded-full">
                                        {rec.type}
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{rec.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Ideas */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {language === 'ru' ? 'Идеи для дохода' : language === 'kz' ? 'Табыс идеялары' : 'Income Ideas'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {data.businessIdeas.map((idea: string, idx: number) => (
                            <div key={idx} className="bg-amber-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-amber-100/50 dark:border-slate-700 flex gap-4 items-start">
                                <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                                    <Lightbulb className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-medium leading-relaxed">
                                        {idea}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold mb-2">Pro Tip</h4>
                            <p className="text-slate-400 text-sm">
                                {language === 'ru' ? 'Всегда проводите собственное исследование перед инвестированием.' : language === 'kz' ? 'Инвестиция салмас бұрын әрқашан жеке зерттеу жүргізіңіз.' : 'Always do your own research before investing.'}
                            </p>
                        </div>
                        <Target className="absolute -bottom-4 -right-4 h-24 w-24 text-white/5 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentAdvisor;
