import "dotenv/config";

import { prisma } from "../src/infrastructure/db/client";
import { logger } from "../src/infrastructure/logging/logger";
import { cleanupExpiredPhotoUploads } from "../src/modules/photos/application/photo-service";

async function main() {
  let examined = 0;
  let removed = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await cleanupExpiredPhotoUploads();
    examined += batch.examined;
    removed += batch.removed;
    hasMore = batch.hasMore;
  }

  logger.info("photo_upload_cleanup_completed", { examined, removed });
}

main()
  .catch(() => {
    logger.error("photo_upload_cleanup_failed");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
