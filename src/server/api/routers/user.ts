import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users, usersToWorkspaces } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  getByWorkspaceId: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select()
        .from(usersToWorkspaces)
        .innerJoin(users, eq(users.id, usersToWorkspaces.userId))
        .where(eq(usersToWorkspaces.workspaceId, input.workspaceId));

      return res;
    }),

  joinWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ctx.db.insert(usersToWorkspaces).values({
        userId: ctx.session.user.id,
        workspaceId: input.workspaceId,
      });
    }),
});
