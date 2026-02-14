import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../api/axios';
import { Wallet, TrendingUp, TrendingDown, LogOut, Plus, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [transactionType, setTransactionType] = useState('income');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchData();
        fetchChartData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchChartData = async () => {
        try {
            const res = await api.get('/transactions/category');
            setChartData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', {
                amount,
                type: transactionType,
                category,
                description
            });
            setShowAddModal(false);
            setAmount('');
            setCategory('');
            setDescription('');
            fetchData();
            fetchChartData();
        } catch (err) {
            alert('Failed to add transaction');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const COLORS = ['#10b981', '#34d399', '#f87171', '#fbbf24', '#60a5fa'];

    // Защита от невалидных данных для chartData
    const safeChartData = Array.isArray(chartData) ? chartData.filter(Boolean) : [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-xl">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium hidden sm:block">Hi, {user?.name}</span>
                        <Button variant="secondary" onClick={logout} className="p-2 h-10 w-10 !px-0 rounded-full flex items-center justify-center">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Remaining</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Balance</p>
                            <h3 className="text-3xl font-bold text-gray-900">${data?.balance.toFixed(2)}</h3>
                        </div>
                    </Card>

                    <Card className="flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Income</p>
                            <h3 className="text-3xl font-bold text-gray-900">${data?.income.toFixed(2)}</h3>
                        </div>
                    </Card>

                    <Card className="flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Expense</p>
                            <h3 className="text-3xl font-bold text-gray-900">${data?.expense.toFixed(2)}</h3>
                        </div>
                    </Card>
                </div>

                {/* Actions & Budget */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="flex items-center justify-between p-8">
                        <div>
                            <h4 className="font-semibold text-lg">Monthly Budget Goal</h4>
                            <p className="text-gray-500 text-sm mt-1">Keep track of your spending limits</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold">${data?.budget || 0}</span>
                            <Button variant="secondary" className="mt-2 text-sm py-2 px-4 h-auto">Set Budget</Button>
                        </div>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => { setTransactionType('income'); setShowAddModal(true); }}
                            className="flex-1 h-full text-lg"
                        >
                            <Plus className="mr-2" /> Add Income
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => { setTransactionType('expense'); setShowAddModal(true); }}
                            className="flex-1 h-full text-lg"
                        >
                            <Plus className="mr-2" /> Add Expense
                        </Button>
                    </div>
                </div>

                {/* Charts and History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <Card className="lg:col-span-1 min-h-[300px]">
                        <h4 className="font-semibold text-gray-900 mb-6">Expenses by Category</h4>
                        {safeChartData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={safeChartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {safeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                No expense data yet
                            </div>
                        )}
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-6">Recent Transactions</h4>
                        <div className="space-y-4">
                            {data?.recentTransactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.category}</p>
                                            <p className="text-sm text-gray-500">{t.description || new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                                <p className="text-center text-gray-500 py-4">No transactions found</p>
                            )}
                        </div>
                    </Card>
                </div>
            </main>

            {/* Add Transaction Modal (Simplified) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Add {transactionType === 'income' ? 'Income' : 'Expense'}</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <Input
                                label="Amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                            <Input
                                label="Category"
                                placeholder="e.g. Salary, Food, Rent"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                required
                            />
                            <Input
                                label="Description"
                                placeholder="Optional note"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <div className="flex gap-4 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" variant={transactionType === 'income' ? 'primary' : 'danger'} className="flex-1">Add</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
