import { Bundle } from "@fastlane-labs/atlas-sdk";
import { provider, atlasSdk } from "./common";
import { encodeUserOpData } from "./userOpData";
import {
  approveErc20IfNeeded,
  mintErc20IfNeeded,
  sendTokensToSolverIfNeeded,
} from "./helpers";
import { eoaClient } from "./user";
import { Hex, zeroAddress, WalletClient } from "viem";
import dotenv from "dotenv";
import {
  DAPP_CONTROL_ADDRESS,
  PROTOCOL_ADDRESS,
  AUCTIONEER_ADDRESS,
} from "./constants";
import { AtlasConfig, SwapConfig, SolverConfig } from "./types";

dotenv.config();

interface AtlasSetupParams {
  walletClient: WalletClient;
  swapConfig: SwapConfig;
  atlasConfig: AtlasConfig;
  solverConfig: SolverConfig;
}

/**
 * Sets up and prepares an Atlas bundle for token swapping
 * This function handles the entire setup process including:
 * - Getting the execution environment
 * - Encoding the swap data
 * - Handling token approvals and minting if needed
 * - Creating and submitting the user operation
 * 
 * @param walletClient - The wallet client that will sign transactions
 * @returns Promise<Bundle> - The prepared Atlas bundle ready for execution
 */
export async function setupAtlas({
  walletClient,
  swapConfig,
  atlasConfig,
  solverConfig
}: AtlasSetupParams): Promise<Bundle> {
  console.log("===== SETTING UP DEMO =====");

  // Get user's address and their execution environment
  const userAddress = walletClient.account?.address as Hex;
  const executionEnvironment = (await atlasSdk.getExecutionEnvironment(
    userAddress,
    atlasConfig.dappControlAddress
  )) as Hex;

  console.log("User address:", userAddress); 
  console.log("Execution environment:", executionEnvironment);
  
  // Encode the swap operation data
  const data = await encodeUserOpData(swapConfig);
  console.log("Generated swap data");

  // Prepare token amounts and approvals
  await mintErc20IfNeeded(
    walletClient, 
    swapConfig.sellToken,
    BigInt(swapConfig.sellToken.amount)
  );

  await approveErc20IfNeeded(
    walletClient,
    swapConfig.sellToken,
    atlasConfig.protocolAddress,
    BigInt(swapConfig.sellToken.amount)
  );

  // Ensure solver has enough tokens
  await sendTokensToSolverIfNeeded(
    eoaClient,
    solverConfig,
    BigInt(swapConfig.sellToken.amount)
  );

  // Get current blockchain state for operation parameters
  const currentBlockNumber = await provider.getBlockNumber();
  const suggestedFeeData = await provider.getFeeData();

  console.log("Current block number:", currentBlockNumber);
  console.log("Generating user operation");

  // Create the Atlas user operation
  let atlasUserOperation = await atlasSdk.newUserOperation({
    from: userAddress,
    value:
      process.env.USER_SELL_TOKEN_ADDRESS == zeroAddress
        ? BigInt(swapConfig.sellToken.amount)
        : BigInt(0),
    gas: BigInt(3_000_000), // Hardcoded for demo
    maxFeePerGas: (suggestedFeeData.maxFeePerGas as bigint) * BigInt(2),
    deadline: BigInt(currentBlockNumber + 10),
    dapp: PROTOCOL_ADDRESS,
    control: DAPP_CONTROL_ADDRESS,
    sessionKey: AUCTIONEER_ADDRESS,
    data,
  });

  console.log("Generated user operation (unsigned)");
  console.log("Sending user operation to FastLane auctioneer");

  // Submit the operation to Atlas
  const bundle = (await atlasSdk.submitUserOperation(atlasUserOperation, [], {
    auctionDurationInMillis: 1500, // Longer duration for the demo
    disableBundling: true, // Disable Atlas bundler, we bundle ourselves
  })) as Bundle;

  console.log("Atlas bundle received");
  console.log("===== SETUP COMPLETE =====");

  return bundle;
}
