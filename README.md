# Atlas Integration Demo

> ⚠️ **WARNING: Demo Purpose Only** ⚠️
> 
> This code is for demonstration purposes only and should NOT be used in production environments. It:
> - Contains hardcoded values and simplified error handling
> - May not implement all necessary security measures
> - Has not been audited or tested
> - Uses a demo solver configuration
> 
> For production implementations, please refer to the official Atlas Protocol documentation and implement proper security measures.

This demo shows how to integrate with Atlas Protocol for token swaps with MEV protection. It demonstrates setting up user operations, handling token approvals, and executing swaps through Atlas.

## Instructions

### Install dependencies

```bash
npm install
```

### Setup environment variables

```bash
cp .env.example .env
```

Fill in the following environment variables in `.env`:

```env
# Required Secrets
USER_PK=""          # Private key for the user's wallet
RPC_URL=""          # RPC endpoint URL
CHAIN_ID=""         # Chain ID (e.g., 84532 for Base Sepolia)

# Atlas Protocol Configuration
AUCTIONEER_ENDPOINT=""    # Atlas auctioneer API endpoint
AUCTIONEER_ADDRESS=""     # Atlas auctioneer contract address
DAPP_CONTROL_ADDRESS=""   # Atlas control contract address
PROTOCOL_ADDRESS=""       # Protocol (e.g., Uniswap) router address

# Swap Configuration
USER_BUY_TOKEN_ADDRESS=""   # Address of token to buy
USER_SELL_TOKEN_ADDRESS=""  # Address of token to sell
USER_SELL_TOKEN_AMOUNT=""   # Amount of tokens to sell
USER_BUY_TOKEN_AMOUNT=""    # Minimum amount of tokens to receive

# Solver Configuration
SOLVER_CONTRACT_ADDRESS=""  # Address of the solver contract
SOLVER_SHOULD_FULFILL="true"  # Whether solver should fulfill the trade
```

### What the Demo Does

1. Sets up network and protocol configurations
2. Prepares token approvals if needed
3. Creates and submits a user operation to Atlas
4. Handles solver interactions and bid selection
5. Executes the final bundled transaction

### Run demo

The demo uses an EOA (Externally Owned Account) for self-bundling:

```bash
npm run demo
```
