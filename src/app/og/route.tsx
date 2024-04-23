import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { title } from "../sitemap";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  return new ImageResponse(
    (
      <div tw="bg-gray-900 w-full h-full flex flex-col items-center justify-center">
        <div tw="text-orange-600 text-7xl font-bold">{title}</div>
        <img src={"https://vihub.msrks.dev/icon.png"} alt="" width="300px" />
        <div tw="text-gray-500 text-5xl font-semibold">
          Better data, better AI
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
