export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  barcode?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  createdAt: string;
  margin?: number;
}

export interface CreateProductInput {
  code: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  barcode?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
