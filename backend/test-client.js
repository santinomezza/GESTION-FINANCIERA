const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.transaction.findMany({ take: 1 });
    console.log('SUCCESS');
  } catch (e) {
    console.log('ERROR:', e.message);
    console.log('CODE:', e.code);
    console.log('META:', JSON.stringify(e.meta));
  } finally {
    await prisma.$disconnect();
  }
}

main();
