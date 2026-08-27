import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { artifact, compileContracts } from "./contract-utils.mjs";

const RPC_URL = process.env.RH_TESTNET_RPC_URL ?? "https://rpc.testnet.chain.robinhood.com";
const CHAIN_ID = Number(process.env.RH_CHAIN_ID ?? "46630");
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SEALED_URI = process.env.VESSEL_SEALED_URI;
const MINT_PRICE_ETH = process.env.VESSEL_MINT_PRICE_ETH ?? "0.0001";
const MAX_PER_TX = BigInt(process.env.VESSEL_MAX_PER_TX ?? "5");
const MAX_PER_WALLET = BigInt(process.env.VESSEL_MAX_PER_WALLET ?? "10");

if (CHAIN_ID !== 46630) {
  throw new Error("Phase B deploy script is testnet-only. Expected chain id 46630.");
}
if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  throw new Error("Set DEPLOYER_PRIVATE_KEY locally. Never commit or paste it into the repo.");
}
if (!SEALED_URI) {
  throw new Error("Set VESSEL_SEALED_URI to the sealed metadata URI before deployment.");
}

const chain = defineChain({
  id: 46630,
  name: "Robinhood Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://explorer.testnet.chain.robinhood.com" },
  },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain, transport });
const walletClient = createWalletClient({ account, chain, transport });

const compiled = compileContracts();
const vessel = artifact(compiled, "contracts/VesselNFT.sol", "VesselNFT");
const mintPrice = parseEther(MINT_PRICE_ETH);

console.log("Deploying VesselNFT RC to Robinhood Testnet...");
console.log(`Owner: ${account.address}`);
console.log(`Mint price: ${MINT_PRICE_ETH} ETH`);
console.log(`Max per tx: ${MAX_PER_TX}`);
console.log(`Max per wallet: ${MAX_PER_WALLET}`);
console.log("Initial publicMintActive: false (constructor default)");

const hash = await walletClient.deployContract({
  abi: vessel.abi,
  bytecode: vessel.bytecode,
  args: [account.address, mintPrice, MAX_PER_TX, MAX_PER_WALLET, SEALED_URI],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) {
  throw new Error(`Deployment failed: ${hash}`);
}

console.log(`VesselNFT testnet address: ${receipt.contractAddress}`);
console.log(`Transaction: https://explorer.testnet.chain.robinhood.com/tx/${hash}`);
console.log("Keep Summoning sealed until the full rehearsal is approved.");
console.log(`NEXT_PUBLIC_NULLRITE_ADDRESS=${receipt.contractAddress}`);
