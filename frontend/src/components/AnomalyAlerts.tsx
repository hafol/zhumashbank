import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import apiService from '../services/api';
import { translations, Language } from '../translations';

interface Alert {
  id: number;
  type: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  normalValue: number;
  actualValue: number;
  percentageDiff: number;
  recommendations: string[];
  createdAt: string;
  readAt: string | null;
}

export const AnomalyAlerts = ({ language = 'en', isDarkMode = true }: { language?: Language; isDarkMode?: boolean }) => {
  const t = translations[language];
  const theme = isDarkMode ? 'dark' : 'light';
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await apiService.getAnomalyAlerts();
      setAlerts(response || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300';
      case 'medium':
        return theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300';
      default:
        return theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'medium':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <TrendingUp className="text-blue-600" size={20} />;
    }
  };

  const displayAlerts = filter === 'unread' 
    ? alerts.filter(a => !a.readAt)
    : alerts;

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
        <h2 className="text-xl font-bold mb-4">{t('spendingAlerts')}</h2>
        <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t('spendingAlerts')}</h2>
        {alerts.some(a => !a.readAt) && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {alerts.filter(a => !a.readAt).length} {t('alertsNew')}
          </span>
        )}
      </div>

      <div className={`flex gap-2 mb-4 border-b ${theme === 'dark' ? 'border-slate-700' : ''}`}>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          {t('all')} ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === 'unread'
              ? 'border-blue-600 text-blue-600'
              : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          {t('unread')} ({alerts.filter(a => !a.readAt).length})
        </button>
      </div>

      {displayAlerts.length === 0 ? (
        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          <Zap size={32} className="mx-auto mb-2 opacity-50" />
          <p>{filter === 'unread' ? 'No new alerts' : t('noAlerts')}</p>
        </div>
      ) : (
        <div className={`space-y-3 max-h-96 overflow-y-auto ${theme === 'dark' ? 'scrollbar-thin scrollbar-thumb-slate-600' : ''}`}>
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{alert.description}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Usually:</span>
                      <p className="font-semibold">{alert.normalValue.toFixed(0)}</p>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Spent:</span>
                      <p className="font-semibold text-red-600">{alert.actualValue.toFixed(0)}</p>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Difference:</span>
                      <p className={`font-semibold ${alert.percentageDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {alert.percentageDiff > 0 ? '+' : ''}{alert.percentageDiff}%
                      </p>
                    </div>
                  </div>

                  {alert.recommendations && alert.recommendations.length > 0 && (
                    <div className={`mt-3 pt-3 border-t border-current border-opacity-20`}>
                      <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t('recommendations')}:</p>
                      <ul className="text-xs space-y-1">
                        {alert.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span className={theme === 'dark' ? 'text-gray-300' : ''}>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!alert.readAt && (
                    <div className="mt-2 text-xs font-semibold text-blue-600">
                      NEW • Sent to your email
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
