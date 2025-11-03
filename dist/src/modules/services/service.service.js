"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceItem = exports.updateServiceItem = exports.createServiceItem = exports.getServiceItemById = exports.listServiceItems = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const decimal = (value) => new client_1.Prisma.Decimal(value.toFixed(2));
const listServiceItems = async (search) => prisma_1.prisma.serviceItem.findMany({
    where: search
        ? {
            name: {
                contains: search,
            },
        }
        : undefined,
    orderBy: { name: "asc" },
    take: search ? 25 : undefined,
});
exports.listServiceItems = listServiceItems;
const getServiceItemById = async (id) => {
    const item = await prisma_1.prisma.serviceItem.findUnique({
        where: { id },
    });
    if (!item) {
        throw (0, http_errors_1.default)(404, `Service item ${id} not found`);
    }
    return item;
};
exports.getServiceItemById = getServiceItemById;
const createServiceItem = async (input) => {
    try {
        return await prisma_1.prisma.serviceItem.create({
            data: {
                name: input.name,
                description: input.description ?? null,
                defaultPrice: decimal(input.defaultPrice),
            },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(409, `Service "${input.name}" already exists`, {
            cause: error,
        });
    }
};
exports.createServiceItem = createServiceItem;
const updateServiceItem = async (id, input) => {
    try {
        return await prisma_1.prisma.serviceItem.update({
            where: { id },
            data: {
                name: input.name,
                description: input.description,
                defaultPrice: input.defaultPrice !== undefined
                    ? decimal(input.defaultPrice)
                    : undefined,
            },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Service item ${id} not found`, {
            cause: error,
        });
    }
};
exports.updateServiceItem = updateServiceItem;
const deleteServiceItem = async (id) => {
    try {
        await prisma_1.prisma.serviceItem.delete({ where: { id } });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Service item ${id} not found`, {
            cause: error,
        });
    }
};
exports.deleteServiceItem = deleteServiceItem;
//# sourceMappingURL=service.service.js.map