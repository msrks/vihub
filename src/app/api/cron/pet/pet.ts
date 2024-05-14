import axios from "axios";

export type Pet = "dog" | "cat";

const apis = {
  dog: "https://dog.ceo/api/breeds/image/random",
  cat: "https://api.thecatapi.com/v1/images/search",
};

const sampleDogRes = {
  message: "https://images.dog.ceo/breeds/setter-gordon/n02101006_2414.jpg",
  status: "success",
};

const sampleCatRes = [
  {
    id: "c",
    url: "https://24.media.tumblr.com/tumblr_krxn0o9cPS1qa9hjso1_1280.jpg",
    width: 1500,
    height: 1000,
  },
];

export const getRandomPet = (): Pet => (Math.random() > 0.5 ? "dog" : "cat");

export async function getUrl(pet: Pet) {
  if (pet === "dog") {
    const res = await axios.get<typeof sampleDogRes>(apis[pet]);
    return res.data.message;
  } else if (pet === "cat") {
    const res = await axios.get<typeof sampleCatRes>(apis[pet]);
    if (!res.data[0]) throw new Error("Cat API failed");
    return res.data[0].url;
  } else {
    throw new Error("Invalid pet");
  }
}
