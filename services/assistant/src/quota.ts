import { createHash } from "node:crypto";

// Guest IDs are random UUIDs. Store only a stable digest in short-lived quota rows.
export function quotaSubjectKey(userId: string) {
  return createHash("sha256").update("dots-user-quota-v1:").update(userId).digest("hex");
}
