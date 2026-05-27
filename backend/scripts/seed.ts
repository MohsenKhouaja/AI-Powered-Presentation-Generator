import { runSeed } from "./seed/index.js";
import { runReset } from "./seed/reset.js";

const hasFlag = (flag: string): boolean => process.argv.includes(flag);

const printSummary = (result: Awaited<ReturnType<typeof runSeed>>): void => {
  console.log("\nSeed complete.\n");

  console.log("Users:");
  for (const user of result.seededUsers) {
    console.log(`- ${user.email} / ${user.password}`);
  }

  console.log("\nPresentations:");
  for (const p of result.seededPresentations) {
    console.log(`- ${p.id} (${p.key})`);
  }
  console.log("");
};

try {
  if (hasFlag("--reset")) {
    const reset = await runReset();
    console.log("\nSeed reset complete.\n");
    console.log(
      `- Mongo slides_content deleted: ${reset.deletedMongoDocs} (by slide IDs from seed presentations)`,
    );
    console.log(
      `- MySQL presentations delete attempted: ${reset.deletedPresentationsAttempted} (title prefix + seed owner IDs)`,
    );
    console.log(
      `- MySQL users delete attempted: ${reset.deletedUsersAttempted} (seed emails from dataset)`,
    );
  }

  const result = await runSeed();
  printSummary(result);
  // Pragmatic dev exit: the Mongo client is created in `database/index.ts`.
  process.exit(0);
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
