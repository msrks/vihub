import axios from "axios";
import fs from "fs";
import { type Pet, getRandomPet, getUrl } from "./pet";
import { api } from "@/trpc/server";

export const maxDuration = 300;

const URL = `https://visual-inspection-template.web.app/predict?modelType=tflite`;
const STORE_ID = 8;

type PredResponse = {
  confidences: {
    [K in Pet]: number;
  };
  result: Pet;
};

export async function GET() {
  const url = await getUrl(getRandomPet());

  // fetch image to fPath
  const fPath = `/tmp/${Date.now()}.jpg`;
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
  await api.image.create({
    imageStoreId: STORE_ID,
    file,
    ...(pred && {
      aiLabelKey: pred.result,
      aiLabelDetail: {
        confidence: pred.confidences[pred.result],
      },
    }),
  });

  return Response.json({ success: true });
}
