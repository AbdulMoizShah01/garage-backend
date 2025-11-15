import fs from "node:fs";
import path from "node:path";

import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";

import { INVOICE_PREFIX, VAT_RATE } from "./work-order.constants";

const ASSETS_LOGO_PATH = path.resolve(
  __dirname,
  "../../../assets/Full logo.png",
);

type InvoiceWorkOrder = Prisma.WorkOrderGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    lineItems: true;
    assignments: {
      include: {
        worker: true;
      };
    };
  };
}>;

type PdfDoc = InstanceType<typeof PDFDocument>;

const toNumber = (value: Prisma.Decimal | number | string | null | undefined) =>
  value instanceof Prisma.Decimal ? value.toNumber() : Number(value ?? 0);

const currency = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
});

export const buildInvoiceCode = (order: { id: number; createdAt: Date }) => {
  const year = order.createdAt?.getFullYear() ?? new Date().getFullYear();
  return `${INVOICE_PREFIX}/${year}-${String(order.id).padStart(4, "0")}`;
};

const drawLogo = (doc: PdfDoc) => {
  if (fs.existsSync(ASSETS_LOGO_PATH)) {
    try {
      doc.image(ASSETS_LOGO_PATH, 40, 40, { width: 120 });
      doc.save();
      doc.opacity(0.08);
      doc.image(ASSETS_LOGO_PATH, doc.page.width / 2 - 120, 220, {
        width: 240,
        align: "center",
      });
      doc.restore();
      return;
    } catch {
      // fall back to text logo
    }
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor("#1f6fe6")
    .text("GaragePro", 40, 40);
  doc.fillColor("#111");
};

const drawTableRow = (
  doc: PdfDoc,
  y: number,
  description: string,
  quantity: number,
  unitPrice: number,
  lineTotal: number,
) => {
  doc
    .fontSize(10)
    .fillColor("#111")
    .text(description, 40, y, { width: 260 });
  doc.text(quantity.toString(), 310, y, { width: 60, align: "right" });
  doc.text(currency.format(unitPrice), 380, y, { width: 80, align: "right" });
  doc.text(currency.format(lineTotal), 470, y, {
    width: 80,
    align: "right",
  });
};

export const createInvoicePdf = (order: InvoiceWorkOrder) =>
  new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    drawLogo(doc);

    const invoiceCode = buildInvoiceCode({
      id: order.id,
      createdAt: order.createdAt,
    });
    const invoiceDate = format(new Date(), "PPP");

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Invoice #: ${invoiceCode}`, 360, 40, { align: "right" })
      .font("Helvetica")
      .text(`Date: ${invoiceDate}`, { align: "right" })
      .moveDown();

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Bill To", 40, 130)
      .font("Helvetica")
      .text(
        order.customer
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : "Walk-in Customer",
        40,
      )
      .text(
        order.customer?.phone ? `Phone: ${order.customer.phone}` : "",
        40,
      )
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Vehicle Details", 240, 130)
      .font("Helvetica")
      .text(
        `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}`,
        240,
      )
      .text(`VIN: ${order.vehicle.vin}`, 240)
      .text(
        order.vehicle.licensePlate
          ? `Plate: ${order.vehicle.licensePlate}`
          : "",
        240,
      )
      .moveDown();

    const tableTop = 220;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Description", 40, tableTop)
      .text("Qty", 310, tableTop, { width: 60, align: "right" })
      .text("Unit", 380, tableTop, { width: 80, align: "right" })
      .text("Total", 470, tableTop, { width: 80, align: "right" });

    doc
      .moveTo(40, tableTop + 18)
      .lineTo(550, tableTop + 18)
      .stroke("#e2e8f0");

    let position = tableTop + 30;
    order.lineItems.forEach((item) => {
      drawTableRow(
        doc,
        position,
        item.description,
        item.quantity,
        toNumber(item.unitPrice),
        toNumber(item.lineTotal),
      );
      position += 20;
    });

    doc
      .moveTo(40, position + 5)
      .lineTo(550, position + 5)
      .stroke("#e2e8f0");

    const laborCost = toNumber(order.laborCost);
    const partsCost = toNumber(order.partsCost);
    const parkingCharge = toNumber(order.parkingCharge);
    const discount = toNumber(order.discount);
    const taxes = toNumber(order.taxes);
    const total = toNumber(order.totalCost);

    const summaryStart = position + 20;
    doc
      .font("Helvetica-Bold")
      .text("Summary", 40, summaryStart)
      .font("Helvetica")
      .text(`Labour: ${currency.format(laborCost)}`, 40, summaryStart + 16)
      .text(`Parts: ${currency.format(partsCost)}`, 40, summaryStart + 32)
      .text(
        `Parking: ${currency.format(parkingCharge)}`,
        40,
        summaryStart + 48,
      )
      .text(`Discount: ${currency.format(discount)}`, 40, summaryStart + 64);

    doc
      .font("Helvetica-Bold")
      .text(
        `VAT (${Math.round(VAT_RATE * 100)}%): ${currency.format(taxes)}`,
        320,
        summaryStart + 16,
        { align: "right" },
      )
      .text(
        `Total: ${currency.format(total)}`,
        320,
        summaryStart + 40,
        { align: "right" },
      );

    if (order.assignments.length) {
      doc
        .moveDown()
        .font("Helvetica-Bold")
        .text("Assigned Technicians", 40, summaryStart + 100);
      doc.font("Helvetica");

      order.assignments.forEach((assignment, index) => {
        doc.text(
          `${index + 1}. ${assignment.worker.name}${
            assignment.role ? ` - ${assignment.role}` : ""
          }`,
          40,
        );
      });
    }

    doc
      .moveDown()
      .fontSize(10)
      .fillColor("#4a5568")
      .text(
        "Thank you for choosing our garage. Payment is due upon receipt of this invoice.",
        { align: "center" },
      );

    doc.end();
  });
