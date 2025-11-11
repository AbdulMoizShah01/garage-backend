"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.listCustomers = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const prisma_1 = require("../../lib/prisma");
const listCustomers = async () => prisma_1.prisma.customer.findMany({
    orderBy: { lastName: "asc" },
    include: {
        vehicles: true,
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
exports.listCustomers = listCustomers;
const getCustomerById = async (id) => {
    const customer = await prisma_1.prisma.customer.findUnique({
        where: { id },
        include: {
            vehicles: true,
            workOrders: true,
        },
    });
    if (!customer) {
        throw (0, http_errors_1.default)(404, `Customer ${id} not found`);
    }
    return customer;
};
exports.getCustomerById = getCustomerById;
const createCustomer = (data) => prisma_1.prisma.customer.create({
    data,
});
exports.createCustomer = createCustomer;
const updateCustomer = async (id, data) => {
    try {
        return await prisma_1.prisma.customer.update({
            where: { id },
            data,
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Customer ${id} not found`, { cause: error });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (id) => {
    try {
        await prisma_1.prisma.customer.delete({ where: { id } });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Customer ${id} not found`, { cause: error });
    }
};
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customer.service.js.map