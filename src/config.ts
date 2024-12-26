import { NetworkConfig, AtlasConfig, SwapConfig, SolverConfig } from './types';

const chainDetails: Record<number, string> = {
  84532: 'Base Sepolia',
  1: 'Mainnet',
  137: 'Polygon Mainnet',
  10: 'Optimism Mainnet',
  42161: 'Arbitrum Mainnet',
  421614: 'Arbitrum Sepolia',
};

export function createNetworkConfig(
  chainId: number,
  rpcUrl: string
): NetworkConfig {
  return {
    chainId,
    rpcUrl,
    name: chainDetails[chainId] ?? 'Unknown Chain'
  };
}

export function createAtlasConfig(
  params: AtlasConfig
): AtlasConfig {
  return {
    ...params
  };
}

export function createSwapConfig(
  params: Pick<SwapConfig, 'sellToken' | 'buyToken'> & Partial<SwapConfig>
): SwapConfig {
  if (!params.sellToken || !params.buyToken) {
    throw new Error('Sell and buy tokens are required');
  }
  return {
    swapType: 0,
    ...params
  };
} 