import Moralis from "moralis";
import { env } from "@/config/env";

let isInitialized = false;

export async function initMoralis() {
  if (isInitialized) return;

  await Moralis.start({
    apiKey: env.MORALIS_API_KEY,
  });

  isInitialized = true;
}

export { Moralis };
