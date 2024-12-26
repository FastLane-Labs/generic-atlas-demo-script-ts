import { Hex, zeroAddress, Chain } from "viem";
import dotenv from "dotenv";

dotenv.config();

// Token Constants
export const ETH = zeroAddress;

// Network Configuration
export const CHAIN_ID = Number(process.env.CHAIN_ID ?? "1"); // Default to Mainnet
export const RPC_URL = process.env.RPC_URL as string;

// Chain details based on CHAIN_ID
const CHAIN_DETAILS: Record<number, { name: string }> = {
  84532: { name: 'Base Sepolia' },
  1: { name: 'Mainnet' },
  137: { name: 'Polygon Mainnet' },
  10: { name: 'Optimism Mainnet' },
  42161: { name: 'Arbitrum Mainnet' },
  421614: { name: 'Arbitrum Sepolia' },
};

export const CHAIN: Chain = {
  id: CHAIN_ID,
  name: CHAIN_DETAILS[CHAIN_ID]?.name ?? 'Unknown Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
};

// User Configuration
export const USER_PK = process.env.USER_PK as Hex;
export const USER_SELL_TOKEN_ADDRESS = process.env.USER_SELL_TOKEN_ADDRESS as Hex;
export const USER_BUY_TOKEN_ADDRESS = process.env.USER_BUY_TOKEN_ADDRESS as Hex;
export const USER_SELL_TOKEN_AMOUNT = process.env.USER_SELL_TOKEN_AMOUNT ?? "0";
export const SWAP_TYPE = Number(process.env.SWAP_TYPE);

// Atlas/FastLane Configuration
export const AUCTIONEER_ENDPOINT = process.env.AUCTIONEER_ENDPOINT as string;
export const AUCTIONEER_ADDRESS = process.env.AUCTIONEER_ADDRESS as string;
export const DAPP_CONTROL_ADDRESS = process.env.DAPP_CONTROL_ADDRESS as string;

// Contract Addresses
export const PROTOCOL_ADDRESS = process.env.PROTOCOL_ADDRESS as Hex;
export const SOLVER_CONTRACT_ADDRESS = process.env.SOLVER_CONTRACT_ADDRESS ?? "";
export const SOLVER_SHOULD_FULFILL = process.env.SOLVER_SHOULD_FULFILL === "true";
