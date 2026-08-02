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
    console.log(`- ${p.id} (${p.key}, owner: ${p.ownerEmail})`);
  }

  console.log("\nAccess grants:");
  for (const grant of result.seededAccessGrants) {
    const expiry = grant.expiresAt?.toISOString() ?? "never";
    console.log(
      `- ${grant.id} (${grant.presentationKey}, ${grant.email}, ${grant.permission}, expires: ${expiry})`,
    );
  }

  console.log("\nShare links (development tokens; only hashes are stored):");
  for (const link of result.seededShareLinks) {
    const expiry = link.expiresAt?.toISOString() ?? "never";
    const state = link.revokedAt ? "revoked" : "not revoked";
    console.log(
      `- ${link.key} (${link.presentationKey}, expires: ${expiry}, ${state}): ${link.token}`,
    );
  }
  console.log("");
};

try {
  if (hasFlag("--reset")) {
    const reset = await runReset();
    console.log("\nSeed reset complete.\n");
    console.log(
      `- MySQL presentations delete attempted: ${reset.deletedPresentationsAttempted} (title prefix + seed owner IDs)`,
    );
    console.log(
      `- MySQL users delete attempted: ${reset.deletedUsersAttempted} (seed emails from dataset)`,
    );
  }

  const result = await runSeed();
  printSummary(result);
  process.exit(0);
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
