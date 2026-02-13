const { PrismaClient } = require("@prisma/client");
const gamification = require("./src/gamification");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding achievements...");

  try {
    // Check if achievements already exist
    const existingAchievements = await prisma.achievement.findMany();

    if (existingAchievements.length > 0) {
      console.log(`✅ Achievements already exist (${existingAchievements.length})`);
      return;
    }

    // Create all achievements
    const created = await Promise.all(
      gamification.ACHIEVEMENTS_DB.map((ach) =>
        prisma.achievement
          .create({ data: ach })
          .then(() => console.log(`  ✓ ${ach.name}`))
          .catch((err) => console.error(`  ✗ ${ach.name}:`, err.message))
      )
    );

    console.log(
      `\n✅ Successfully created ${created.length} achievements!`
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
