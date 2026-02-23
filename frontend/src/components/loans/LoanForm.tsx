import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface LoanFormProps {
    language: string;
    t: any;
    token: string | null;
    onLoanAdded: () => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ language, t, token, onLoanAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        interestRate: '',
        termMonths: '',
        reason: ''
    });
    const [evaluating, setEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<{ isGood: boolean; evaluation: string } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : language === 'kz' ? 'kk-KZ' : 'en-US', {
            style: 'currency',
            currency: 'KZT',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateMonthlyPayment = (amount: number, rate: number, months: number) => {
        if (!amount || !rate || !months) return 0;
        const monthlyRate = (rate / 100) / 12;
        return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    };

    const monthlyPayment = calculateMonthlyPayment(
        parseFloat(formData.amount),
        parseFloat(formData.interestRate),
        parseInt(formData.termMonths)
    );

    const handleEvaluateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEvaluating(true);
        setEvaluationResult(null);

        try {
            const evalRes = await axios.post(`http://localhost:5002/api/loans/evaluate`, {
                reason: formData.reason,
                amount: parseFloat(formData.amount),
                lang: language
            }, { headers: { Authorization: `Bearer ${token}` } });

            const data = evalRes.data as { isGood: boolean; evaluation: string };
            setEvaluationResult(data);

            await axios.post(`http://localhost:5002/api/loans`, {
                ...formData,
                monthlyPayment,
                aiEvaluation: data.evaluation
            }, { headers: { Authorization: `Bearer ${token}` } });

            onLoanAdded();

            // Clear form after slight delay to show result
            setTimeout(() => {
                setFormData({ name: '', amount: '', interestRate: '', termMonths: '', reason: '' });
            }, 5000);

        } catch (error) {
            console.error("Failed to add loan", error);
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <form onSubmit={handleEvaluateAndSubmit} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="text-indigo-500" /> {t.addLoan}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.title}</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.loanAmount}</label>
                    <input
                        required
                        type="number"
                        value={formData.amount}
                        min="0"
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.interestRate}</label>
                    <input
                        required
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.interestRate}
                        onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.termMonths}</label>
                    <input
                        required
                        type="number"
                        min="1"
                        value={formData.termMonths}
                        onChange={e => setFormData({ ...formData, termMonths: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-all"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.loanReason}</label>
                <textarea
                    required
                    rows={3}
                    placeholder={t.loanReasonPlaceholder}
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none transition-all"
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t.monthlyPayment}</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {monthlyPayment > 0 ? formatCurrency(monthlyPayment) : '0 ₸'}
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={evaluating}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    {evaluating ? (
                        <><Loader2 size={18} className="animate-spin" /> {t.evaluating}</>
                    ) : (
                        <><BrainCircuit size={18} /> {t.addLoan}</>
                    )}
                </button>
            </div>

            {evaluationResult && (
                <div className={`p-5 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500 ${evaluationResult.isGood
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border border-rose-100 dark:border-rose-800'
                    }`}>
                    <div className="mt-0.5 shrink-0">
                        {evaluationResult.isGood ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1 text-base">
                            {evaluationResult.isGood ? t.goodReason : t.badReason}
                        </h4>
                        <p className="text-sm opacity-90 leading-relaxed">{evaluationResult.evaluation}</p>
                    </div>
                </div>
            )}
        </form>
    );
};
