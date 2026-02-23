import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LoanForm } from '../components/loans/LoanForm';
import { LoanDashboard } from '../components/loans/LoanDashboard';
import { MotivationWidget } from '../components/loans/MotivationWidget';
import { translations, Language } from '../translations';
import { CreditCard } from 'lucide-react';
import { RippleLoader } from '../components/RippleLoader';

interface LoansProps {
    language: Language;
    token: string | null;
}

export const Loans: React.FC<LoansProps> = ({ language, token }) => {
    const t = translations[language];
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:5002/api/loans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoans(response.data as any[]);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [token]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="text-indigo-500" size={32} />
                        {t.loans}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Smart debt management and AI evaluation</p>
                </div>
            </header>

            <MotivationWidget language={language} t={t} token={token} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 border-r border-gray-100 dark:border-gray-700/50 pr-0 lg:pr-8">
                    <LoanForm language={language} t={t} token={token} onLoanAdded={fetchLoans} />
                </div>

                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center p-12">
                            <RippleLoader />
                            <p className="text-slate-500 mt-6 dark:text-slate-400">Loading loans...</p>
                        </div>
                    ) : loans.length > 0 ? (
                        <LoanDashboard loans={loans} language={language} t={t} />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                            <CreditCard size={64} className="text-gray-300 dark:text-gray-600 mb-6" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">{t.noLoans || "No loans yet"}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                {t.addLoan} to track your payoff progress and get AI advice.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
