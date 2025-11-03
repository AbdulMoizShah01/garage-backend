/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.workOrderAssignment.deleteMany();
  await prisma.workOrderLog.deleteMany();
  await prisma.workOrderLineItem.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryItem.deleteMany();

  const inventory = await prisma.inventoryItem.createMany({
    data: [
      {
        name: 'Engine Oil',
        sku: 'OIL-5W30',
        description: 'Synthetic engine oil 5W-30',
        quantityOnHand: 120,
        reorderPoint: 50,
        unitCost: 25,
        unitPrice: 45
      },
      {
        name: 'Brake Pads',
        sku: 'BRK-PAD-01',
        description: 'Ceramic brake pads set',
        quantityOnHand: 30,
        reorderPoint: 10,
        unitCost: 40,
        unitPrice: 85
      }
    ]
  });
  console.log(`Inventory items created: ${inventory.count}`);

  const inventoryItems = await prisma.inventoryItem.findMany();
  const oilItem = inventoryItems.find((item) => item.sku === 'OIL-5W30');
  const brakePadsItem = inventoryItems.find((item) => item.sku === 'BRK-PAD-01');

  if (!oilItem || !brakePadsItem) {
    throw new Error('Expected seed inventory items not found');
  }

  const brakeInspectionService = await prisma.serviceItem.create({
    data: {
      name: 'Brake Inspection Labour',
      description: 'Labour charge for full brake inspection',
      defaultPrice: 200
    }
  });

  const workerAlex = await prisma.worker.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '555-0333',
      commuteExpense: 18.5,
      shiftExpense: 120,
      mealExpense: 35,
      otherExpense: 12.75
    }
  });

  const customerJohn = await prisma.customer.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0100',
      addressLine1: '123 Main St',
      city: 'Springfield',
      state: 'CA',
      postalCode: '90210',
      vehicles: {
        create: [
          {
            vin: '1HGBH41JXMN109186',
            make: 'Honda',
            model: 'Civic',
            year: 2018,
            licensePlate: 'ABC123',
            mileage: 45000,
            color: 'Blue'
          }
        ]
      }
    },
    include: {
      vehicles: true
    }
  });

  const customerJane = await prisma.customer.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-0222',
      company: 'Smith Logistics',
      vehicles: {
        create: [
          {
            vin: '1HGCM82633A004352',
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            licensePlate: 'XYZ789'
          }
        ]
      }
    },
    include: {
      vehicles: true
    }
  });

  console.log(`Customers created: ${[customerJohn, customerJane].length}`);

  const workOrder = await prisma.workOrder.create({
    data: {
      code: 'WO-00001',
      customer: {
        connect: { id: customerJohn.id }
      },
      vehicle: {
        connect: { id: customerJohn.vehicles[0].id }
      },
      status: 'IN_PROGRESS',
      description: 'Full service and brake inspection',
      scheduledDate: new Date(),
      arrivalDate: new Date(Date.now() - 60 * 60 * 1000),
      quotedAt: new Date(),
      laborCost: 200,
      partsCost: 130,
      taxes: 30,
      parkingCharge: 15,
      totalCost: 375,
      lineItems: {
        create: [
          {
            description: 'Engine Oil (5W-30)',
            quantity: 1,
            unitPrice: 45,
            lineTotal: 45,
            inventoryItem: {
              connect: { id: oilItem.id }
            }
          },
          {
            description: 'Brake Pads Replacement',
            quantity: 1,
            unitPrice: 85,
            lineTotal: 85,
            inventoryItem: {
              connect: { id: brakePadsItem.id }
            }
          },
          {
            description: 'Brake Inspection Labour',
            quantity: 1,
            unitPrice: 200,
            lineTotal: 200,
            serviceItem: {
              connect: { id: brakeInspectionService.id }
            }
          }
        ]
      },
      logs: {
        create: [
          {
            message: 'Work order created',
            author: 'system',
            category: 'SYSTEM'
          },
          {
            message: 'Vehicle checked into the garage',
            author: 'John Technician',
            category: 'PROGRESS'
          }
        ]
      },
      assignments: {
        create: [
          {
            worker: {
              connect: { id: workerAlex.id }
            },
            role: 'Lead Technician',
            servicesCount: 3
          }
        ]
      }
    }
  });

  console.log(`Work order created: ${workOrder.code}`);
  await prisma.worker.update({
    where: { id: workerAlex.id },
    data: {
      totalJobs: 1,
      totalServices: 3
    }
  });
  console.log(`Worker assignments created: 1`);
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
