/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';

// Base de datos de test PostgreSQL (usa puerto distinto al de desarrollo)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gestor_huaskar_test?schema=public';
process.env.DATABASE_URL = TEST_DATABASE_URL;

const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('🧪 Setting up test database...');
  
  // Sincronizar esquema en la base de datos de test
  try {
    execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    });
  } catch (error) {
    console.log('⚠️  db push failed, make sure PostgreSQL is running on port 5433');
    console.log('   You can run: docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine');
    throw error;
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test database...');
  await prisma.$disconnect();
});

beforeEach(async () => {
  try {
    await prisma.inventoryMovement.deleteMany();
    await prisma.salePayment.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.productBatch.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.cashRegisterSession.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('⚠️  Error cleaning tables:', error);
  }
});

export { prisma };
