const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('20100723Para', 10);
        
        const user = await prisma.user.upsert({
            where: { email: 'pzhumash@gmail.com' },
            update: {},
            create: {
                email: 'pzhumash@gmail.com',
                password: hashedPassword,
                name: 'Test User',
            },
        });

        console.log('✅ User created:', user);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
