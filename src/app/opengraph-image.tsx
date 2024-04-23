import { ImageResponse } from "next/og";
import { title } from "./sitemap";

export const runtime = "edge";

export const alt = title;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="bg-gray-900 w-full h-full flex flex-col items-center justify-center">
        <div tw="text-orange-600 text-5xl font-bold">{title}</div>
        <img src={"https://vihub.msrks.dev/icon.png"} alt="" width="300px" />
        <div tw="text-gray-500 text-3xl font-semibold">
          Better data, better AI
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
