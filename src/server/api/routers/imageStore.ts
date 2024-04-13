import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and } from "drizzle-orm";
import { imageStores, workspaces } from "@/server/db/schema";

export const imageStoreRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        workspaceId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const ret = await ctx.db
          .insert(imageStores)
          .values({
            name: input.name,
            workspaceId: input.workspaceId,
          })
          .returning();

        if (!ret[0]) throw new Error("something went wrong..");

        return { id: ret[0].id };
      } catch (error) {
        return { error: "something went wrong.." };
      }
    }),

  // update: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //       name: z.string().min(1),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input: { id, name } }) => {
  //     await ctx.db
  //       .update(imageStores)
  //       .set({ ...(name && { name }) })
  //       .where(eq(imageStores.id, id));
  //   }),

  getAll: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(imageStores)
        .where(eq(imageStores.workspaceId, input.workspaceId));
    }),

  // getById: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //     }),
  //   )
  //   .query(({ ctx, input }) => {
  //     return ctx.db.query.imageStores.findFirst({
  //       where: eq(imageStores.id, input.id),
  //       with: {
  //         imageStores: true,
  //       },
  //     });
  //   }),

  getByName: protectedProcedure
    .input(
      z.object({
        workspaceName: z.string(),
        imageStoreName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ws = await ctx.db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.name, input.workspaceName));

      if (!ws[0]) throw Error("workspace not found");

      const res = await ctx.db
        .select()
        .from(imageStores)
        .where(
          and(
            eq(imageStores.name, input.imageStoreName),
            eq(imageStores.workspaceId, ws[0].id),
          ),
        );

      if (!res[0] || res.length !== 1) throw new Error("Project not found");
      return res[0];
    }),
});
