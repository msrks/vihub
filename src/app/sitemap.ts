export const baseUrl = "https://vihub.msrks.dev";
export const title = "VIHub";
export const description =
  "All in one platform to collect data, create dataset, train model, deploy to edge. VIHub offers the data-centric way to develop 'Visual Inspection AI'.";

export default async function sitemap() {
  return [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
}
