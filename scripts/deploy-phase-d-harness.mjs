import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { artifact, compileContracts } from "./contract-utils.mjs";

const EXPECTED_CHAIN_ID = 46630;
const MAX_CANONICAL_SUPPLY = 3232n;
const ZERO_HASH = `0x${"00".repeat(32)}`;

const RPC_URL =
  process.env.RH_TESTNET_RPC_URL ?? "https://rpc.testnet.chain.robinhood.com";
const CHAIN_ID = Number(process.env.RH_CHAIN_ID ?? String(EXPECTED_CHAIN_ID));
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SEALED_URI = process.env.VESSEL_SEALED_URI?.trim();
const MINT_PRICE_ETH = process.env.VESSEL_MINT_PRICE_ETH?.trim() ?? "0.0001";
const MAX_PER_TX = BigInt(process.env.VESSEL_MAX_PER_TX?.trim() ?? "10");
const MAX_PER_WALLET = BigInt(
  process.env.VESSEL_MAX_PER_WALLET?.trim() ?? "10"
);
const REHEARSAL_SUPPLY = BigInt(
  process.env.VESSEL_REHEARSAL_SUPPLY?.trim() ?? "10"
);

function fail(message) {
  throw new Error(`Phase D deploy blocked: ${message}`);
}

if (CHAIN_ID !== EXPECTED_CHAIN_ID) {
  fail(`expected chain id ${EXPECTED_CHAIN_ID}, received ${CHAIN_ID}`);
}
if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  fail("set DEPLOYER_PRIVATE_KEY locally; never commit or paste it into the repo");
}
if (!SEALED_URI) {
  fail("set VESSEL_SEALED_URI before deployment");
}
if (REHEARSAL_SUPPLY <= 0n || REHEARSAL_SUPPLY > MAX_CANONICAL_SUPPLY) {
  fail("VESSEL_REHEARSAL_SUPPLY must be between 1 and 3232");
}
if (
  MAX_PER_TX <= 0n ||
  MAX_PER_WALLET <= 0n ||
  MAX_PER_TX > MAX_PER_WALLET ||
  MAX_PER_WALLET > MAX_CANONICAL_SUPPLY
) {
  fail("invalid mint limits");
}

const mintPrice = parseEther(MINT_PRICE_ETH);
const chain = defineChain({
  id: EXPECTED_CHAIN_ID,
  name: "Robinhood Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain, transport });
const walletClient = createWalletClient({ account, chain, transport });

const rpcChainId = await publicClient.getChainId();
if (rpcChainId !== EXPECTED_CHAIN_ID) {
  fail(`RPC reports chain id ${rpcChainId}, expected ${EXPECTED_CHAIN_ID}`);
}

const balance = await publicClient.getBalance({ address: account.address });
if (balance <= 0n) {
  fail("operator wallet has no testnet ETH");
}

const compiled = compileContracts({ includeHarness: true });
const harness = artifact(
  compiled,
  "contracts/test/VesselNFTTestHarness.sol",
  "VesselNFTTestHarness"
);

console.log("NULL RITE // PHASE D HARNESS DEPLOYMENT");
console.log(`Network: Robinhood Testnet (${EXPECTED_CHAIN_ID})`);
console.log(`Owner: ${account.address}`);
console.log(`Operator balance: ${formatEther(balance)} ETH`);
console.log(`Mint price: ${MINT_PRICE_ETH} ETH`);
console.log(`Max per tx: ${MAX_PER_TX}`);
console.log(`Max per wallet: ${MAX_PER_WALLET}`);
console.log(`Rehearsal supply: ${REHEARSAL_SUPPLY}`);
console.log(`Sealed URI: ${SEALED_URI}`);
console.log("Initial Summoning state: SEALED");

const hash = await walletClient.deployContract({
  abi: harness.abi,
  bytecode: harness.bytecode,
  args: [
    account.address,
    mintPrice,
    MAX_PER_TX,
    MAX_PER_WALLET,
    SEALED_URI,
    REHEARSAL_SUPPLY,
  ],
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) {
  fail(`deployment failed: ${hash}`);
}

const address = receipt.contractAddress;
const read = (functionName) =>
  publicClient.readContract({ address, abi: harness.abi, functionName });

const [
  owner,
  totalSupply,
  remainingSupply,
  onchainMintPrice,
  onchainMaxPerTx,
  onchainMaxPerWallet,
  publicMintActive,
  summoningStarted,
  revealed,
  provenanceHash,
] = await Promise.all([
  read("owner"),
  read("totalSupply"),
  read("remainingSupply"),
  read("mintPrice"),
  read("maxPerTx"),
  read("maxPerWallet"),
  read("publicMintActive"),
  read("summoningStarted"),
  read("revealed"),
  read("provenanceHash"),
]);

if (owner.toLowerCase() !== account.address.toLowerCase()) fail("owner mismatch");
if (totalSupply !== 0n) fail(`unexpected totalSupply ${totalSupply}`);
if (remainingSupply !== REHEARSAL_SUPPLY) {
  fail(`remainingSupply ${remainingSupply} does not match rehearsal supply`);
}
if (onchainMintPrice !== mintPrice) fail("mintPrice mismatch");
if (onchainMaxPerTx !== MAX_PER_TX) fail("maxPerTx mismatch");
if (onchainMaxPerWallet !== MAX_PER_WALLET) fail("maxPerWallet mismatch");
if (publicMintActive !== false) fail("publicMintActive must start false");
if (summoningStarted !== false) fail("summoningStarted must start false");
if (revealed !== false) fail("revealed must start false");
if (provenanceHash.toLowerCase() !== ZERO_HASH) fail("provenance must start zero");

console.log("\nPHASE D HARNESS DEPLOYMENT // VERIFIED");
console.log(`Contract: ${address}`);
console.log(`Transaction: ${hash}`);
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Explorer: https://explorer.testnet.chain.robinhood.com/tx/${hash}`);
console.log(`NEXT_PUBLIC_NULLRITE_ADDRESS=${address}`);
console.log(`NEXT_PUBLIC_NULLRITE_REHEARSAL_SUPPLY=${REHEARSAL_SUPPLY}`);
console.log("Do not open Summoning until ChatGPT returns GO.");
