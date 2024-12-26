import { AtlasSdk, FastlaneBackend } from "@fastlane-labs/atlas-sdk";
import { ethers } from "ethers";
import { CHAIN_ID, RPC_URL, AUCTIONEER_ENDPOINT } from "./constants";

export const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);

export const atlasSdk = await AtlasSdk.create(
  provider,
  CHAIN_ID,
  new FastlaneBackend({
    endpoint: AUCTIONEER_ENDPOINT,
  })
);
