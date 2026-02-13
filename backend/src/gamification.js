const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========== XP & LEVEL SYSTEM ==========

const XP_PER_LEVEL = [0, 1000, 2500, 5000, 8000, 12000, 17000, 25000];

const LEVELS = [
  { level: 1, name: "Новичок", emoji: "🌱" },
  { level: 2, name: "Ученик", emoji: "📚" },
  { level: 3, name: "Экономист", emoji: "📊" },
  { level: 4, name: "Инвестор", emoji: "💼" },
  { level: 5, name: "Магнат", emoji: "💎" },
  { level: 6, name: "Титан", emoji: "⭐" },
  { level: 7, name: "Феникс", emoji: "🦅" },
];

const PET_STAGES = ["🥚", "🐣", "🐤", "🦆", "🦅", "🦁", "🐉", "🦄", "👑"];

// ========== ACHIEVEMENTS DATABASE ==========

const ACHIEVEMENTS_DB = [
  // Discipline category (7)
  {
    key: "first_budget",
    name: "Бюджетный стартер",
    description: "Создай свой первый бюджет",
    category: "discipline",
    icon: "📋",
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "budget_met",
    name: "Мастер бюджета",
    description: "Соблюдай бюджет 1 месяц подряд",
    category: "discipline",
    icon: "✅",
    xpReward: 200,
    rarity: "rare",
  },
  {
    key: "budget_met_3x",
    name: "Бюджетный чемпион",
    description: "Соблюдай бюджет 3 месяца подряд",
    category: "discipline",
    icon: "🏆",
    xpReward: 500,
    rarity: "epic",
  },
  {
    key: "zero_overspend",
    name: "Идеальный контроль",
    description: "Потрать ровно столько, сколько было в бюджете",
    category: "discipline",
    icon: "🎯",
    xpReward: 100,
    rarity: "rare",
  },
  {
    key: "streak_7",
    name: "Неделя дисциплины",
    description: "Встреч 7 дней подряд",
    category: "discipline",
    icon: "🔥",
    xpReward: 150,
    rarity: "rare",
  },
  {
    key: "streak_30",
    name: "Месяц огня",
    description: "Встреч 30 дней подряд",
    category: "discipline",
    icon: "🌋",
    xpReward: 500,
    rarity: "epic",
  },
  {
    key: "daily_checkin",
    name: "Ежедневник",
    description: "Зайди в приложение каждый день месяца",
    category: "discipline",
    icon: "📅",
    xpReward: 200,
    rarity: "rare",
  },

  // Savings category (5)
  {
    key: "save_10k",
    name: "Копилка",
    description: "Сэкономь 10,000₸",
    category: "savings",
    icon: "🏦",
    xpReward: 100,
    rarity: "common",
  },
  {
    key: "save_100k",
    name: "Финансист",
    description: "Сэкономь 100,000₸",
    category: "savings",
    icon: "💰",
    xpReward: 300,
    rarity: "rare",
  },
  {
    key: "save_1m",
    name: "Миллионер",
    description: "Сэкономь 1,000,000₸",
    category: "savings",
    icon: "💸",
    xpReward: 1000,
    rarity: "legendary",
  },
  {
    key: "reduce_spending",
    name: "Экономист",
    description: "Снизь расходы на 20% в этом месяце",
    category: "savings",
    icon: "📉",
    xpReward: 150,
    rarity: "rare",
  },
  {
    key: "smart_category",
    name: "Аналитик",
    description: "Отследи расходы в 5+ категориях",
    category: "savings",
    icon: "📊",
    xpReward: 75,
    rarity: "common",
  },

  // Receipt Scanner (5)
  {
    key: "first_receipt",
    name: "Сканер",
    description: "Сканируй свой первый чек",
    category: "feature",
    icon: "📸",
    xpReward: 25,
    rarity: "common",
  },
  {
    key: "receipt_10",
    name: "Опытный сканер",
    description: "Сканируй 10 чеков",
    category: "feature",
    icon: "📷",
    xpReward: 100,
    rarity: "rare",
  },
  {
    key: "receipt_50",
    name: "Король чеков",
    description: "Сканируй 50 чеков",
    category: "feature",
    icon: "👑",
    xpReward: 300,
    rarity: "epic",
  },
  {
    key: "receipt_accuracy",
    name: "Точность 100%",
    description: "Отсканируй 20 чеков без ошибок",
    category: "feature",
    icon: "🎯",
    xpReward: 200,
    rarity: "epic",
  },
  {
    key: "receipt_quick",
    name: "Быстрый сканер",
    description: "Сканируй чек менее чем за 10 секунд",
    category: "feature",
    icon: "⚡",
    xpReward: 50,
    rarity: "common",
  },

  // Anomaly Alerts (4)
  {
    key: "first_alert",
    name: "Детектив",
    description: "Получи первый alert",
    category: "feature",
    icon: "🔔",
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "alert_action",
    name: "Действо",
    description: "Действуй на основе alert",
    category: "feature",
    icon: "⚠️",
    xpReward: 100,
    rarity: "rare",
  },
  {
    key: "prevent_overspend",
    name: "Спасатель бюджета",
    description: "Предотврати перерасходование благодаря alert",
    category: "feature",
    icon: "🚨",
    xpReward: 150,
    rarity: "rare",
  },
  {
    key: "10_alerts_managed",
    name: "Контроль",
    description: "Управляй 10 alerts",
    category: "feature",
    icon: "🎛️",
    xpReward: 200,
    rarity: "epic",
  },

  // Social (4)
  {
    key: "join_guild",
    name: "Командир",
    description: "Присоединись к гильдии",
    category: "social",
    icon: "🤝",
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "create_guild",
    name: "Лидер",
    description: "Создай свою гильдию",
    category: "social",
    icon: "👑",
    xpReward: 200,
    rarity: "rare",
  },
  {
    key: "top_10_leaderboard",
    name: "Элита",
    description: "Попади в топ-10 лидерборда",
    category: "social",
    icon: "🥇",
    xpReward: 300,
    rarity: "epic",
  },
  {
    key: "referral_5",
    name: "Пригласитель",
    description: "Пригласи 5 друзей",
    category: "social",
    icon: "🎁",
    xpReward: 150,
    rarity: "rare",
  },

  // Temporal (4)
  {
    key: "weekend_warrior",
    name: "Работяга выходного",
    description: "Потрать в выходной (суббота/воскресенье)",
    category: "temporal",
    icon: "🎉",
    xpReward: 25,
    rarity: "common",
  },
  {
    key: "morning_tracker",
    name: "Ранняя птица",
    description: "Зайди в приложение до 7 утра",
    category: "temporal",
    icon: "🌅",
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "night_owl",
    name: "Ночная сова",
    description: "Зайди в приложение после 22:00",
    category: "temporal",
    icon: "🌙",
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "seasonal_master",
    name: "Сезонный мастер",
    description: "Завершай сезонный квест",
    category: "temporal",
    icon: "🌍",
    xpReward: 200,
    rarity: "rare",
  },

  // Extreme challenges (4)
  {
    key: "zero_spending_day",
    name: "Монах",
    description: "Не трать деньги целый день",
    category: "extreme",
    icon: "🧘",
    xpReward: 75,
    rarity: "rare",
  },
  {
    key: "half_budget",
    name: "Мистический скромник",
    description: "Потрати только 50% от бюджета",
    category: "extreme",
    icon: "🎩",
    xpReward: 200,
    rarity: "epic",
  },
  {
    key: "all_categories",
    name: "Энциклопедия",
    description: "Потрать деньги во всех 10 категориях",
    category: "extreme",
    icon: "📚",
    xpReward: 150,
    rarity: "epic",
  },
  {
    key: "level_7_mastery",
    name: "Феникс",
    description: "Достигни уровня 7",
    category: "extreme",
    icon: "🦅",
    xpReward: 1000,
    rarity: "legendary",
  },
];

