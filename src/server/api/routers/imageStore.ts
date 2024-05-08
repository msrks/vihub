import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { images, imageStores, workspaces } from "@/server/db/schema";
import { vdb } from "@/server/pinecone";
import { del } from "@vercel/blob";

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

  // verifyApiKey: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //       apiKey: z.string(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const ret = await ctx.db
  //       .select()
  //       .from(imageStores)
  //       .innerJoin(workspaces, eq(workspaces.id, imageStores.workspaceId))
  //       .where(
  //         and(
  //           eq(imageStores.id, input.id),
  //           eq(workspaces.apiKey, input.apiKey),
  //         ),
  //       );
  //     if (!ret[0]) throw new Error("API Key not found");
  //     return ret[0];
  //   }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        imageWidth: z.number().optional(),
        imageHeight: z.number().optional(),
        colWidth: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(imageStores)
        .set(input)
        .where(eq(imageStores.id, input.id));
    }),

  setThumbnail: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        thumbnailUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { id, thumbnailUrl } }) => {
      await ctx.db
        .update(imageStores)
        .set({ thumbnailUrl })
        .where(eq(imageStores.id, id));
    }),

  deleteById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      // delete all images in the image store
      const allImages = await ctx.db
        .select()
        .from(images)
        .where(eq(images.imageStoreId, id));
      await Promise.all(
        allImages.map(async (image) => {
          const ret = await ctx.db
            .delete(images)
            .where(eq(images.id, image.id))
            .returning();
          if (!ret[0]) throw new Error("something went wrong..");
          // delete from vercel blob
          await del(ret[0].url);
          // delete from pinecone
          await vdb(ret[0].imageStoreId.toString()).deleteOne(ret[0].vectorId);
        }),
      );

      // delete the image store
      const ret = await ctx.db
        .delete(imageStores)
        .where(eq(imageStores.id, id))
        .returning();
      if (!ret[0]) throw new Error("something went wrong..");
    }),

  getCountByWorkspaceId: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(imageStores)
        .where(eq(imageStores.workspaceId, input.workspaceId));
      return res[0]?.count ?? 0;
    }),

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
        .where(eq(imageStores.workspaceId, input.workspaceId))
        .orderBy(desc(imageStores.createdAt));
    }),

  getTableData: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          name: imageStores.name,
          createdAt: imageStores.createdAt,
          thumbnailUrl: imageStores.thumbnailUrl,
          type: imageStores.type,
          count: count(images.id),
        })
        .from(imageStores)
        .leftJoin(images, eq(images.imageStoreId, imageStores.id))
        .where(eq(imageStores.workspaceId, input.workspaceId))
        .groupBy(imageStores.id)
        .orderBy(desc(imageStores.createdAt));
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ret = await ctx.db
        .select()
        .from(imageStores)
        .where(eq(imageStores.id, input.id));
      if (!ret[0]) throw new Error("something went wrong..");
      return ret[0];
    }),

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
