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
      phone: "987654321",
      address: "Av. Siempre Viva 123",
    });

    expect(customer).toBeDefined();
    expect(customer.name).toBe("Juan Pérez");
    expect(customer.phone).toBe("987654321");
    expect(customer.address).toBe("Av. Siempre Viva 123");
  });

  it("should get a customer by id", async () => {
    const created = await createCustomer({
      name: "María López",
      phone: "987654322",
    });

    const found = await getCustomerById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe("María López");
    expect(found?.phone).toBe("987654322");
  });

  it("should get all customers", async () => {
    await createCustomer({ name: "Customer A" });
    await createCustomer({ name: "Customer B" });

    const result = await getAllCustomers();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it("should update a customer", async () => {
    const created = await createCustomer({
      name: "Carlos Ruiz",
      phone: "987654323",
    });

    const updated = await updateCustomer(created.id, {
      name: "Carlos Ruiz Actualizado",
      phone: "999888777",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Carlos Ruiz Actualizado");
    expect(updated?.phone).toBe("999888777");
  });

  it("should delete a customer", async () => {
    const created = await createCustomer({
      name: "Eliminar Cliente",
    });

    const deleted = await deleteCustomer(created.id);
    expect(deleted).toBe(true);

    const found = await getCustomerById(created.id);
    expect(found).toBeNull();
  });
});
