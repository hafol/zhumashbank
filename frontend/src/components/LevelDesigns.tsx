// Уровни геймификации с красивыми дизайнами
export const LEVEL_DESIGNS = {
  1: {
    name: 'Bronze Member',
    icon: '🥉',
    color: '#CD7F32',
    gradient: 'from-yellow-100 to-orange-100',
    darkGradient: 'from-yellow-900 to-orange-900',
    description: 'Начало вашего пути',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <circle cx="100" cy="80" r="35" fill="#CD7F32" opacity="0.2" />
        <circle cx="100" cy="80" r="25" fill="#CD7F32" opacity="0.4" />
        <circle cx="100" cy="80" r="15" fill="#CD7F32" />
        <path d="M 70 120 Q 100 140 130 120" stroke="#CD7F32" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  2: {
    name: 'Silver Member',
    icon: '🥈',
    color: '#C0C0C0',
    gradient: 'from-blue-50 to-slate-100',
    darkGradient: 'from-blue-900 to-slate-900',
    description: 'Растущий финансист',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <defs>
          <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#A8A8A8" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="80" r="35" fill="url(#silver)" opacity="0.3" />
        <circle cx="100" cy="80" r="25" fill="url(#silver)" opacity="0.6" />
        <circle cx="100" cy="80" r="15" fill="url(#silver)" />
        <path d="M 70 120 Q 100 140 130 120" stroke="#A8A8A8" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  3: {
    name: 'Gold Member',
    icon: '🥇',
    color: '#FFD700',
    gradient: 'from-yellow-50 to-amber-100',
    darkGradient: 'from-yellow-900 to-amber-900',
    description: 'Опытный инвестор',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE55C" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="80" r="40" fill="url(#gold)" opacity="0.2" />
        <circle cx="100" cy="80" r="28" fill="url(#gold)" opacity="0.5" />
        <circle cx="100" cy="80" r="18" fill="url(#gold)" />
        <path d="M 65 120 Q 100 145 135 120" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="75" cy="65" r="6" fill="#FFD700" opacity="0.6" />
        <circle cx="125" cy="65" r="6" fill="#FFD700" opacity="0.6" />
      </svg>
    )
  },
  4: {
    name: 'Platinum Member',
    icon: '💎',
    color: '#E5E4E2',
    gradient: 'from-purple-50 to-blue-100',
    darkGradient: 'from-purple-900 to-blue-900',
    description: 'Профессиональный трейдер',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <defs>
          <linearGradient id="platinum" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8E8FF" />
            <stop offset="100%" stopColor="#B0C4DE" />
          </linearGradient>
        </defs>
        <polygon points="100,40 130,80 100,120 70,80" fill="url(#platinum)" opacity="0.3" />
        <polygon points="100,50 120,85 100,110 80,85" fill="url(#platinum)" opacity="0.6" />
        <polygon points="100,60 110,85 100,100 90,85" fill="url(#platinum)" />
        <circle cx="60" cy="100" r="8" fill="#B0C4DE" opacity="0.7" />
        <circle cx="140" cy="100" r="8" fill="#B0C4DE" opacity="0.7" />
      </svg>
    )
  },
  5: {
    name: 'Diamond Member',
    icon: '💰',
    color: '#00D9FF',
    gradient: 'from-cyan-50 to-blue-100',
    darkGradient: 'from-cyan-900 to-blue-900',
    description: 'Финансовый эксперт',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <defs>
          <linearGradient id="diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#0088FF" />
          </linearGradient>
        </defs>
        <polygon points="100,30 150,100 100,170 50,100" fill="url(#diamond)" opacity="0.2" />
        <polygon points="100,50 130,100 100,150 70,100" fill="url(#diamond)" opacity="0.5" />
        <polygon points="100,70 115,100 100,130 85,100" fill="url(#diamond)" />
        <circle cx="100" cy="100" r="5" fill="#FFFFFF" />
      </svg>
    )
  },
  6: {
    name: 'Legend',
    icon: '👑',
    color: '#FF1493',
    gradient: 'from-pink-50 to-red-100',
    darkGradient: 'from-pink-900 to-red-900',
    description: 'Легенда финансов',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
        <defs>
          <linearGradient id="legend" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
        </defs>
        <path d="M 50 120 L 60 60 L 80 80 L 100 40 L 120 80 L 140 60 L 150 120 Z" fill="url(#legend)" opacity="0.3" />
        <path d="M 60 120 L 70 75 L 85 90 L 100 55 L 115 90 L 130 75 L 140 120 Z" fill="url(#legend)" opacity="0.6" />
        <path d="M 70 120 L 80 85 L 92 95 L 100 70 L 108 95 L 120 85 L 130 120 Z" fill="url(#legend)" />
        <circle cx="100" cy="145" r="8" fill="url(#legend)" opacity="0.8" />
      </svg>
    )
  },
  7: {
    name: 'Supreme Master',
    icon: '🏆',
    color: '#FF6B9D',
    gradient: 'from-purple-50 via-pink-50 to-red-100',
    darkGradient: 'from-purple-900 via-pink-900 to-red-900',
    description: 'Высочайший уровень мастерства',
    illustration: (
      <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
        <defs>
          <linearGradient id="supreme" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="50%" stopColor="#FF1493" />
            <stop offset="100%" stopColor="#C71585" />
          </linearGradient>
        </defs>
        {/* Основание кубка */}
        <rect x="80" y="140" width="40" height="20" fill="#FFD700" opacity="0.5" />
        <rect x="70" y="155" width="60" height="8" fill="#FFD700" opacity="0.7" />
        {/* Чаша кубка */}
        <path d="M 70 140 Q 60 100 70 70 Q 100 50 130 70 Q 140 100 130 140 Z" fill="url(#supreme)" opacity="0.3" />
        <path d="M 80 135 Q 75 105 82 75 Q 100 60 118 75 Q 125 105 120 135 Z" fill="url(#supreme)" opacity="0.6" />
        <path d="M 90 130 Q 87 108 93 80 Q 100 70 107 80 Q 113 108 110 130 Z" fill="url(#supreme)" />
        {/* Ручки */}
        <path d="M 70 110 Q 50 110 50 90" stroke="url(#supreme)" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 130 110 Q 150 110 150 90" stroke="url(#supreme)" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        {/* Звезды вокруг */}
        <circle cx="40" cy="50" r="5" fill="#FFD700" opacity="0.8" />
        <circle cx="160" cy="50" r="5" fill="#FFD700" opacity="0.8" />
        <circle cx="100" cy="30" r="6" fill="#FFD700" opacity="0.9" />
      </svg>
    )
  }
};

export default LEVEL_DESIGNS;
