// Import the required functions
import {
  createPublicClient,
  createWalletClient,
  getContract,
  Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import demoErc20Abi from "./abi/erc20.json";
import dotenv from "dotenv";
import {
  USER_PK,
  RPC_URL,
  USER_SELL_TOKEN_ADDRESS,
  USER_BUY_TOKEN_ADDRESS,
  CHAIN,
} from "./constants";

// Load environment variables from .env file
dotenv.config();

// Create an EOA (Externally Owned Account) from the private key
const eoa = privateKeyToAccount(USER_PK);

// Create a wallet client that can sign transactions
export const eoaClient = createWalletClient({
  chain: CHAIN,
  transport: http(RPC_URL),
  account: eoa,
});

// Create a public client for reading blockchain state
export const publicClient = createPublicClient({
  transport: http(RPC_URL),
  chain: CHAIN,
});

/**
 * Creates a contract instance for interacting with ERC20 tokens
 * @param address The address of the ERC20 token contract
 * @returns A contract instance with both read and write capabilities
 */
export function getErc20Contract(address: Hex) {
  return getContract({
    address: address,
    abi: demoErc20Abi,
    client: {
      public: publicClient,
      account: eoaClient.account,
    },
  });
}

// Create contract instances for the tokens being traded
export const demoErc20UserIsSelling = getErc20Contract(USER_SELL_TOKEN_ADDRESS);
export const demoErc20UserIsBuying = getErc20Contract(USER_BUY_TOKEN_ADDRESS);
