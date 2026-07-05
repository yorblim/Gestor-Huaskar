import { describe, it, expect } from 'vitest';
import { importProductsFromCSV } from '../src/modules/import/import.service';

describe('Import Service', () => {
  it('should import products from CSV buffer', async () => {
    const csvContent = [
      'code,name,price,stock,minStock',
      'IMP001,Producto Import 1,25.50,100,10',
      'IMP002,Producto Import 2,40.00,50,5',
    ].join('\n');

    const result = await importProductsFromCSV(Buffer.from(csvContent));

    expect(result.created).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(result.totalErrors).toBe(0);
  });

  it('should handle Spanish column names', async () => {
    const csvContent = [
      'Codigo,Nombre,Precio,Stock,Stock Minimo',
      'IMP003,Gaseosa,3.50,200,20',
      'IMP004,Galletas,1.20,150,30',
    ].join('\n');

    const result = await importProductsFromCSV(Buffer.from(csvContent));

    expect(result.created).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle category column and auto-create categories', async () => {
    const csvContent = [
      'code,name,price,stock,minStock,category',
      'IMP005,Arroz,2.50,300,50,Abarrotes',
      'IMP006,Fideos,1.80,250,40,Abarrotes',
    ].join('\n');

    const result = await importProductsFromCSV(Buffer.from(csvContent));

    expect(result.created).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should report errors for invalid rows', async () => {
    const csvContent = [
      'code,name,price,stock,minStock',
      ',Producto Sin Codigo,10,5,1',
      'IMP008,,15,10,2',
    ].join('\n');

    const result = await importProductsFromCSV(Buffer.from(csvContent));

    expect(result.created).toBeGreaterThanOrEqual(1);
    expect(result.totalErrors).toBeGreaterThanOrEqual(1);
  });
});
