const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('USERS', JSON.stringify(users, null, 2));

    const assignments = await prisma.assignment.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, userId: true, title: true, course: true, status: true, priority: true, dueDate: true }
    });
    console.log('ASSIGNMENTS', JSON.stringify(assignments, null, 2));
    console.log('TOTAL_COUNT', await prisma.assignment.count());
  } catch (err) {
    console.error('ERR', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
