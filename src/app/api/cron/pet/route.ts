import axios from "axios";
import fs from "fs";

import { api } from "@/trpc/server";

import { getRandomPet, getUrl } from "./pet";

import type { Pet } from "./pet";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const URL = `https://visual-inspection-template.web.app/predict?modelType=tflite`;
const STORE_ID_LIST = [14, 18, 19];

type PredResponse = {
  confidences: {
    [K in Pet]: number;
  };
  result: Pet;
};

export async function GET() {
  const url = await getUrl(getRandomPet());

  if (url.endsWith(".gif")) {
    return Response.json({ success: false, message: "GIF not supported" });
  }

  // fetch image to fPath
  const fPath = `/tmp/${Date.now()}.png`;
  const res = await axios.get<fs.WriteStream>(url, { responseType: "stream" });
  const w = res.data.pipe(fs.createWriteStream(fPath));
  await new Promise((resolve) => w.on("finish", resolve));

  // get AI prediction
  const file = fs.readFileSync(fPath);
  const b64img = Buffer.from(file).toString("base64");
  let pred: PredResponse | undefined;
  try {
    const _res = await axios.post<PredResponse>(
      URL,
      JSON.stringify({ image: b64img }),
      { headers: { "Content-Type": "application/json" }, timeout: 3000 },
    );
    pred = _res.data;
  } catch (error) {
    console.error(error);
  }

  // upload image & save to DB, VDB
  await Promise.all(
    STORE_ID_LIST.map(async (id) => {
      await api.image.create({
        imageStoreId: id,
        file,
        ...(pred && {
          aiLabelKey: pred.result,
          aiLabelDetail: {
            confidence: pred.confidences[pred.result],
          },
        }),
      });
    }),
  );

  return Response.json({ success: true });
}
