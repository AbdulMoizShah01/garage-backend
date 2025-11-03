"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItemById = exports.listInventoryItems = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const decimal = (value) => new client_1.Prisma.Decimal(value.toFixed(2));
const generateInventorySku = (name) => {
    const normalized = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const suffix = Date.now().toString(36).toUpperCase();
    return `INV-${normalized.slice(0, 6) || "ITEM"}-${suffix}`;
};
const listInventoryItems = async (search) => prisma_1.prisma.inventoryItem.findMany({
    where: search
        ? {
            OR: [{ name: { contains: search } }, { sku: { contains: search } }],
        }
        : undefined,
    orderBy: { name: "asc" },
    take: search ? 25 : undefined,
});
exports.listInventoryItems = listInventoryItems;
const getInventoryItemById = async (id) => {
    const item = await prisma_1.prisma.inventoryItem.findUnique({
        where: { id },
    });
    if (!item) {
        throw (0, http_errors_1.default)(404, `Inventory item ${id} not found`);
    }
    return item;
};
exports.getInventoryItemById = getInventoryItemById;
const createInventoryItem = async (data) => prisma_1.prisma.inventoryItem.create({
    data: {
        name: data.name,
        sku: data.sku?.trim() && data.sku.trim().length > 0
            ? data.sku.trim()
            : generateInventorySku(data.name),
        description: data.description && data.description.trim().length > 0
            ? data.description.trim()
            : null,
        quantityOnHand: data.quantityOnHand ?? 0,
        reorderPoint: data.reorderPoint ?? 0,
        unitCost: decimal(data.unitCost ?? 0),
        unitPrice: decimal(data.unitPrice ?? 0),
    },
});
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (id, data) => {
    try {
        const updates = {};
        if (data.name !== undefined) {
            updates.name = data.name;
        }
        if ("description" in data) {
            const descriptionValue = data.description && data.description.trim().length > 0
                ? data.description.trim()
                : null;
            updates.description = descriptionValue;
        }
        if (data.quantityOnHand !== undefined) {
            updates.quantityOnHand = data.quantityOnHand;
        }
        if (data.reorderPoint !== undefined) {
            updates.reorderPoint = data.reorderPoint;
        }
        if (data.unitCost !== undefined) {
            updates.unitCost = decimal(data.unitCost);
        }
        if (data.unitPrice !== undefined) {
            updates.unitPrice = decimal(data.unitPrice);
        }
        const normalizedSku = data.sku?.trim();
        if (normalizedSku && normalizedSku.length > 0) {
            updates.sku = normalizedSku;
        }
        return await prisma_1.prisma.inventoryItem.update({
            where: { id },
            data: updates,
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Inventory item ${id} not found`, {
            cause: error,
        });
    }
};
exports.updateInventoryItem = updateInventoryItem;
const deleteInventoryItem = async (id) => {
    try {
        await prisma_1.prisma.inventoryItem.delete({ where: { id } });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Inventory item ${id} not found`, {
            cause: error,
        });
    }
};
exports.deleteInventoryItem = deleteInventoryItem;
//# sourceMappingURL=inventory.service.js.map