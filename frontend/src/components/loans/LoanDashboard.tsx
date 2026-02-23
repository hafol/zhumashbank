import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Calculator } from 'lucide-react';

interface Loan {
    id: number;
    name: string;
    amount: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    reason: string;
    aiEvaluation: string | null;
}

interface LoanDashboardProps {
    loans: Loan[];
    language: string;
    t: any;
}

export const LoanDashboard: React.FC<LoanDashboardProps> = ({ loans, language, t }) => {
    const [selectedLoanId, setSelectedLoanId] = useState<number | null>(loans.length > 0 ? loans[0].id : null);
    const [extraPayment, setExtraPayment] = useState<number>(0);

    const selectedLoan = useMemo(() => loans.find(l => l.id === selectedLoanId) || loans[0], [loans, selectedLoanId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : language === 'kz' ? 'kk-KZ' : 'en-US', {
            style: 'currency',
            currency: 'KZT',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const chartData = useMemo(() => {
        if (!selectedLoan) return [];

        let currentBalance = selectedLoan.amount;
        const monthlyRate = (selectedLoan.interestRate / 100) / 12;
        const requiredPayment = selectedLoan.monthlyPayment;
        const totalPayment = requiredPayment + extraPayment;

        const data = [];
        let month = 0;

        while (currentBalance > 0 && month <= selectedLoan.termMonths * 2) {
            data.push({
                month: month === 0 ? 'Start' : `M${month}`,
                balance: Math.max(0, currentBalance)
            });

            const interest = currentBalance * monthlyRate;
            const principal = totalPayment - interest;

            if (principal <= 0) break; // Infinite loop prevention if payment doesn't cover interest
            currentBalance -= principal;
            month++;

            if (currentBalance <= 0) {
                data.push({
                    month: `M${month}`,
                    balance: 0
                });
                break;
            }
        }
        return data;
    }, [selectedLoan, extraPayment]);

    if (!selectedLoan) return null;

    const originalMonths = selectedLoan.termMonths;
    const newMonths = chartData.length > 0 ? chartData.length - 1 : originalMonths;
    const monthsSaved = Math.max(0, originalMonths - newMonths);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="text-indigo-500" /> {t.payoffProgress}
                </h2>

                {loans.length > 1 && (
                    <select
                        value={selectedLoan.id}
                        onChange={(e) => setSelectedLoanId(Number(e.target.value))}
                        className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                    >
                        {loans.map(loan => (
                            <option key={loan.id} value={loan.id}>{loan.name} ({formatCurrency(loan.amount)})</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.loanAmount}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.monthlyPayment}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedLoan.monthlyPayment)}</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl col-span-2">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                        <Calculator size={14} /> {t.whatIf}
                    </p>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max={selectedLoan.amount / 5}
                            step="5000"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300 min-w-[80px]">
                            +{formatCurrency(extraPayment)}
                        </span>
                    </div>
                </div>
            </div>

            {extraPayment > 0 && monthsSaved > 0 && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-100 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
                    {language === 'ru'
                        ? `Платя еще ${formatCurrency(extraPayment)} каждый месяц, вы закроете кредит на ${monthsSaved} мес. раньше!`
                        : language === 'kz'
                            ? `Ай сайын қосымша ${formatCurrency(extraPayment)} төлеу арқылы сіз кредитті ${monthsSaved} ай бұрын жабасыз!`
                            : `By paying an extra ${formatCurrency(extraPayment)} per month, you will finish ${monthsSaved} months earlier!`
                    }
                </div>
            )}

            <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            dx={-10}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
