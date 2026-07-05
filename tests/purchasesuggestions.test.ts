import { describe, it, expect } from 'vitest';
import { createProduct } from '../src/modules/product/product.service';
import { getSuggestions } from '../src/modules/purchasesuggestion/purchasesuggestion.service';

describe('Purchase Suggestions Service', () => {
  it('should suggest products with stock below minimum', async () => {
    await createProduct({
      code: 'SUG001',
      name: 'Producto Bajo Stock',
      price: 10,
      stock: 3,
      minStock: 10,
    });

    const suggestions = await getSuggestions();

    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    const sug = suggestions.find(s => s.productCode === 'SUG001');
    expect(sug).toBeDefined();
    expect(sug!.currentStock).toBe(3);
    expect(sug!.minStock).toBe(10);
    expect(sug!.suggestedQuantity).toBe(17);
  });

  it('should not suggest products with sufficient stock', async () => {
    await createProduct({
      code: 'SUG002',
      name: 'Producto Stock Suficiente',
      price: 20,
      stock: 50,
      minStock: 10,
    });

    const suggestions = await getSuggestions();

    const sug = suggestions.find(s => s.productCode === 'SUG002');
    expect(sug).toBeUndefined();
  });

  it('should return empty array when all products have enough stock', async () => {
    await createProduct({
      code: 'SUG003',
      name: 'Producto Bien Stockeado',
      price: 5,
      stock: 100,
      minStock: 20,
    });

    const suggestions = await getSuggestions();
    expect(suggestions).toHaveLength(0);
  });

  it('should suggest exact quantity needed when stock is zero', async () => {
    await createProduct({
      code: 'SUG004',
      name: 'Producto Sin Stock',
      price: 30,
      stock: 0,
      minStock: 15,
    });

    const suggestions = await getSuggestions();

    const sug = suggestions.find(s => s.productCode === 'SUG004');
    expect(sug).toBeDefined();
    expect(sug!.suggestedQuantity).toBe(30);
  });
});
