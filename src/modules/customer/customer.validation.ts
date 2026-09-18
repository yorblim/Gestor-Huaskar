import { z } from "zod";
import { CustomerDocType } from "./customer.types";

const docTypeEnum = z.enum(["dni", "ruc", "ce", "passport"]);

function validateDocFormat(type: CustomerDocType | undefined, number: string | undefined): string | null {
  if (!type || !number) return null;
  const clean = number.replace(/\s+/g, "");

  if (type === "dni") {
    return /^\d{8}$/.test(clean) ? null : "El DNI debe tener 8 dígitos.";
  }
  if (type === "ruc") {
    return /^\d{11}$/.test(clean) ? null : "El RUC debe tener 11 dígitos.";
  }
  if (type === "ce") {
    return /^[A-Za-z0-9]{8,12}$/.test(clean) ? null : "El Carné de Extranjería debe tener entre 8 y 12 caracteres.";
  }
  return /^[A-Za-z0-9]{6,15}$/.test(clean) ? null : "El Pasaporte debe tener entre 6 y 15 caracteres.";
}

function docFormatRefinement(data: { docType?: CustomerDocType; docNumber?: string }, ctx: z.RefinementCtx) {
  if (!data.docType && !data.docNumber) return;

  const message = validateDocFormat(data.docType, data.docNumber);
  if (!message) return;

  ctx.addIssue({
    code: "custom",
    path: ["docNumber"],
    message,
  });
}

function docPairRequiredRefinement(
  data: { docType?: CustomerDocType; docNumber?: string },
  ctx: z.RefinementCtx
) {
  if (data.docType && !data.docNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["docNumber"],
      message: "Debe indicar el número de documento.",
    });
  }
  if (!data.docType && data.docNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["docType"],
      message: "Debe indicar el tipo de documento.",
    });
  }
}

const baseFields = {
  name: z.string().min(1, "El nombre es requerido").trim(),
  docType: docTypeEnum.optional(),
  docNumber: z
    .string()
    .trim()
    .min(1, "El número de documento no puede estar vacío")
    .max(20, "El número de documento es demasiado largo")
    .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
};

export const createCustomerSchema = z
  .object(baseFields)
  .superRefine(docPairRequiredRefinement)
  .superRefine(docFormatRefinement);

export const updateCustomerSchema = z.object(baseFields).superRefine(docFormatRefinement);