// ========== INITIALIZATION ==========

async function initializeUserGamification(userId) {
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: {
        userId,
        level: 1,
        currentXp: 0,
        totalXp: 0,
        currentStreak: 0,
        maxStreak: 0,
        petType: "🥚",
        petHappiness: 100,
        totalAchievements: 0,
        totalQuests: 0,
      },
    });

    // Initialize all achievements for this user
    const achievements = await prisma.achievement.findMany();
    if (achievements.length === 0) {
      // Create achievements if they don't exist
      await Promise.all(
        ACHIEVEMENTS_DB.map((ach) =>
          prisma.achievement.create({ data: ach }).catch(() => null)
        )
      );
    }
  }

  return gamification;
}

// ========== XP & LEVEL LOGIC ==========

async function addXp(userId, amount, reason, metadata = null) {
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    await initializeUserGamification(userId);
    gamification = await prisma.userGamification.findUnique({
      where: { userId },
    });
  }

  // Add XP
  const newCurrentXp = gamification.currentXp + amount;
  const newTotalXp = gamification.totalXp + amount;

  let newLevel = gamification.level;
  let currentXp = newCurrentXp;

  // Check for level up
  if (newTotalXp >= XP_PER_LEVEL[newLevel]) {
    newLevel = Math.min(newLevel + 1, 7);
    currentXp = newCurrentXp - (XP_PER_LEVEL[newLevel - 1] || 0);

    if (newLevel === 7) {
      // Unlock Phoenix achievement
      await unlockAchievement(userId, "level_7_mastery");
    }
  }

  const updated = await prisma.userGamification.update({
    where: { userId },
    data: {
      currentXp: currentXp,
      totalXp: newTotalXp,
      level: newLevel,
    },
  });

  // Record XP history
  await prisma.xpHistory.create({
    data: {
      userId,
      amount,
      reason,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return {
    xpAdded: amount,
    newLevel,
    leveledUp: newLevel > gamification.level,
    totalXp: newTotalXp,
    currentXp: currentXp,
  };
}

async function updateStreak(userId) {
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    await initializeUserGamification(userId);
    gamification = await prisma.userGamification.findUnique({
      where: { userId },
    });
  }

  const now = new Date();
  const lastDate = gamification.lastStreakDate
    ? new Date(gamification.lastStreakDate)
    : null;

  let streak = gamification.currentStreak;

  if (!lastDate) {
    // First check-in
    streak = 1;
  } else {
    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      return {
        currentStreak: streak,
        maxStreak: gamification.maxStreak,
        streakIncreased: false,
      };
    } else if (daysDiff === 1) {
      // Next day, increase streak
      streak = gamification.currentStreak + 1;

      // Check for streak achievements
      if (streak === 7) {
        await unlockAchievement(userId, "streak_7");
      } else if (streak === 30) {
        await unlockAchievement(userId, "streak_30");
        // Add bonus XP for 30-day streak
        await addXp(userId, 500, "streak_30_bonus", { streakDays: 30 });
      }
    } else {
      // Streak broken
      streak = 1;
    }
  }

  const maxStreak = Math.max(streak, gamification.maxStreak);

  const updated = await prisma.userGamification.update({
    where: { userId },
    data: {
      currentStreak: streak,
      maxStreak,
      lastStreakDate: now,
    },
  });

  return {
    currentStreak: streak,
    maxStreak,
    streakIncreased: streak > gamification.currentStreak,
  };
}

