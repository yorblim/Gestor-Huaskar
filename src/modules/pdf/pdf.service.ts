import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export async function getInvoiceSale(saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      items: { include: { product: { select: { name: true } } } },
      customer: true,
    },
  });

  if (!sale) {
    throw new AppError("Venta no encontrada", 404);
  }

  return sale;
}

export function buildInvoicePDF(sale: any): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  doc.fontSize(22).font("Helvetica-Bold").text("HUSKAR Minimarket", { align: "center" });
  doc.fontSize(9).font("Helvetica").text("RUC: 12345678901", { align: "center" });
  doc.text("Av. Principal 123 - Lima | Tel: (01) 555-1234", { align: "center" });
  doc.moveDown(0.5);

  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#ccc");
  doc.moveDown(0.5);

  doc.fontSize(14).font("Helvetica-Bold").text(sale.receiptType === "FACTURA" ? "FACTURA" : "BOLETA", { align: "center" });
  doc.moveDown(0.5);

  doc.fontSize(9).font("Helvetica");
  doc.text(`N°: ${sale.id.slice(0, 8).toUpperCase()}`, { continued: true })
    .text(`  Fecha: ${new Date(sale.createdAt).toLocaleDateString("es-PE")}`, { align: "right" });
  doc.text(`Cliente: ${sale.customerName || "Consumidor Final"}`);
  if (sale.customerDocNumber) doc.text(`${sale.customerDocType === "RUC" ? "RUC" : "Doc"}: ${sale.customerDocNumber}`);

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#ccc");
  doc.moveDown(0.5);

  const colX = [40, 230, 340, 400, 490];
  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("Producto", colX[0], doc.y, { width: 190 });
  doc.text("Cant", colX[1], doc.y - 11, { width: 50, align: "center" });
  doc.text("Precio", colX[2], doc.y - 11, { width: 60, align: "right" });
  doc.text("Subtotal", colX[4], doc.y - 11, { width: 65, align: "right" });

  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#eee");
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(9);
  for (const item of sale.items) {
    const y = doc.y;
    doc.text(item.product.name, colX[0], y, { width: 190 });
    doc.text(String(item.quantity), colX[1], y, { width: 50, align: "center" });
    doc.text(`S/ ${parseFloat(item.unitPrice.toString()).toFixed(2)}`, colX[2], y, { width: 60, align: "right" });
    doc.text(`S/ ${parseFloat(item.subtotal.toString()).toFixed(2)}`, colX[4], y, { width: 65, align: "right" });
    doc.moveDown(0.5);
  }

  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#ccc");
  doc.moveDown(0.5);

  const totalX = 370;
  doc.fontSize(9).font("Helvetica");
  doc.text("Subtotal:", totalX, doc.y, { width: 100 });
  doc.text(`S/ ${parseFloat(sale.subtotal.toString()).toFixed(2)}`, totalX + 100, doc.y - 11, { width: 85, align: "right" });

  if (parseFloat(sale.discount.toString()) > 0) {
    doc.text("Descuento:", totalX, doc.y, { width: 100 });
    doc.text(`-S/ ${parseFloat(sale.discount.toString()).toFixed(2)}`, totalX + 100, doc.y - 11, { width: 85, align: "right" });
  }

  if (parseFloat(sale.tax.toString()) > 0) {
    doc.text("IGV (18%):", totalX, doc.y, { width: 100 });
    doc.text(`S/ ${parseFloat(sale.tax.toString()).toFixed(2)}`, totalX + 100, doc.y - 11, { width: 85, align: "right" });
  }

  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("TOTAL:", totalX, doc.y, { width: 100 });
  doc.text(`S/ ${parseFloat(sale.total.toString()).toFixed(2)}`, totalX + 100, doc.y - 14, { width: 85, align: "right" });

  doc.end();
  return doc;
}
