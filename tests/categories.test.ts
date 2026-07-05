import { describe, it, expect } from 'vitest';
import { prisma } from './setup';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../src/modules/category/category.service';
import { createProduct } from '../src/modules/product/product.service';

describe('Categories Service', () => {
  it('should create a category', async () => {
    const cat = await createCategory({ name: 'Bebidas' });

    expect(cat).toBeDefined();
    expect(cat.name).toBe('Bebidas');
    expect(cat.id).toBeDefined();
  });

  it('should get all categories', async () => {
    await createCategory({ name: 'Lácteos' });
    await createCategory({ name: 'Panadería' });

    const categories = await getAllCategories();

    expect(categories.length).toBeGreaterThanOrEqual(2);
    expect(categories.find(c => c.name === 'Lácteos')).toBeDefined();
    expect(categories.find(c => c.name === 'Panadería')).toBeDefined();
  });

  it('should update a category', async () => {
    const cat = await createCategory({ name: 'Abarrotes' });

    const updated = await updateCategory(cat.id, { name: 'Abarrotes Premium' });

    expect(updated.name).toBe('Abarrotes Premium');

    const categories = await getAllCategories();
    expect(categories.find(c => c.name === 'Abarrotes Premium')).toBeDefined();
  });

  it('should delete a category', async () => {
    const cat = await createCategory({ name: 'Descartable' });

    const result = await deleteCategory(cat.id);

    expect(result).toBe(true);

    const categories = await getAllCategories();
    expect(categories.find(c => c.id === cat.id)).toBeUndefined();
  });

  it('should throw AppError when deleting category with associated products', async () => {
    const cat = await createCategory({ name: 'Electrónicos' });

    await createProduct({
      code: 'CATDEL001',
      name: 'Producto en categoría',
      price: 100,
      stock: 10,
      minStock: 2,
      categoryId: cat.id,
    });

    await expect(deleteCategory(cat.id)).rejects.toThrow('productos asociados');
  });
});
