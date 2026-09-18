/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { prisma } from "./setup";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../src/modules/customer/customer.service";

describe("Customers Service", () => {
  it("should create a customer", async () => {
    const customer = await createCustomer({
      name: "Juan Pérez",
      docType: "dni",
      docNumber: "12345678",
      phone: "987654321",
      address: "Av. Siempre Viva 123",
    });

    expect(customer).toBeDefined();
    expect(customer.name).toBe("Juan Pérez");
    expect(customer.docType).toBe("dni");
    expect(customer.docNumber).toBe("12345678");
    expect(customer.phone).toBe("987654321");
    expect(customer.address).toBe("Av. Siempre Viva 123");
  });

  it("should get a customer by id", async () => {
    const created = await createCustomer({
      name: "María López",
      docType: "dni",
      docNumber: "87654321",
      phone: "987654322",
    });

    const found = await getCustomerById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe("María López");
    expect(found?.docType).toBe("dni");
    expect(found?.docNumber).toBe("87654321");
    expect(found?.phone).toBe("987654322");
  });

  it("should get all customers", async () => {
    await createCustomer({ name: "Customer A", docType: "dni", docNumber: "11111111" });
    await createCustomer({ name: "Customer B", docType: "dni", docNumber: "22222222" });

    const result = await getAllCustomers();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it("should search customers by document number", async () => {
    await createCustomer({ name: "Search By Doc", docType: "ruc", docNumber: "20123456789" });

    const result = await getAllCustomers({ search: "20123456789" });

    expect(result.data.some((c) => c.docNumber === "20123456789")).toBe(true);
  });

  it("should reject duplicate document number", async () => {
    await createCustomer({ name: "Duplicado 1", docType: "dni", docNumber: "33333333" });

    await expect(
      createCustomer({ name: "Duplicado 2", docType: "dni", docNumber: "33333333" })
    ).rejects.toThrow("Ya existe un cliente con ese tipo y número de documento.");
  });

  it("should update a customer", async () => {
    const created = await createCustomer({
      name: "Carlos Ruiz",
      docType: "dni",
      docNumber: "44444444",
      phone: "987654323",
    });

    const updated = await updateCustomer(created.id, {
      name: "Carlos Ruiz Actualizado",
      docType: "ruc",
      docNumber: "20555555555",
      phone: "999888777",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Carlos Ruiz Actualizado");
    expect(updated?.docType).toBe("ruc");
    expect(updated?.docNumber).toBe("20555555555");
    expect(updated?.phone).toBe("999888777");
  });

  it("should clear customer document", async () => {
    const created = await createCustomer({
      name: "Cliente Sin Doc",
      docType: "dni",
      docNumber: "55555555",
    });

    const updated = await updateCustomer(created.id, { docNumber: "" });

    expect(updated?.docType).toBeUndefined();
    expect(updated?.docNumber).toBeUndefined();
  });

  it("should delete a customer", async () => {
    const created = await createCustomer({
      name: "Eliminar Cliente",
      docType: "dni",
      docNumber: "66666666",
    });

    const deleted = await deleteCustomer(created.id);
    expect(deleted).toBe(true);

    const found = await getCustomerById(created.id);
    expect(found).toBeNull();
  });
});