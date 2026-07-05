/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { prisma } from "./setup";
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../src/modules/supplier/supplier.service";

describe("Suppliers Service", () => {
  it("should create a supplier", async () => {
    const supplier = await createSupplier({
      name: "Distribuidora Test",
      ruc: "20123456789",
      contact: "Juan Pérez",
      phone: "987654321",
      address: "Av. Test 123",
    });

    expect(supplier).toBeDefined();
    expect(supplier.name).toBe("Distribuidora Test");
    expect(supplier.ruc).toBe("20123456789");
    expect(supplier.status).toBe("active");
  });

  it("should get a supplier by id", async () => {
    const created = await createSupplier({
      name: "Proveedor Test",
      ruc: "20987654321",
      contact: "María López",
      phone: "987654322",
      address: "Jr. Test 456",
    });

    const found = await getSupplierById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe("Proveedor Test");
    expect(found?.ruc).toBe("20987654321");
  });

  it("should get all suppliers", async () => {
    await createSupplier({
      name: "Supplier A",
      ruc: "20111111111",
      contact: "Contact A",
      phone: "111111111",
      address: "Addr A",
    });
    await createSupplier({
      name: "Supplier B",
      ruc: "20222222222",
      contact: "Contact B",
      phone: "222222222",
      address: "Addr B",
    });

    const result = await getAllSuppliers();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it("should update a supplier", async () => {
    const created = await createSupplier({
      name: "Proveedor Original",
      ruc: "20333333333",
      contact: "Carlos Ruiz",
      phone: "987654323",
      address: "Av. Original 789",
    });

    const updated = await updateSupplier(created.id, {
      name: "Proveedor Actualizado",
      status: "inactive",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Proveedor Actualizado");
    expect(updated?.status).toBe("inactive");
  });

  it("should delete a supplier", async () => {
    const created = await createSupplier({
      name: "Eliminar Proveedor",
      ruc: "20444444444",
      contact: "Test",
      phone: "444444444",
      address: "Addr",
    });

    const deleted = await deleteSupplier(created.id);
    expect(deleted).toBe(true);

    const found = await getSupplierById(created.id);
    expect(found).toBeNull();
  });

  it("should not create duplicate RUC", async () => {
    await createSupplier({
      name: "Supplier 1",
      ruc: "20555555555",
      contact: "Contact",
      phone: "555555555",
      address: "Addr",
    });

    await expect(
      createSupplier({
        name: "Supplier 2",
        ruc: "20555555555",
        contact: "Contact",
        phone: "555555555",
        address: "Addr",
      })
    ).rejects.toThrow();
  });
});
