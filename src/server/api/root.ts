import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { workspaceRouter } from "./routers/workspace";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { imageStoreRouter } from "./routers/imageStore";
import { imageRouter } from "./routers/image";
import { aiRouter } from "./routers/ai";
import { labelClassRouter } from "./routers/labelClass";
import { userRouter } from "./routers/user";
import { promptingExperimentRouter } from "./routers/propmtingExperiment";
import { referenceImageRouter } from "./routers/referenceImage";
import { experimentResultRouter } from "./routers/experimentResult";
import { multiClassAiPredictionRouter } from "./routers/multiClassAiPrediction";

export const appRouter = createTRPCRouter({
  ai: aiRouter,
  workspace: workspaceRouter,
  imageStore: imageStoreRouter,
  image: imageRouter,
  labelClass: labelClassRouter,
  user: userRouter,
  promptingExperiment: promptingExperimentRouter,
  referenceImage: referenceImageRouter,
  experimentResult: experimentResultRouter,
  multiClassAiPrediction: multiClassAiPredictionRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
