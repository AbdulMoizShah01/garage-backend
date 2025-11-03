import { prisma } from "../src/lib/prisma";
import { createWorker, deleteWorker, getWorkerById } from "../src/modules/workers/worker.service";

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "");
  const testName = `Smoke Tester ${timestamp}`;

  const worker = await createWorker({
    name: testName,
    commuteExpense: 12.5,
    shiftExpense: 80,
  });
  await getWorkerById(worker.id);
  await deleteWorker(worker.id);

  // eslint-disable-next-line no-console
  console.log(`Worker smoke test passed (id=${worker.id})`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Worker smoke test failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
