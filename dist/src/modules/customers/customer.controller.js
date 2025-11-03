"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerHandler = exports.updateCustomerHandler = exports.createCustomerHandler = exports.getCustomerHandler = exports.getCustomersHandler = void 0;
const customer_service_1 = require("./customer.service");
const splitFullName = (fullName) => {
    const trimmed = fullName.trim();
    if (!trimmed) {
        return { firstName: "Customer", lastName: "" };
    }
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const lastName = rest.length ? rest.join(" ") : firstName;
    return { firstName, lastName };
};
const normalizeOptionalNullable = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
};
const getCustomersHandler = async (_req, res, next) => {
    try {
        const customers = await (0, customer_service_1.listCustomers)();
        res.json(customers);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomersHandler = getCustomersHandler;
const getCustomerHandler = async (req, res, next) => {
    try {
        const customerId = Number(req.params.id);
        const customer = await (0, customer_service_1.getCustomerById)(customerId);
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerHandler = getCustomerHandler;
const createCustomerHandler = async (req, res, next) => {
    try {
        const { fullName, phone, email, company, notes, addressLine1, addressLine2, city, state, postalCode, } = req.body;
        const { firstName, lastName } = splitFullName(fullName);
        const customerData = {
            firstName,
            lastName,
            phone,
            notes: normalizeOptionalNullable(notes) ?? null,
        };
        const normalizedEmail = normalizeOptionalNullable(email);
        if (normalizedEmail !== undefined) {
            customerData.email = normalizedEmail;
        }
        const normalizedCompany = normalizeOptionalNullable(company);
        if (normalizedCompany !== undefined) {
            customerData.company = normalizedCompany;
        }
        const normalizedAddress1 = normalizeOptionalNullable(addressLine1);
        if (normalizedAddress1 !== undefined) {
            customerData.addressLine1 = normalizedAddress1;
        }
        const normalizedAddress2 = normalizeOptionalNullable(addressLine2);
        if (normalizedAddress2 !== undefined) {
            customerData.addressLine2 = normalizedAddress2;
        }
        const normalizedCity = normalizeOptionalNullable(city);
        if (normalizedCity !== undefined) {
            customerData.city = normalizedCity;
        }
        const normalizedState = normalizeOptionalNullable(state);
        if (normalizedState !== undefined) {
            customerData.state = normalizedState;
        }
        const normalizedPostalCode = normalizeOptionalNullable(postalCode);
        if (normalizedPostalCode !== undefined) {
            customerData.postalCode = normalizedPostalCode;
        }
        const customer = await (0, customer_service_1.createCustomer)(customerData);
        res.status(201).json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomerHandler = createCustomerHandler;
const updateCustomerHandler = async (req, res, next) => {
    try {
        const customerId = Number(req.params.id);
        const { fullName, phone, email, company, notes, addressLine1, addressLine2, city, state, postalCode, } = req.body;
        const updatePayload = {};
        if (typeof fullName === "string") {
            const { firstName, lastName } = splitFullName(fullName);
            updatePayload.firstName = firstName;
            updatePayload.lastName = lastName;
        }
        if (typeof phone === "string") {
            updatePayload.phone = phone;
        }
        if (email !== undefined) {
            const normalizedEmail = normalizeOptionalNullable(email);
            updatePayload.email = normalizedEmail ?? null;
        }
        if (company !== undefined) {
            const normalizedCompany = normalizeOptionalNullable(company);
            updatePayload.company = normalizedCompany ?? null;
        }
        if (notes !== undefined) {
            updatePayload.notes = normalizeOptionalNullable(notes) ?? null;
        }
        if (addressLine1 !== undefined) {
            const normalizedAddress1 = normalizeOptionalNullable(addressLine1);
            updatePayload.addressLine1 = normalizedAddress1 ?? null;
        }
        if (addressLine2 !== undefined) {
            const normalizedAddress2 = normalizeOptionalNullable(addressLine2);
            updatePayload.addressLine2 = normalizedAddress2 ?? null;
        }
        if (city !== undefined) {
            const normalizedCity = normalizeOptionalNullable(city);
            updatePayload.city = normalizedCity ?? null;
        }
        if (state !== undefined) {
            const normalizedState = normalizeOptionalNullable(state);
            updatePayload.state = normalizedState ?? null;
        }
        if (postalCode !== undefined) {
            const normalizedPostalCode = normalizeOptionalNullable(postalCode);
            updatePayload.postalCode = normalizedPostalCode ?? null;
        }
        const customer = await (0, customer_service_1.updateCustomer)(customerId, updatePayload);
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomerHandler = updateCustomerHandler;
const deleteCustomerHandler = async (req, res, next) => {
    try {
        const customerId = Number(req.params.id);
        await (0, customer_service_1.deleteCustomer)(customerId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomerHandler = deleteCustomerHandler;
//# sourceMappingURL=customer.controller.js.map