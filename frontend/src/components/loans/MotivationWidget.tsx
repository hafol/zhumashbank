import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface MotivationWidgetProps {
    language: string;
    t: any;
    token: string | null;
}

export const MotivationWidget: React.FC<MotivationWidgetProps> = ({ language, t, token }) => {
    const [quote, setQuote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchQuote = async () => {
            if (!token) return;
            try {
                const response = await fetch(`http://localhost:5002/api/loans/quote?lang=${language}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuote(data.quote);
                }
            } catch (error) {
                console.error("Failed to fetch quote", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [language, token]);

    if (loading || !quote) return null;

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-indigo-400 opacity-20 rounded-full blur-xl"></div>

            <div className="flex items-center gap-3 mb-3 opacity-90 relative z-10">
                <Sparkles size={20} className="text-yellow-300" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">{t.dailyMotivation}</h3>
            </div>

            <p className="text-xl font-medium leading-relaxed italic z-10 relative drop-shadow-sm">"{quote}"</p>
        </div>
    );
};
