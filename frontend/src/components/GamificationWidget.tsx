import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

interface Props {
  isDarkMode?: boolean;
}

function GamificationWidget({ isDarkMode = false }: Props) {
  const [level, setLevel] = useState('1');
  const [totalXp, setTotalXp] = useState('0');
  const [currentXp, setCurrentXp] = useState('0');
  const [nextLevelXp, setNextLevelXp] = useState('1000');
  const [currentStreak, setCurrentStreak] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/gamification/profile');
      const data = response.data;
      setLevel(String(data.level || 1));
      setTotalXp(String(data.totalXp || 0));
      setCurrentXp(String(data.currentXp || 0));
      setNextLevelXp(String(data.nextLevelXp || 1000));
      setCurrentStreak(String(data.currentStreak || 0));
    } catch (err) {
      console.error('Failed to load gamification:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-purple-50'}`}><div className="text-center text-slate-400">Loading...</div></div>;
  }

  const xpPercent = Math.min((parseInt(currentXp) / parseInt(nextLevelXp)) * 100, 100);

  return (
    <div className={`p-6 rounded-xl cursor-pointer ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-purple-50 border border-purple-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">🐱</div>
          <div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Level {level}</div>
            <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Member</div>
          </div>
        </div>
        <div className={`text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <div className="text-2xl font-bold">{totalXp}</div>
          <div className="text-xs">Total XP</div>
        </div>
      </div>

      <div className="mb-4">
        <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Progress to Level {String(parseInt(level) + 1)}</div>
        <div className={`rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-purple-200'}`}>
          <div className="h-full bg-purple-500" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{currentXp} / {nextLevelXp} XP</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded text-center ${isDarkMode ? 'bg-slate-700' : 'bg-purple-100'}`}>
          <div className="text-2xl">🔥</div>
          <div className={`text-sm font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>{currentStreak}</div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Streak</div>
        </div>
        <div className={`p-3 rounded text-center ${isDarkMode ? 'bg-slate-700' : 'bg-purple-100'}`}>
          <div className="text-2xl">🏆</div>
          <div className={`text-sm font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>0</div>
          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Achievements</div>
        </div>
      </div>

      <div className={`text-center mt-3 text-xs font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>👆 Click to view profile</div>
    </div>
  );
}


export default GamificationWidget;