// ========== ACHIEVEMENT LOGIC ==========

async function unlockAchievement(userId, achievementKey) {
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  });

  if (!achievement) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });

  if (existing) return null; // Already unlocked

  const userAchievement = await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
    },
  });

  // Add XP for achievement
  await addXp(userId, achievement.xpReward, "achievement_unlock", {
    achievementKey,
  });

  // Update achievement count
  await prisma.userGamification.update({
    where: { userId },
    data: { totalAchievements: { increment: 1 } },
  });

  return {
    achievementId: achievement.id,
    name: achievement.name,
    xpReward: achievement.xpReward,
  };
}

async function checkAndUnlockAchievements(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });
  const transactions = await prisma.transaction.findMany({ where: { userId } });
  const budgets = await prisma.budget.findMany({ where: { userId } });
  const receipts = await prisma.receipt.findMany({ where: { userId } });
  const alerts = await prisma.alert.findMany({ where: { userId } });

  const unlockedAchievements = [];

  // Check first_budget
  if (budgets.length > 0) {
    const result = await unlockAchievement(userId, "first_budget");
    if (result) unlockedAchievements.push(result);
  }

  // Check first_receipt
  if (receipts.length > 0) {
    const result = await unlockAchievement(userId, "first_receipt");
    if (result) unlockedAchievements.push(result);
  }

  // Check receipt counts
  if (receipts.length >= 10) {
    const result = await unlockAchievement(userId, "receipt_10");
    if (result) unlockedAchievements.push(result);
  }

  if (receipts.length >= 50) {
    const result = await unlockAchievement(userId, "receipt_50");
    if (result) unlockedAchievements.push(result);
  }

  // Check first_alert
  if (alerts.length > 0) {
    const result = await unlockAchievement(userId, "first_alert");
    if (result) unlockedAchievements.push(result);
  }

  // Check category diversity
  const categories = new Set(
    transactions.map((t) => t.category).filter(Boolean)
  );
  if (categories.size >= 5) {
    const result = await unlockAchievement(userId, "smart_category");
    if (result) unlockedAchievements.push(result);
  }

  // Check zero spending day (done via transaction tracking)
  // This would need to be called after a full day check

  return unlockedAchievements;
}

