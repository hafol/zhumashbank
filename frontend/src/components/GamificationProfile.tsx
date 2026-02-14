import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { X } from 'lucide-react';
// ИСПРАВЛЕНИЕ 1: Пытаемся импортировать обоими способами (именованным и дефолтным)
import * as LevelDesignsModule from './LevelDesigns';

// Безопасно достаем дизайны уровней
// @ts-ignore
const LEVEL_DESIGNS = LevelDesignsModule.LEVEL_DESIGNS || LevelDesignsModule.default || {};

interface GameProfile {
  petType: string;
  level: number;
  levelInfo?: { name: string };
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
  currentStreak: number;
  maxStreak: number;
  totalAchievements: number;
  totalQuests: number;
  petInfo?: { happiness: number };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
  unlocked: boolean;
}

interface Achievements {
  unlocked: number;
  total: number;
  achievements: Achievement[];
}

interface LeaderboardEntry {
  rank: number;
  email: string;
  level: number;
  xp: number;
  userId: string;
}

interface Leaderboard {
  entries: LeaderboardEntry[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  isDarkMode?: boolean;
}

function GamificationProfile({ isOpen, onClose, isDarkMode = false }: Props) {
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'leaderboard'>('profile');
  const [loading, setLoading] = useState(true);

  // ИСПРАВЛЕНИЕ 2: Безопасный useEffect
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // ИСПРАВЛЕНИЕ 3: Добавили /api ко всем запросам
        const [profileRes, achievementsRes, leaderboardRes] = await Promise.all([
          axios.get('/api/gamification/profile').catch(() => ({ data: null })),
          axios.get('/api/gamification/achievements').catch(() => ({ data: null })),
          axios.get('/api/gamification/leaderboard').catch(() => ({ data: null })),
        ]);

        if (isMounted) {
          setProfile(profileRes.data || getMockProfile());
          setAchievements(achievementsRes.data || getMockAchievements());
          setLeaderboard(leaderboardRes.data || getMockLeaderboard());
        }
      } catch (error) {
        console.error('Failed to fetch gamification data:', error);
        if (isMounted) {
          setProfile(getMockProfile());
          setAchievements(getMockAchievements());
          setLeaderboard(getMockLeaderboard());
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [isOpen]);

  const getMockProfile = (): GameProfile => ({
    petType: '🐱',
    level: 1,
    levelInfo: { name: 'Novice Saver' },
    totalXp: 0,
    currentXp: 0,
    nextLevelXp: 1000,
    currentStreak: 0,
    maxStreak: 5,
    totalAchievements: 0,
    totalQuests: 0,
    petInfo: { happiness: 50 }
  });

  const getMockAchievements = (): Achievements => ({
    unlocked: 0,
    total: 5,
    achievements: [],
  });

  const getMockLeaderboard = (): Leaderboard => ({
    entries: [],
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-6 border-b z-10 ${
            isDarkMode
              ? 'border-slate-700 bg-slate-800'
              : 'border-blue-200 bg-blue-50'
          }`}
        >
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            🎮 Gamification
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-100'
            }`}
          >
            <X size={24} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-0 border-b ${
            isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-blue-200 bg-blue-50'
          }`}
        >
          {(['profile', 'achievements', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 font-medium transition text-center ${
                activeTab === tab
                  ? isDarkMode
                    ? 'border-b-2 border-purple-500 text-purple-300 bg-slate-700/50'
                    : 'border-b-2 border-blue-600 text-blue-600'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              {tab === 'profile' && '👤 Profile'}
              {tab === 'achievements' && '🏆 Achievements'}
              {tab === 'leaderboard' && '📊 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                Loading...
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && profile && (
                <ProfileTab profile={profile} isDarkMode={isDarkMode} />
              )}
              {activeTab === 'achievements' && achievements && (
                <AchievementsTab
                  achievements={achievements}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === 'leaderboard' && leaderboard && (
                <LeaderboardTab leaderboard={leaderboard} isDarkMode={isDarkMode} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const ProfileTab: React.FC<{ profile: GameProfile; isDarkMode: boolean }> = ({ profile, isDarkMode }) => {
  // Защита от отсутствующего дизайна уровней
  const levelIndex = Math.min(profile.level || 1, 7);
  // Проверяем, существует ли объект LEVEL_DESIGNS и ключ в нем
  const levelDesign = (LEVEL_DESIGNS && LEVEL_DESIGNS[levelIndex]) 
    ? LEVEL_DESIGNS[levelIndex] 
    : { name: 'Level ' + profile.level, icon: '⭐', gradient: 'from-blue-100 to-blue-200', darkGradient: 'from-slate-700 to-slate-800', description: 'Keep going!' };

  return (
    <div className="space-y-6">
      <div
        className={`p-8 rounded-lg bg-gradient-to-br ${
          isDarkMode ? levelDesign.darkGradient : levelDesign.gradient
        }`}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{levelDesign.icon}</div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {levelDesign.name}
          </h2>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {levelDesign.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Level {profile.level}
            </div>
            <div className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile.levelInfo?.name || 'Novice'}
            </div>
          </div>
          <div className={`text-right ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            <div className="text-3xl font-bold">{profile.totalXp.toLocaleString()}</div>
            <div className="text-sm">Total XP</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="🔥" label="Streak" value={profile.currentStreak} isDarkMode={isDarkMode} color="orange" />
        <StatCard icon="⭐" label="Max Streak" value={profile.maxStreak} isDarkMode={isDarkMode} color="yellow" />
        <StatCard icon="🏆" label="Achievements" value={profile.totalAchievements} isDarkMode={isDarkMode} color="purple" />
        <StatCard icon="📊" label="Quests" value={profile.totalQuests} isDarkMode={isDarkMode} color="blue" />
      </div>
    </div>
  );
};

const AchievementsTab: React.FC<{ achievements: Achievements; isDarkMode: boolean }> = ({ achievements, isDarkMode }) => {
  const list = achievements.achievements || [];
  
  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
        <span className={isDarkMode ? 'text-white' : 'text-blue-900'}>
          Unlocked: {achievements.unlocked} / {achievements.total}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {list.length > 0 ? list.map((ach) => (
          <div key={ach.id} className={`p-3 border rounded flex gap-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="text-2xl">{ach.icon}</div>
            <div>
              <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ach.name}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ach.description}</div>
            </div>
          </div>
        )) : (
            <div className="text-center py-4 text-gray-500">No achievements yet</div>
        )}
      </div>
    </div>
  );
};

const LeaderboardTab: React.FC<{ leaderboard: Leaderboard; isDarkMode: boolean }> = ({ leaderboard, isDarkMode }) => {
  const entries = leaderboard.entries || [];
  return (
    <div className="space-y-2">
      <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Leaderboard</h3>
      {entries.length > 0 ? entries.map((entry) => (
        <div key={entry.userId} className={`flex justify-between p-3 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>#{entry.rank} {entry.email.split('@')[0]}</span>
            <span className="font-bold text-purple-600">{entry.xp} XP</span>
        </div>
      )) : (
          <div className="text-center py-4 text-gray-500">Leaderboard loading...</div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: number; isDarkMode: boolean; color: string }> = ({ icon, label, value, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</div>
      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
};

export default GamificationProfile;