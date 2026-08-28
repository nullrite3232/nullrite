import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  http,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { artifact, compileContracts } from "./contract-utils.mjs";

const EXPECTED_CHAIN_ID = 46630;
const ZERO_HASH = `0x${"00".repeat(32)}`;
const RPC_URL =
  process.env.RH_TESTNET_RPC_URL ?? "https://rpc.testnet.chain.robinhood.com";
const CHAIN_ID = Number(process.env.RH_CHAIN_ID ?? String(EXPECTED_CHAIN_ID));
const CONTRACT_ADDRESS = process.env.PHASE_D_CONTRACT_ADDRESS?.trim();
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const ACTION = process.argv[2]?.trim().toLowerCase() ?? "state";

function fail(message) {
  throw new Error(`Phase D owner action blocked: ${message}`);
}

if (CHAIN_ID !== EXPECTED_CHAIN_ID) {
  fail(`expected chain id ${EXPECTED_CHAIN_ID}, received ${CHAIN_ID}`);
}
if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
  fail("set PHASE_D_CONTRACT_ADDRESS to the verified harness contract");
}

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

const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain, transport });
const rpcChainId = await publicClient.getChainId();
if (rpcChainId !== EXPECTED_CHAIN_ID) {
  fail(`RPC reports chain id ${rpcChainId}, expected ${EXPECTED_CHAIN_ID}`);
}

const compiled = compileContracts({ includeHarness: true });
const harness = artifact(
  compiled,
  "contracts/test/VesselNFTTestHarness.sol",
  "VesselNFTTestHarness"
);

const read = (functionName, args = undefined) =>
  publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: harness.abi,
    functionName,
    ...(args ? { args } : {}),
  });

async function readState() {
  const [
    owner,
    totalSupply,
    remainingSupply,
    mintPrice,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    summoningStarted,
    revealed,
    provenanceHash,
    sealedURI,
    revealedBaseURI,
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
    read("sealedURI"),
    read("revealedBaseURI"),
  ]);

  return {
    owner,
    totalSupply,
    remainingSupply,
    mintPrice,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    summoningStarted,
    revealed,
    provenanceHash,
    sealedURI,
    revealedBaseURI,
  };
}

function printState(state, title = "PHASE D CONTRACT STATE") {
  console.log(`\n${title}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Network: Robinhood Testnet (${EXPECTED_CHAIN_ID})`);
  console.log(`Owner: ${state.owner}`);
  console.log(`Total supply: ${state.totalSupply}`);
  console.log(`Remaining supply: ${state.remainingSupply}`);
  console.log(`Mint price: ${formatEther(state.mintPrice)} ETH`);
  console.log(`Max per tx: ${state.maxPerTx}`);
  console.log(`Max per wallet: ${state.maxPerWallet}`);
  console.log(`Public mint active: ${state.publicMintActive}`);
  console.log(`Summoning started: ${state.summoningStarted}`);
  console.log(`Revealed: ${state.revealed}`);
  console.log(`Provenance: ${state.provenanceHash}`);
  console.log(`Sealed URI: ${state.sealedURI}`);
  console.log(`Revealed base URI: ${state.revealedBaseURI || "<empty>"}`);
}

const before = await readState();
printState(before, "PHASE D // BEFORE ACTION");

if (ACTION === "state") {
  process.exit(0);
}

const supported = new Set(["open", "close", "provenance", "reveal"]);
if (!supported.has(ACTION)) {
  fail("action must be one of: state, open, close, provenance, reveal");
}

if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  fail("set DEPLOYER_PRIVATE_KEY locally for write actions");
}

const account = privateKeyToAccount(PRIVATE_KEY);
if (account.address.toLowerCase() !== before.owner.toLowerCase()) {
  fail(`signer ${account.address} is not contract owner ${before.owner}`);
}

const walletClient = createWalletClient({ account, chain, transport });
let functionName;
let args;

if (ACTION === "open") {
  if (before.revealed) fail("cannot open after Reveal");
  if (before.remainingSupply === 0n) fail("cannot open sold-out Assembly");
  if (before.publicMintActive) fail("Summoning is already open");
  functionName = "setPublicMintActive";
  args = [true];
}

if (ACTION === "close") {
  if (!before.publicMintActive) fail("Summoning is already closed");
  functionName = "setPublicMintActive";
  args = [false];
}

if (ACTION === "provenance") {
  const hash = process.env.VESSEL_PROVENANCE_HASH?.trim();
  if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash) || hash.toLowerCase() === ZERO_HASH) {
    fail("set VESSEL_PROVENANCE_HASH to the approved non-zero bytes32 value");
  }
  if (before.remainingSupply !== 0n) fail("Assembly is not sold out");
  if (before.revealed) fail("already revealed");
  if (before.provenanceHash.toLowerCase() !== ZERO_HASH) {
    fail("provenance is already committed");
  }
  functionName = "commitProvenance";
  args = [hash];
}

if (ACTION === "reveal") {
  const baseURI = process.env.VESSEL_REVEALED_BASE_URI?.trim();
  if (!baseURI) fail("set VESSEL_REVEALED_BASE_URI to the approved metadata base URI");
  if (!baseURI.endsWith("/")) {
    fail("VESSEL_REVEALED_BASE_URI must end with / because tokenURI appends <id>.json");
  }
  if (before.remainingSupply !== 0n) fail("Assembly is not sold out");
  if (before.provenanceHash.toLowerCase() === ZERO_HASH) fail("provenance is not committed");
  if (before.revealed) fail("already revealed");
  functionName = "reveal";
  args = [baseURI];
}

console.log(`\nSimulating owner action: ${ACTION}`);
console.log(`Signer: ${account.address}`);

const { request } = await publicClient.simulateContract({
  account,
  address: CONTRACT_ADDRESS,
  abi: harness.abi,
  functionName,
  args,
});

console.log("Simulation: PASS");
console.log(`Broadcasting owner action: ${ACTION}`);

const hash = await walletClient.writeContract(request);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") {
  fail(`transaction failed: ${hash}`);
}

const after = await readState();

if (ACTION === "open") {
  if (!after.publicMintActive || !after.summoningStarted) {
    fail("post-check failed: Summoning did not enter OPEN state");
  }
}
if (ACTION === "close" && after.publicMintActive) {
  fail("post-check failed: Summoning is still open");
}
if (ACTION === "provenance") {
  const expected = process.env.VESSEL_PROVENANCE_HASH.trim().toLowerCase();
  if (after.provenanceHash.toLowerCase() !== expected) {
    fail("post-check failed: onchain provenance does not match expected hash");
  }
}
if (ACTION === "reveal") {
  const expected = process.env.VESSEL_REVEALED_BASE_URI.trim();
  if (!after.revealed) fail("post-check failed: revealed is false");
  if (after.revealedBaseURI !== expected) fail("post-check failed: base URI mismatch");
  if (after.publicMintActive) fail("post-check failed: public mint must remain closed");
}

console.log("\nPHASE D OWNER ACTION // VERIFIED");
console.log(`Action: ${ACTION}`);
console.log(`Transaction: ${hash}`);
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Explorer: https://explorer.testnet.chain.robinhood.com/tx/${hash}`);
printState(after, "PHASE D // AFTER ACTION");
