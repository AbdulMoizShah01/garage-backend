"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMetadata = exports.updateMetadata = exports.createMetadata = exports.getMetadataByVehicleId = exports.listMetadata = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const metadataInclude = {
    customer: true,
    workOrders: {
        select: {
            id: true,
            code: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            totalCost: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    },
};
const numberFromSearch = (value) => {
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const buildSearchFilter = (term) => {
    const normalized = term?.trim();
    if (!normalized) {
        return undefined;
    }
    const conditions = [
        { licensePlate: { contains: normalized } },
        { make: { contains: normalized } },
        { model: { contains: normalized } },
        { vin: { contains: normalized } },
        {
            customer: {
                OR: [
                    { firstName: { contains: normalized } },
                    { lastName: { contains: normalized } },
                ],
            },
        },
    ];
    const yearQuery = numberFromSearch(normalized);
    if (yearQuery !== undefined) {
        conditions.push({ year: yearQuery });
    }
    return {
        OR: conditions,
    };
};
const decimalToNumber = (value) => value instanceof client_1.Prisma.Decimal ? value.toNumber() : Number(value ?? 0);
const listMetadata = async (search) => {
    const vehicles = await prisma_1.prisma.vehicle.findMany({
        where: buildSearchFilter(search),
        include: metadataInclude,
        orderBy: { updatedAt: "desc" },
        take: search ? 25 : undefined,
    });
    return vehicles.map((vehicle) => {
        const openOrders = vehicle.workOrders.filter((order) => order.status !== "COMPLETED");
        const outstandingBalance = openOrders.reduce((sum, order) => sum + decimalToNumber(order.totalCost), 0);
        return {
            id: vehicle.id,
            vehicle,
            customer: vehicle.customer,
            recentWorkOrders: vehicle.workOrders,
            stats: {
                totalWorkOrders: vehicle.workOrders.length,
                openWorkOrders: openOrders.length,
                lastServiceDate: vehicle.workOrders[0]?.updatedAt ?? null,
                outstandingBalance,
            },
        };
    });
};
exports.listMetadata = listMetadata;
const getMetadataByVehicleId = async (vehicleId) => {
    const vehicle = await prisma_1.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: metadataInclude,
    });
    if (!vehicle) {
        throw (0, http_errors_1.default)(404, `Metadata for vehicle ${vehicleId} not found`);
    }
    return {
        id: vehicle.id,
        vehicle,
        customer: vehicle.customer,
        recentWorkOrders: vehicle.workOrders,
    };
};
exports.getMetadataByVehicleId = getMetadataByVehicleId;
const createMetadata = async (payload) => {
    const { customer, vehicle } = payload;
    return prisma_1.prisma.vehicle.create({
        data: {
            ...vehicle,
            customer: {
                create: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone,
                    email: customer.email ?? null,
                    company: customer.company ?? null,
                    notes: customer.notes ?? null,
                    addressLine1: customer.addressLine1 ?? null,
                    addressLine2: customer.addressLine2 ?? null,
                    city: customer.city ?? null,
                    state: customer.state ?? null,
                    postalCode: customer.postalCode ?? null,
                },
            },
        },
        include: metadataInclude,
    });
};
exports.createMetadata = createMetadata;
const updateMetadata = async (vehicleId, payload) => {
    const vehicle = await prisma_1.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
            customer: true,
        },
    });
    if (!vehicle || !vehicle.customer) {
        throw (0, http_errors_1.default)(404, `Metadata for vehicle ${vehicleId} not found`);
    }
    return prisma_1.prisma.$transaction(async (tx) => {
        if (payload.customer) {
            await tx.customer.update({
                where: { id: vehicle.customerId },
                data: {
                    ...payload.customer,
                },
            });
        }
        if (payload.vehicle) {
            await tx.vehicle.update({
                where: { id: vehicleId },
                data: {
                    ...payload.vehicle,
                },
            });
        }
        return tx.vehicle.findUnique({
            where: { id: vehicleId },
            include: metadataInclude,
        });
    });
};
exports.updateMetadata = updateMetadata;
const deleteMetadata = async (vehicleId) => {
    try {
        await prisma_1.prisma.vehicle.delete({
            where: { id: vehicleId },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Vehicle ${vehicleId} not found`, {
            cause: error,
        });
    }
};
exports.deleteMetadata = deleteMetadata;
//# sourceMappingURL=metadata.service.js.map