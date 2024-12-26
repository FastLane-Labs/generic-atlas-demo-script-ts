import { Hex, encodeFunctionData, WalletClient } from "viem";
import { atlasSdk } from "./common";
import { demoErc20UserIsSelling, publicClient } from "./user";
import { ETH } from "./constants";
import erc20Abi from "./abi/erc20.json";
import { TokenConfig, SolverConfig } from "./types";

/**
 * Mints ERC20 tokens for the user if they don't have enough
 * Only applies to non-ETH tokens that support minting
 * 
 * @param client - The wallet client to use for transactions
 * @param token - The token configuration
 * @param targetAmount - The amount of tokens needed
 */
export async function mintErc20IfNeeded(
  client: WalletClient,
  token: TokenConfig,
  targetAmount: bigint
) {
  if (token.address === ETH) {
    console.log("Token is ETH, skipping mint");
    return;
  }

  const userAddress = client.account?.address as Hex;
  const balance = (await demoErc20UserIsSelling.read.balanceOf([
    userAddress,
  ])) as bigint;

  if (balance >= targetAmount) {
    console.log("User already has enough tokens, skipping mint");
    return;
  }

  console.log("Minting tokens");

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "mint",
    args: [userAddress, targetAmount],
  });

  const hash = await client.sendTransaction({
    account: client.account!,
    chain: null,
    to: process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    data,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Minted tokens:", hash);
}

/**
 * Approves the Atlas contract to spend user's tokens if needed
 * Only applies to non-ETH tokens
 * 
 * @param client - The wallet client to use for transactions
 * @param token - The token configuration
 * @param spender - The address of the spender
 * @param amount - The amount of tokens to approve
 */
export async function approveErc20IfNeeded(
  client: WalletClient,
  token: TokenConfig,
  spender: Hex,
  amount: bigint
) {
  if (token.address === ETH) {
    console.log("Token is ETH, skipping approval");
    return;
  }

  const atlasAddress = (await atlasSdk.getAtlasAddress()) as Hex;
  const allowance = (await demoErc20UserIsSelling.read.allowance([
    client.account?.address,
    atlasAddress,
  ])) as bigint;

  if (allowance >= amount) {
    console.log("User already has enough allowance, skipping approval");
    return;
  }

  console.log("Approving tokens");

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [atlasAddress, amount],
  });

  const hash = await client.sendTransaction({
    account: client.account!,
    chain: null,
    to: process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    data,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Approved:", hash);
}

/**
 * Sends ETH to the solver contract if needed
 * This ensures the solver has enough ETH to fulfill the trade
 * 
 * @param client - The wallet client to use for transactions
 * @param solverConfig - The solver configuration
 * @param minAmountUserBuys - Minimum amount user expects to receive
 */
export async function sendTokensToSolverIfNeeded(
  client: WalletClient,
  solverConfig: SolverConfig,
  minAmountUserBuys: bigint
) {
  if (!solverConfig.shouldFulfill) {
    console.log("Solver should not fulfill, skipping sending tokens");
    return;
  }

  const currentBalance = await publicClient.getBalance({
    address: solverConfig.address as Hex,
  });

  if (currentBalance >= solverConfig.expectedBidAmount) {
    console.log("Solver already has enough eth");
    return;
  }

  let txHash: Hex;
  console.log("Sending eth to solver");

  txHash = await client.sendTransaction({
    account: client.account!,
    chain: null,
    to: solverConfig.address as Hex,
    value: solverConfig.expectedBidAmount - currentBalance,
  });

  console.log("Sent eth to solver:", txHash);
}
