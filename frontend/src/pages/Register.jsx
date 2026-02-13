import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, Lock, Wallet, Mail } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8 text-center animate-fade-in-up">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-emerald-100">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-500 mb-8">Start managing your finance today</p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <Input
                        label="Full Name"
                        icon={User}
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        label="Email"
                        icon={Mail}
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Password"
                        icon={Lock}
                        placeholder="Create a password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full mt-4">Sign Up</Button>
                </form>

                <p className="mt-6 text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                </p>
            </Card>
        </div>
    );
}
