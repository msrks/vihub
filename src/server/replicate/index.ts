/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// vector size is 768
export const getVectorByReplicate = async (imagePath: string) => {
  const res: any = await replicate.run(
    "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
    { input: { inputs: imagePath } },
  );
  return res[0].embedding as number[];
};
