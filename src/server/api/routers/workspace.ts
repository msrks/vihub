import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users, usersToWorkspaces, workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const ret = await ctx.db
          .insert(workspaces)
          .values({
            name: input.name,
          })
          .returning();

        if (!ret[0]) throw new Error("try another name!");

        const { id } = ret[0];

        await ctx.db.insert(usersToWorkspaces).values({
          userId: ctx.session.user.id,
          workspaceId: id,
        });

        return { id };
      } catch (error) {
        // return { error: JSON.stringify(error) };
        if (
          error instanceof Error &&
          error.message ===
            'duplicate key value violates unique constraint "vihub_workspace_name_unique"'
        ) {
          return {
            error: "your name has been already taken. try another one!",
          };
        }
        return { error: "error: something wrong has happend.." };
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input: { id, name } }) => {
      await ctx.db
        .update(workspaces)
        .set({ ...(name && { name }) })
        .where(eq(workspaces.id, id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const _res = await ctx.db.query.users.findMany({
      where: eq(users.id, ctx.session.user.id),
      with: {
        usersToWorkspaces: {
          with: {
            workspace: true,
          },
        },
      },
    });
    if (!_res[0]) return [];

    return _res[0].usersToWorkspaces.map((u2w) => u2w.workspace);
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.id),
        with: {
          imageStores: true,
        },
      });
    }),

  getIdByTitleAndOwner: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.name, input.name),
      });

      if (!res) throw new Error("Project not found");

      return res.id;
    }),
});
