import { Hex } from "viem";

export interface TokenConfig {
  address: Hex;
  amount: string;
  decimals: number;
}

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  name: string;
}

export interface AtlasConfig {
  auctioneerEndpoint: string;
  auctioneerAddress: string;
  dappControlAddress: string;
  protocolAddress: Hex;
  auctionDurationMs: number;
}

export interface SolverConfig {
  address: string;
  shouldFulfill: boolean;
  expectedBidAmount: bigint;
}

export interface SwapConfig {
  sellToken: TokenConfig;
  buyToken: TokenConfig;
  swapType: number;
}
