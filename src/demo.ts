import { Hex } from "viem";
import { atlasSdk } from "./common";
import { setupAtlas } from "./atlas";
import { eoaClient, publicClient } from "./user";
import { 
  ETH, 
  USER_SELL_TOKEN_ADDRESS, 
  CHAIN_ID, 
  RPC_URL,
  AUCTIONEER_ENDPOINT,
  PROTOCOL_ADDRESS,
  USER_BUY_TOKEN_ADDRESS,
  USER_SELL_TOKEN_AMOUNT,
  AUCTIONEER_ADDRESS,
  DAPP_CONTROL_ADDRESS,
  SOLVER_CONTRACT_ADDRESS,
  SOLVER_SHOULD_FULFILL
} from "./constants";
import { createNetworkConfig, createAtlasConfig, createSwapConfig } from "./config";

// Build user operation and send it to the FastLane auctioneer.
// We get in return a full Atlas bundle.
// Only interaction from user during this phase is token approval (if needed).
const networkConfig = createNetworkConfig(CHAIN_ID, RPC_URL);
const atlasConfig = createAtlasConfig({
  auctioneerEndpoint: AUCTIONEER_ENDPOINT,
  protocolAddress: PROTOCOL_ADDRESS,
  auctioneerAddress: AUCTIONEER_ADDRESS,
  dappControlAddress: DAPP_CONTROL_ADDRESS,
  auctionDurationMs: 1500
});
const swapConfig = createSwapConfig({
  sellToken: {
    address: USER_SELL_TOKEN_ADDRESS,
    amount: USER_SELL_TOKEN_AMOUNT,
    decimals: 18
  },
  buyToken: {
    address: USER_BUY_TOKEN_ADDRESS,
    amount: "0",
    decimals: 18
  }
});

const solverConfig = {
  address: SOLVER_CONTRACT_ADDRESS,
  shouldFulfill: SOLVER_SHOULD_FULFILL,
  expectedBidAmount: BigInt(1_000_000_000)
};

const bundle = await setupAtlas({
  walletClient: eoaClient,
  swapConfig,
  atlasConfig,
  solverConfig
});
const atlasAddress = await atlasSdk.getAtlasAddress();

// Check if there are any solver operations in the bundle
if (bundle.solverOperations.length > 0) {
  // Get the highest bid amount from the first solver
  const topBidAmount = bundle.solverOperations[0].getField("bidAmount").value as bigint;
  console.log("Best Solver bid amount:", topBidAmount);
}

// Get the encoded calldata for the metacall (combines user op, solver ops, and dApp op)
const metacallCalldata = atlasSdk.getMetacallCalldata(
  bundle.userOperation,
  bundle.solverOperations,
  bundle.dAppOperation
);

console.log("User sending transaction (self bundling)");

// Send the transaction to execute the swap
const hash = await eoaClient.sendTransaction({
  to: atlasAddress as Hex,
  // If selling ETH, include it in the value field, otherwise send 0
  value: USER_SELL_TOKEN_ADDRESS == ETH
    ? BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)
    : BigInt(0),
  maxFeePerGas: bundle.userOperation.getField("maxFeePerGas").value as bigint,
  data: metacallCalldata as Hex,
});

// Wait for the transaction to be mined
await publicClient.waitForTransactionReceipt({ hash });

console.log("Swapped:", hash);
