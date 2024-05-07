import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { experimentResults, images, labelClasses } from "@/server/db/schema";

export const experimentResultRouter = createTRPCRouter({
  getAllByExperimentId: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(experimentResults)
        .where(eq(experimentResults.promptingExperimentId, input.experimentId))
        .innerJoin(images, eq(images.id, experimentResults.imageId))
        .innerJoin(labelClasses, eq(labelClasses.id, images.humanLabelId))
        .orderBy(desc(images.createdAt));
    }),
});
