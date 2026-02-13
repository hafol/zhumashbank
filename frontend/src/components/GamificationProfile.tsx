import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { X } from 'lucide-react';
import LEVEL_DESIGNS from './LevelDesigns';

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

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, achievementsRes, leaderboardRes] = await Promise.all([
        axios.get('/gamification/profile').catch(() => ({ data: null })),
        axios.get('/gamification/achievements').catch(() => ({ data: null })),
        axios.get('/gamification/leaderboard').catch(() => ({ data: null })),
      ]);

      setProfile(profileRes.data || getMockProfile());
      setAchievements(achievementsRes.data || getMockAchievements());
      setLeaderboard(leaderboardRes.data || getMockLeaderboard());
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
      setProfile(getMockProfile());
      setAchievements(getMockAchievements());
      setLeaderboard(getMockLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  const getMockProfile = (): GameProfile => ({
    petType: '🐱',
    level: 1,
    totalXp: 0,
    currentXp: 0,
    nextLevelXp: 1000,
    currentStreak: 0,
    maxStreak: 5,
    totalAchievements: 0,
    totalQuests: 0,
  });

  const getMockAchievements = (): Achievements => ({
    unlocked: 3,
    total: 20,
    achievements: [
      { id: '1', name: 'First Transaction', description: 'Complete your first transaction', icon: '💳', xpReward: 50, category: 'transactions', unlocked: true },
      { id: '2', name: 'Budget Master', description: 'Set a monthly budget', icon: '📊', xpReward: 100, category: 'budget', unlocked: true },
      { id: '3', name: 'Savings Starter', description: 'Save your first $100', icon: '💰', xpReward: 150, category: 'savings', unlocked: true },
      { id: '4', name: 'Investment Pro', description: 'Make your first investment', icon: '📈', xpReward: 200, category: 'investments', unlocked: false },
    ],
  });

  const getMockLeaderboard = (): Leaderboard => ({
    entries: [
      { rank: 1, email: 'user1@example.com', level: 5, xp: 5000, userId: '1' },
      { rank: 2, email: 'user2@example.com', level: 4, xp: 4000, userId: '2' },
      { rank: 3, email: 'user3@example.com', level: 3, xp: 3000, userId: '3' },
    ],
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-6 border-b ${
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

// Profile Tab Component
interface ProfileTabProps {
  profile: GameProfile;
  isDarkMode: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, isDarkMode }) => {
  const xpPercentage = profile.currentXp / (profile.nextLevelXp || 1000);
  const progressPercent = Math.min(xpPercentage * 100, 100);
  const levelDesign = LEVEL_DESIGNS[Math.min(profile.level, 7) as keyof typeof LEVEL_DESIGNS] || LEVEL_DESIGNS[1];

  return (
    <div className="space-y-6">
      {/* Main Stats with Beautiful Level Design */}
      <div
        className={`p-8 rounded-lg ${
          isDarkMode
            ? `bg-gradient-to-br ${levelDesign.darkGradient}`
            : `bg-gradient-to-br ${levelDesign.gradient}`
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

        {/* Illustration */}
        <div className="flex justify-center mb-6 opacity-80">
          {levelDesign && levelDesign.illustration && typeof levelDesign.illustration === 'object' ? levelDesign.illustration : null}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Level {profile.level}
            </div>
            <div className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile.levelInfo?.name}
            </div>
          </div>
          <div className={`text-right ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            <div className="text-3xl font-bold">{profile.totalXp.toLocaleString()}</div>
            <div className="text-sm">Total XP</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={profile.currentStreak}
          isDarkMode={isDarkMode}
          color="orange"
        />
        <StatCard
          icon="⭐"
          label="Max Streak"
          value={profile.maxStreak}
          isDarkMode={isDarkMode}
          color="yellow"
        />
        <StatCard
          icon="🏆"
          label="Achievements"
          value={profile.totalAchievements}
          isDarkMode={isDarkMode}
          color="purple"
        />
        <StatCard
          icon="📊"
          label="Total Quests"
          value={profile.totalQuests}
          isDarkMode={isDarkMode}
          color="blue"
        />
      </div>

      {/* Pet Happiness */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            Pet Happiness
          </span>
          <span className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
            {profile.petInfo?.happiness || 0}%
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-blue-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
            style={{ width: `${profile.petInfo?.happiness || 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Achievements Tab
interface AchievementsTabProps {
  achievements: Achievements;
  isDarkMode: boolean;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({ achievements, isDarkMode }) => {
  const categories: { [key: string]: Achievement[] } = {};

  if (!achievements || !achievements.achievements || achievements.achievements.length === 0) {
    // Fallback data for development
    const mockAchievements: Achievement[] = [
      { id: '1', name: 'First Transaction', description: 'Make your first transaction', icon: '💳', xpReward: 100, category: 'transactions', unlocked: true },
      { id: '2', name: 'Budget Master', description: 'Set your first budget', icon: '📊', xpReward: 150, category: 'budget', unlocked: true },
      { id: '3', name: 'Receipt Collector', description: 'Scan 5 receipts', icon: '🧾', xpReward: 200, category: 'receipts', unlocked: false },
      { id: '4', name: 'Saving Spree', description: 'Save 1000 in expenses', icon: '💰', xpReward: 250, category: 'savings', unlocked: false },
      { id: '5', name: 'Investment Pioneer', description: 'Make your first investment', icon: '📈', xpReward: 300, category: 'investments', unlocked: false },
      { id: '6', name: 'Streak Warrior', description: 'Maintain 7-day streak', icon: '🔥', xpReward: 350, category: 'streaks', unlocked: false },
    ];

    mockAchievements.forEach((ach) => {
      if (!categories[ach.category]) {
        categories[ach.category] = [];
      }
      categories[ach.category].push(ach);
    });

    const mockData = { unlocked: 2, total: 6, achievements: mockAchievements };

    return (
      <div className="space-y-6">
        <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
          <div className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-blue-900'}`}>
            {mockData.unlocked} / {mockData.total} Achievements Unlocked
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-blue-700'}`}>
            {Math.round((mockData.unlocked / mockData.total) * 100)}% Complete
          </div>
        </div>

        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <h3 className={`font-bold mb-3 capitalize ${isDarkMode ? 'text-purple-300' : 'text-blue-600'}`}>
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  achievements.achievements.forEach((ach) => {
    if (!categories[ach.category]) {
      categories[ach.category] = [];
    }
    categories[ach.category].push(ach);
  });

  return (
    <div className="space-y-6">
      <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
        <div className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-blue-900'}`}>
          {achievements.unlocked} / {achievements.total} Achievements Unlocked
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-blue-700'}`}>
          {Math.round((achievements.unlocked / achievements.total) * 100)}% Complete
        </div>
      </div>

      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <h3 className={`font-bold mb-3 capitalize ${isDarkMode ? 'text-purple-300' : 'text-blue-600'}`}>
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((ach) => (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  isDarkMode: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isDarkMode }) => {
  return (
    <div
      className={`p-3 rounded-lg border-2 transition ${
        achievement.unlocked
          ? isDarkMode
            ? 'bg-slate-800 border-purple-500/50'
            : 'bg-blue-50 border-blue-300'
          : isDarkMode
            ? 'bg-slate-900 border-slate-700 opacity-50'
            : 'bg-slate-100 border-slate-300 opacity-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium text-sm ${
              isDarkMode ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            {achievement.name}
          </div>
          <div
            className={`text-xs mt-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {achievement.description}
          </div>
          <div
            className={`text-xs mt-2 font-bold ${
              isDarkMode ? 'text-purple-300' : 'text-blue-600'
            }`}
          >
            +{achievement.xpReward} XP
          </div>
        </div>
      </div>
    </div>
  );
};

// Leaderboard Tab
interface LeaderboardTabProps {
  leaderboard: Leaderboard;
  isDarkMode: boolean;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ leaderboard, isDarkMode }) => {
  // Fallback mock data if leaderboard is empty
  const mockEntries: LeaderboardEntry[] = [
    { rank: 1, email: 'crypto_king@example.com', level: 7, xp: 15000, userId: '1' },
    { rank: 2, email: 'finance_pro@example.com', level: 6, xp: 12500, userId: '2' },
    { rank: 3, email: 'investor_joe@example.com', level: 5, xp: 10000, userId: '3' },
    { rank: 4, email: 'budget_master@example.com', level: 4, xp: 7500, userId: '4' },
    { rank: 5, email: 'savings_queen@example.com', level: 3, xp: 5000, userId: '5' },
    { rank: 6, email: 'you@example.com', level: 2, xp: 2500, userId: '6' },
  ];

  const entries = leaderboard?.entries && leaderboard.entries.length > 0 ? leaderboard.entries : mockEntries;

  return (
    <div>
      <h3 className={`font-bold mb-4 text-lg ${isDarkMode ? 'text-purple-300' : 'text-blue-600'}`}>
        🌍 Global XP Leaderboard
      </h3>
      <div className="space-y-2">
        {entries.slice(0, 20).map((entry) => (
          <div
            key={entry.userId}
            className={`p-3 rounded-lg flex items-center justify-between transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`font-bold w-8 text-center text-lg ${
                  entry.rank === 1
                    ? isDarkMode
                      ? 'text-yellow-400'
                      : 'text-yellow-600'
                    : entry.rank === 2
                      ? isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-400'
                      : entry.rank === 3
                        ? isDarkMode
                          ? 'text-orange-400'
                          : 'text-orange-600'
                        : isDarkMode
                          ? 'text-slate-400'
                          : 'text-slate-600'
                }`}
              >
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  {entry.email.split('@')[0]}
                </div>
                <div
                  className={`text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Level {entry.level}
                </div>
              </div>
            </div>
            <div
              className={`font-bold text-right ml-4 ${
                isDarkMode ? 'text-purple-300' : 'text-purple-600'
              }`}
            >
              {entry.xp.toLocaleString()}
              <div className="text-xs font-normal">XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Stat Card Component
interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  isDarkMode: boolean;
  color?: 'orange' | 'yellow' | 'purple' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, isDarkMode, color = 'blue' }) => {
  const colorMap = {
    orange: isDarkMode ? 'text-orange-300' : 'text-orange-600',
    yellow: isDarkMode ? 'text-yellow-300' : 'text-yellow-600',
    purple: isDarkMode ? 'text-purple-300' : 'text-purple-600',
    blue: isDarkMode ? 'text-blue-300' : 'text-blue-600',
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
    </div>
  );
};

export default GamificationProfile;
