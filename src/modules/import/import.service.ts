import { parse } from "csv-parse/sync";
import { prisma } from "../../lib/prisma";
import type { ImportResult } from "./import.types";

let importCounter = 0;

export async function importProductsFromCSV(fileBuffer: Buffer): Promise<ImportResult> {
  const content = fileBuffer.toString("utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ",",
  }) as Record<string, string>[];

  let created = 0;
  const errors: string[] = [];
  const timestamp = Date.now();

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      try {
        importCounter++;
        const code = row.code || row.Codigo || row.codigo || `IMP-${timestamp}-${importCounter}`;
        const name = row.name || row.Nombre || row.nombre || row.Producto || row.producto;
        const price = parseFloat(row.price || row.Precio || row.precio || "0");
        const stock = parseInt(row.stock || row.Stock || row.stock || "0");
        const minStock = parseInt(row.minStock || row.min_stock || row["Stock Minimo"] || row["stock_minimo"] || "5");
        const costPrice = parseFloat(row.costPrice || row.cost_price || row["Precio Costo"] || row["precio_costo"] || "0");

        if (!name) {
          errors.push(`Fila ${i + 2}: Nombre requerido`);
          continue;
        }

        const categoryName = row.category || row.Categoria || row.categoria || "";
        let categoryId: string | undefined;
        if (categoryName) {
          const cat = await tx.category.upsert({
            where: { name: categoryName },
            create: { name: categoryName },
            update: {},
          });
          categoryId = cat.id;
        }

        await tx.product.create({
          data: {
            code,
            name,
            price: isNaN(price) || price < 0 ? 0 : price,
            costPrice: isNaN(costPrice) || costPrice < 0 ? 0 : costPrice,
            stock: isNaN(stock) || stock < 0 ? 0 : stock,
            minStock: isNaN(minStock) || minStock < 0 ? 5 : minStock,
            categoryId,
          },
        });
        created++;
      } catch (err: any) {
        errors.push(`Fila ${i + 2}: ${err.message}`);
      }
    }
  });

  return { created, errors: errors.slice(0, 20), totalErrors: errors.length };
}
