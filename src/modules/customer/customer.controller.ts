import { Request, Response, NextFunction } from "express";
import { getAllCustomers, getCustomerById, createCustomer as createCustomerService, updateCustomer as updateCustomerService, deleteCustomer as deleteCustomerService } from "./customer.service";
import { CreateCustomerInput, UpdateCustomerInput, CustomerResponse } from "./customer.types";

export async function getAllCustomersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllCustomers(req.query as Record<string, any>);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const customer = await getCustomerById(id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Cliente no encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data: CreateCustomerInput = req.body;
    const customer: CustomerResponse = await createCustomerService(data);
    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data: UpdateCustomerInput = req.body;
    const updated = await updateCustomerService(id, data);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Cliente no encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const deleted = await deleteCustomerService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Cliente no encontrado o tiene ventas asociadas.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cliente eliminado.",
    });
  } catch (error) {
    next(error);
  }
}
