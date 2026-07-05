/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { prisma } from './setup';
import { createProduct } from '../src/modules/product/product.service';
import { createSupplier } from '../src/modules/supplier/supplier.service';
import { createPurchaseOrder, receivePurchaseOrder, getAllPurchaseOrders } from '../src/modules/purchase/purchase.service';

describe('Purchases Service', () => {
  it('should create a purchase order', async () => {
    const supplier = await createSupplier({
      name: 'Proveedor Test',
      ruc: '2012345678' + Math.floor(Math.random() * 1000),
      contact: 'Juan Pérez',
      phone: '987654321',
      address: 'Av. Test 123',
    });

    const product = await createProduct({
      code: 'PURCH001',
      name: 'Producto Compra Test',
      price: 10.00,
      stock: 20,
      minStock: 5,
    });

    const order = await createPurchaseOrder({
      supplierId: supplier.id,
      items: [
        {
          productId: product.id,
          quantity: 10,
          unitPrice: 8.00,
        },
      ],
    });

    expect(order).toBeDefined();
    expect(order.status).toBe('pending');
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(10);
    expect(order.total).toBe(80.00);
  });

  it('should receive a purchase order and increase stock', async () => {
    const supplier = await createSupplier({
      name: 'Proveedor Test 2',
      ruc: '2098765432' + Math.floor(Math.random() * 1000),
      contact: 'María González',
      phone: '987654322',
      address: 'Jr. Test 456',
    });

    const product = await createProduct({
      code: 'PURCH002',
      name: 'Producto Recepción Test',
      price: 15.00,
      stock: 30,
      minStock: 10,
    });

    const order = await createPurchaseOrder({
      supplierId: supplier.id,
      items: [
        {
          productId: product.id,
          quantity: 15,
          unitPrice: 12.00,
        },
      ],
    });

    const receivedOrder = await receivePurchaseOrder(order.id);

    expect(receivedOrder).toBeDefined();
    expect(receivedOrder?.status).toBe('received');
    expect(receivedOrder?.receivedAt).toBeDefined();

    // Verificar que el stock aumentó
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(updatedProduct?.stock).toBe(45);

    // Verificar que se creó inventory movement
    const movements = await prisma.inventoryMovement.findMany({
      where: { productId: product.id, movementType: 'PURCHASE' },
    });
    expect(movements.length).toBeGreaterThan(0);
    const purchaseMovement = movements[0];
    expect(purchaseMovement.quantity).toBe(15);
    expect(purchaseMovement.stockBefore).toBe(30);
    expect(purchaseMovement.stockAfter).toBe(45);
  });

  it('should get all purchase orders', async () => {
    const supplier = await createSupplier({
      name: 'Proveedor Test 3',
      ruc: '2055555555' + Math.floor(Math.random() * 1000),
      contact: 'Carlos Rodríguez',
      phone: '987654323',
      address: 'Av. Test 789',
    });

    const product = await createProduct({
      code: 'PURCH003',
      name: 'Producto Listado Test',
      price: 20.00,
      stock: 25,
      minStock: 5,
    });

    await createPurchaseOrder({
      supplierId: supplier.id,
      items: [
        {
          productId: product.id,
          quantity: 5,
          unitPrice: 18.00,
        },
      ],
    });

    const result = await getAllPurchaseOrders();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });
});
