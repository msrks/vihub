import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  imageStores,
  images,
  users,
  usersToWorkspaces,
  workspaces,
} from "@/server/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

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

  deleteById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workspaces).where(eq(workspaces.id, input.id));
    }),

  regenerateAPIKey: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(workspaces)
        .set({ apiKey: sql`gen_random_uuid()` })
        .where(eq(workspaces.id, input.id));
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

  getByName: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select()
        .from(workspaces)
        .innerJoin(
          usersToWorkspaces,
          eq(workspaces.id, usersToWorkspaces.workspaceId),
        )
        .where(
          and(
            eq(workspaces.name, input.name),
            eq(usersToWorkspaces.userId, ctx.session.user.id),
          ),
        );

      if (!res[0] || res.length !== 1) throw new Error("Project not found");
      return res[0].workspace;
    }),

  getCountOfImagesAssosiatedToWorkspace: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: maybe refactoring is needed .. using with clause instead of join
      const res = await ctx.db
        .select({ count: count() })
        .from(images)
        .innerJoin(imageStores, eq(images.imageStoreId, imageStores.id))
        .innerJoin(workspaces, eq(imageStores.workspaceId, workspaces.id))
        .where(eq(workspaces.id, input.id));

      if (!res[0]) return 0;

      return res[0].count;
    }),
});
