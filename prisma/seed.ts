/// <reference types="node" />
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gestor_huaskar?schema=public",
    },
  },
});

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // Limpiar datos existentes (ordenado por foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.salePayment.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.cashRegisterSession.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Datos existentes eliminados");

  // Crear usuario admin por defecto
  const hashedPassword = await bcrypt.hash("Admin123*", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@huskar.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario admin creado (admin@huskar.com / Admin123*)");

  // Crear proveedores
  const suppliers = await prisma.supplier.createMany({
    data: [
      {
        name: "Distribuidora Lima S.A.",
        ruc: "20123456789",
        contact: "Carlos Pérez",
        phone: "987654321",
        address: "Av. Industrial 1234, Lima",
        status: "ACTIVE",
      },
      {
        name: "Importadora Andina",
        ruc: "20987654321",
        contact: "María González",
        phone: "987654322",
        address: "Jr. Comercio 567, Lima",
        status: "ACTIVE",
      },
      {
        name: "Proveedores del Norte",
        ruc: "20555555555",
        contact: "Juan Rodríguez",
        phone: "987654323",
        address: "Av. Principal 890, Trujillo",
        status: "ACTIVE",
      },
    ],
  });

  console.log(`✅ ${suppliers.count} proveedores creados`);

  // Crear productos
  const products = await prisma.product.createMany({
    data: [
      {
        code: "PROD001",
        name: "Arroz Premium 1kg",
        price: 5.50,
        stock: 100,
        minStock: 20,
      },
      {
        code: "PROD002",
        name: "Azúcar Blanca 1kg",
        price: 4.20,
        stock: 80,
        minStock: 15,
      },
      {
        code: "PROD003",
        name: "Aceite Vegetal 1L",
        price: 8.90,
        stock: 50,
        minStock: 10,
      },
      {
        code: "PROD004",
        name: "Fideos Tallarín 500g",
        price: 3.50,
        stock: 120,
        minStock: 25,
      },
      {
        code: "PROD005",
        name: "Leche Entera 1L",
        price: 4.80,
        stock: 60,
        minStock: 15,
      },
      {
        code: "PROD006",
        name: "Pan de Molde 500g",
        price: 6.00,
        stock: 40,
        minStock: 10,
      },
      {
        code: "PROD007",
        name: "Café Molido 250g",
        price: 15.90,
        stock: 30,
        minStock: 8,
      },
      {
        code: "PROD008",
        name: "Galletas Chocolate 200g",
        price: 7.50,
        stock: 70,
        minStock: 12,
      },
      {
        code: "PROD009",
        name: "Detergente Líquido 1L",
        price: 9.20,
        stock: 45,
        minStock: 10,
      },
      {
        code: "PROD010",
        name: "Jabón de Tocador 3u",
        price: 12.00,
        stock: 35,
        minStock: 8,
      },
    ],
  });

  console.log(`✅ ${products.count} productos creados`);

  // Obtener IDs para relaciones
  const supplierData = await prisma.supplier.findMany();
  const productData = await prisma.product.findMany();

  const supplier1 = supplierData[0];
  const supplier2 = supplierData[1];
  const product1 = productData[0];
  const product2 = productData[1];
  const product3 = productData[2];
  const product4 = productData[3];

  // Crear cliente
  const customer = await prisma.customer.create({
    data: {
      name: "Consumidor Final",
    },
  });

  console.log("✅ Cliente creado");

  // Crear orden de compra 1
  const purchaseOrder1 = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier1.id,
      supplierName: supplier1.name,
      total: 710.00,
      status: "RECEIVED",
      receivedAt: new Date(),
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.name,
            quantity: 50,
            unitPrice: 5.50,
            subtotal: 275.00,
          },
          {
            productId: product2.id,
            productName: product2.name,
            quantity: 40,
            unitPrice: 4.20,
            subtotal: 168.00,
          },
          {
            productId: product3.id,
            productName: product3.name,
            quantity: 30,
            unitPrice: 8.90,
            subtotal: 267.00,
          },
        ],
      },
    },
  });

  console.log("✅ Orden de compra 1 creada y recibida");

  // Crear orden de compra 2 (pendiente)
  const purchaseOrder2 = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier2.id,
      supplierName: supplier2.name,
      total: 300.00,
      status: "PENDING",
      items: {
        create: [
          {
            productId: product4.id,
            productName: product4.name,
            quantity: 60,
            unitPrice: 3.50,
            subtotal: 210.00,
          },
          {
            productId: product1.id,
            productName: product1.name,
            quantity: 20,
            unitPrice: 5.50,
            subtotal: 90.00,
          },
        ],
      },
    },
  });

  console.log("✅ Orden de compra 2 creada (pendiente)");

  // Actualizar stock de productos según compras recibidas
  await prisma.product.update({
    where: { id: product1.id },
    data: { stock: product1.stock + 50 },
  });

  await prisma.product.update({
    where: { id: product2.id },
    data: { stock: product2.stock + 40 },
  });

  await prisma.product.update({
    where: { id: product3.id },
    data: { stock: product3.stock + 30 },
  });

  // Crear inventory movements para compras
  await prisma.inventoryMovement.createMany({
    data: [
      {
        productId: product1.id,
        productName: product1.name,
        movementType: "PURCHASE",
        quantity: 50,
        stockBefore: 100,
        stockAfter: 150,
        reason: "Compra recibida - " + supplier1.name,
      },
      {
        productId: product2.id,
        productName: product2.name,
        movementType: "PURCHASE",
        quantity: 40,
        stockBefore: 80,
        stockAfter: 120,
        reason: "Compra recibida - " + supplier1.name,
      },
      {
        productId: product3.id,
        productName: product3.name,
        movementType: "PURCHASE",
        quantity: 30,
        stockBefore: 50,
        stockAfter: 80,
        reason: "Compra recibida - " + supplier1.name,
      },
    ],
  });

  console.log("✅ Inventory movements de compras creados");

  // Crear ventas
  const sale1 = await prisma.sale.create({
    data: {
      receiptType: "BOLETA",
      customerDocType: "DNI",
      customerDocNumber: "12345678",
      customerName: "Juan Pérez",
      total: 17.20,
      paymentMethod: "CASH",
      status: "ACTIVE",
      customerId: customer.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 2,
            unitPrice: 5.50,
            subtotal: 11.00,
          },
          {
            productId: product2.id,
            quantity: 2,
            unitPrice: 4.20,
            subtotal: 8.40,
          },
        ],
      },
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      receiptType: "FACTURA",
      customerDocType: "RUC",
      customerDocNumber: "20123456789",
      customerName: "Empresa ABC S.A.C.",
      total: 26.80,
      paymentMethod: "CARD",
      status: "ACTIVE",
      customerId: customer.id,
      items: {
        create: [
          {
            productId: product3.id,
            quantity: 2,
            unitPrice: 8.90,
            subtotal: 17.80,
          },
          {
            productId: product4.id,
            quantity: 3,
            unitPrice: 3.50,
            subtotal: 10.50,
          },
        ],
      },
    },
  });

  const sale3 = await prisma.sale.create({
    data: {
      receiptType: "BOLETA",
      customerName: "María López",
      total: 14.40,
      paymentMethod: "YAPE",
      status: "CANCELLED",
      cancelledAt: new Date(),
      customerId: customer.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            unitPrice: 5.50,
            subtotal: 5.50,
          },
          {
            productId: product3.id,
            quantity: 1,
            unitPrice: 8.90,
            subtotal: 8.90,
          },
        ],
      },
    },
  });

  console.log("✅ 3 ventas creadas");

  // Actualizar stock según ventas activas (excluyendo ventas canceladas)
  await prisma.product.update({
    where: { id: product1.id },
    data: { stock: 150 - 2 },
  });

  await prisma.product.update({
    where: { id: product2.id },
    data: { stock: 120 - 2 },
  });

  await prisma.product.update({
    where: { id: product3.id },
    data: { stock: 80 - 2 },
  });

  await prisma.product.update({
    where: { id: product4.id },
    data: { stock: 120 - 3 },
  });

  // Crear inventory movements para ventas
  await prisma.inventoryMovement.createMany({
    data: [
      {
        productId: product1.id,
        productName: product1.name,
        movementType: "SALE",
        quantity: 2,
        stockBefore: 150,
        stockAfter: 148,
        referenceId: sale1.id,
      },
      {
        productId: product2.id,
        productName: product2.name,
        movementType: "SALE",
        quantity: 2,
        stockBefore: 120,
        stockAfter: 118,
        referenceId: sale1.id,
      },
      {
        productId: product3.id,
        productName: product3.name,
        movementType: "SALE",
        quantity: 2,
        stockBefore: 80,
        stockAfter: 78,
        referenceId: sale2.id,
      },
      {
        productId: product4.id,
        productName: product4.name,
        movementType: "SALE",
        quantity: 3,
        stockBefore: 120,
        stockAfter: 117,
        referenceId: sale2.id,
      },
      {
        productId: product1.id,
        productName: product1.name,
        movementType: "SALE",
        quantity: 1,
        stockBefore: 148,
        stockAfter: 147,
        referenceId: sale3.id,
      },
      {
        productId: product3.id,
        productName: product3.name,
        movementType: "SALE",
        quantity: 1,
        stockBefore: 78,
        stockAfter: 77,
        referenceId: sale3.id,
      },
      {
        productId: product1.id,
        productName: product1.name,
        movementType: "ADJUSTMENT",
        quantity: 1,
        stockBefore: 147,
        stockAfter: 148,
        reason: "Anulación de venta",
        referenceId: sale3.id,
      },
      {
        productId: product3.id,
        productName: product3.name,
        movementType: "ADJUSTMENT",
        quantity: 1,
        stockBefore: 77,
        stockAfter: 78,
        reason: "Anulación de venta",
        referenceId: sale3.id,
      },
    ],
  });

  console.log("✅ Inventory movements de ventas creados");

  console.log("🎉 Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log(`   - 1 usuario admin`);
  console.log(`   - 3 proveedores`);
  console.log(`   - 10 productos`);
  console.log(`   - 1 cliente`);
  console.log(`   - 2 órdenes de compra (1 recibida, 1 pendiente)`);
  console.log(`   - 3 ventas (2 activas, 1 cancelada)`);
  console.log(`   - 11 movimientos de inventario`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