// ========== PET SYSTEM ==========

async function updatePet(userId) {
  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) return null;

  const now = new Date();
  const lastFed = new Date(gamification.petLastFed);
  const hoursSinceFed = (now - lastFed) / (1000 * 60 * 60);

  let happiness = gamification.petHappiness;
  let petType = gamification.petType;

  // Decrease happiness if not fed for a while
  if (hoursSinceFed > 24) {
    happiness = Math.max(0, happiness - 20);
  }

  // Evolve pet based on level
  const levelIndex = Math.min(gamification.level, 7);
  petType = PET_STAGES[levelIndex] || "👑";

  await prisma.userGamification.update({
    where: { userId },
    data: {
      petHappiness: happiness,
      petType,
    },
  });

  return {
    petType,
    happiness,
    lastFed,
  };
}

async function feedPet(userId) {
  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) return null;

  const happiness = Math.min(100, gamification.petHappiness + 20);

  await prisma.userGamification.update({
    where: { userId },
    data: {
      petHappiness: happiness,
      petLastFed: new Date(),
    },
  });

  // Add small XP bonus
  await addXp(userId, 10, "pet_fed", { petHappiness: happiness });

  return { petHappiness: happiness };
}

// ========== LEADERBOARD LOGIC ==========

async function updateLeaderboards() {
  // Update global XP leaderboard
  const users = await prisma.userGamification.findMany({
    orderBy: { totalXp: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  const globalXpData = users.map((u, idx) => ({
    rank: idx + 1,
    userId: u.userId,
    email: u.user.email,
    xp: u.totalXp,
    level: u.level,
  }));

  await prisma.leaderboard.upsert({
    where: { type: "global_xp" },
    create: {
      type: "global_xp",
      entriesJson: JSON.stringify(globalXpData),
    },
    update: {
      entriesJson: JSON.stringify(globalXpData),
    },
  });

  return globalXpData;
}

// ========== EXPORT ==========

module.exports = {
  initializeUserGamification,
  addXp,
  updateStreak,
  unlockAchievement,
  checkAndUnlockAchievements,
  updatePet,
  feedPet,
  updateLeaderboards,
  LEVELS,
  ACHIEVEMENTS_DB,
  PET_STAGES,
};
