"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleById = exports.listVehicles = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const prisma_1 = require("../../lib/prisma");
const listVehicles = async () => prisma_1.prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        customer: true,
        workOrders: {
            select: {
                id: true,
                code: true,
                status: true,
                totalCost: true,
            },
        },
    },
});
exports.listVehicles = listVehicles;
const getVehicleById = async (id) => {
    const vehicle = await prisma_1.prisma.vehicle.findUnique({
        where: { id },
        include: {
            customer: true,
            workOrders: {
                include: {
                    lineItems: true,
                },
            },
        },
    });
    if (!vehicle) {
        throw (0, http_errors_1.default)(404, `Vehicle ${id} not found`);
    }
    return vehicle;
};
exports.getVehicleById = getVehicleById;
const createVehicle = (data) => prisma_1.prisma.vehicle.create({
    data,
});
exports.createVehicle = createVehicle;
const updateVehicle = async (id, data) => {
    try {
        return await prisma_1.prisma.vehicle.update({
            where: { id },
            data,
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Vehicle ${id} not found`, { cause: error });
    }
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (id) => {
    try {
        await prisma_1.prisma.vehicle.delete({
            where: { id },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Vehicle ${id} not found`, { cause: error });
    }
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicle.service.js.map