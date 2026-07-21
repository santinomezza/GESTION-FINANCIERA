import { PrismaClient, CategoryType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding base de datos...');

  const passwordHash = await bcrypt.hash('demo123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestionar2.com' },
    update: {},
    create: {
      email: 'admin@gestionar2.com',
      name: 'Administrador',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuario admin:', admin.email);

  let workspace = await prisma.workspace.findFirst({
    where: { userId: admin.id, type: 'PERSONAL' },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Personal',
        type: 'PERSONAL',
        userId: admin.id,
      },
    });
    console.log('✅ Workspace:', workspace.name);
  }

  const categories = [
    { name: 'Ventas', icon: 'trending-up', color: '#22c55e', type: CategoryType.INCOME, sortOrder: 1 },
    { name: 'Cobros', icon: 'dollar-sign', color: '#16a34a', type: CategoryType.INCOME, sortOrder: 2 },
    { name: 'Stock', icon: 'package', color: '#3b82f6', type: CategoryType.EXPENSE, sortOrder: 3 },
    { name: 'Nafta', icon: 'fuel', color: '#f59e0b', type: CategoryType.EXPENSE, sortOrder: 4 },
    { name: 'Sueldos', icon: 'users', color: '#8b5cf6', type: CategoryType.EXPENSE, sortOrder: 5 },
    { name: 'Servicios', icon: 'zap', color: '#06b6d4', type: CategoryType.EXPENSE, sortOrder: 6 },
    { name: 'Impuestos', icon: 'file-text', color: '#ef4444', type: CategoryType.EXPENSE, sortOrder: 7 },
    { name: 'Gastos Varios', icon: 'tag', color: '#6b7280', type: CategoryType.EXPENSE, sortOrder: 8 },
    { name: 'Clientes', icon: 'briefcase', color: '#385144', type: CategoryType.MIXED, sortOrder: 9 },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { workspaceId: workspace.id, name: cat.name } });
    if (!existing) {
      await prisma.category.create({ data: { ...cat, workspaceId: workspace.id } });
    }
  }
  console.log('✅ Categorías listas');

  const now = new Date();
  const createdCats = await prisma.category.findMany({ where: { workspaceId: workspace.id } });
  const getCat = (name: string) => createdCats.find(c => c.name === name);

  const demoTransactions = [
    { type: 'INCOME', amount: 500000, categoryId: getCat('Ventas')?.id, description: 'Venta principal del mes', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { type: 'INCOME', amount: 150000, categoryId: getCat('Cobros')?.id, description: 'Cobro cliente Juan Pérez', date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { type: 'EXPENSE', amount: 45000, categoryId: getCat('Stock')?.id, description: 'Compra de mercadería', date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { type: 'EXPENSE', amount: 25000, categoryId: getCat('Nafta')?.id, description: 'Carga de combustible', date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { type: 'EXPENSE', amount: 95000, categoryId: getCat('Sueldos')?.id, description: 'Sueldos del mes', date: new Date(now.getFullYear(), now.getMonth(), 15) },
    { type: 'EXPENSE', amount: 8500, categoryId: getCat('Servicios')?.id, description: 'Factura de luz', date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { type: 'INCOME', amount: 420000, categoryId: getCat('Ventas')?.id, description: 'Ventas mes anterior', date: new Date(now.getFullYear(), now.getMonth() - 1, 5) },
    { type: 'INCOME', amount: 80000, categoryId: getCat('Cobros')?.id, description: 'Cobro pendiente', date: new Date(now.getFullYear(), now.getMonth() - 1, 20) },
    { type: 'EXPENSE', amount: 38000, categoryId: getCat('Stock')?.id, description: 'Reposición stock', date: new Date(now.getFullYear(), now.getMonth() - 1, 8) },
    { type: 'EXPENSE', amount: 22000, categoryId: getCat('Nafta')?.id, description: 'Combustible', date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
    { type: 'EXPENSE', amount: 95000, categoryId: getCat('Sueldos')?.id, description: 'Sueldos', date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
    { type: 'EXPENSE', amount: 15000, categoryId: getCat('Impuestos')?.id, description: 'Impuesto municipal', date: new Date(now.getFullYear(), now.getMonth() - 1, 10) },
    { type: 'INCOME', amount: 380000, categoryId: getCat('Ventas')?.id, description: 'Ventas', date: new Date(now.getFullYear(), now.getMonth() - 2, 5) },
    { type: 'EXPENSE', amount: 35000, categoryId: getCat('Stock')?.id, description: 'Compra stock', date: new Date(now.getFullYear(), now.getMonth() - 2, 8) },
    { type: 'EXPENSE', amount: 95000, categoryId: getCat('Sueldos')?.id, description: 'Sueldos', date: new Date(now.getFullYear(), now.getMonth() - 2, 15) },
    { type: 'EXPENSE', amount: 12000, categoryId: getCat('Nafta')?.id, description: 'Combustible', date: new Date(now.getFullYear(), now.getMonth() - 2, 10) },
  ];

  for (const tx of demoTransactions) {
    if (!tx.categoryId) continue;
    await prisma.transaction.create({
      data: {
        ...(tx as any),
        workspaceId: workspace.id,
        status: 'CONFIRMED',
        paymentMethod: 'CASH',
        source: 'seed',
      },
    });
  }
  console.log('✅ Transacciones de demo creadas');

  console.log('\n🎉 Seed completado!');
  console.log('📧 Email: admin@gestionar2.com');
  console.log('🔑 Password: demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
