/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { prisma } from './setup';
import { createProduct } from '../src/modules/product/product.service';
import { createMovement, getAllMovements, getMovementsByProductId } from '../src/modules/inventory/inventory.service';

describe('Inventory Service', () => {
  it('should create an inventory movement', async () => {
    const product = await createProduct({
      code: 'INV001',
      name: 'Producto Inventario Test',
      price: 10.00,
      stock: 50,
      minStock: 10,
    });

    const movement = await createMovement({
      productId: product.id,
      movementType: 'adjustment',
      quantity: 5,
      reason: 'Ajuste de prueba',
    });

    expect(movement).toBeDefined();
    expect(movement.movementType).toBe('adjustment');
    expect(movement.quantity).toBe(5);

    // Verificar que el stock se actualizó
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(updatedProduct?.stock).toBe(55);
  });

  it('should create an adjustment movement with reason', async () => {
    const product = await createProduct({
      code: 'INV002',
      name: 'Producto Ajuste Test',
      price: 15.00,
      stock: 30,
      minStock: 10,
    });

    const movement = await createMovement({
      productId: product.id,
      movementType: 'adjustment',
      quantity: 10,
      reason: 'Ajuste manual',
    });

    expect(movement).toBeDefined();
    expect(movement.movementType).toBe('adjustment');

    // Verificar que el stock aumentó
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(updatedProduct?.stock).toBe(40);
  });

  it('should get all inventory movements', async () => {
    const product = await createProduct({
      code: 'INV003',
      name: 'Producto Listado Inventario Test',
      price: 20.00,
      stock: 25,
      minStock: 5,
    });

    await createMovement({
      productId: product.id,
      movementType: 'adjustment',
      quantity: 3,
      reason: 'Test listado',
    });

    const result = await getAllMovements();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should get movements by product id', async () => {
    const product = await createProduct({
      code: 'INV004',
      name: 'Producto Filtro Inventario Test',
      price: 25.00,
      stock: 20,
      minStock: 5,
    });

    await createMovement({
      productId: product.id,
      movementType: 'adjustment',
      quantity: 2,
      reason: 'Test filtro',
    });

    const movements = await getMovementsByProductId(product.id);

    expect(Array.isArray(movements)).toBe(true);
    expect(movements.length).toBeGreaterThan(0);
    expect(movements.every(m => m.productId === product.id)).toBe(true);
  });
});
