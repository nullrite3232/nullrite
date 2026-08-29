import {
  createPublicClient,
  decodeFunctionData,
  defineChain,
  http,
  parseAbi,
} from "viem";
import {
  DEFAULT_MANIFEST_PATH,
  EXPECTED_CHAIN_ID,
  EXPECTED_CONTRACT,
  SEED_BLOCK_OFFSET,
  buildAssignment,
  canonicalManifest,
  loadManifest,
  provenanceHashForManifest,
  validateAssignment,
} from "./phase-d-fairness-lib.mjs";

const RPC_URL =
  process.env.RH_TESTNET_RPC_URL ?? "https://rpc.testnet.chain.robinhood.com";
const command = (process.argv[2] ?? "manifest").toLowerCase();
const manifest = loadManifest(process.env.VESSEL_FAIRNESS_MANIFEST ?? DEFAULT_MANIFEST_PATH);
const canonical = canonicalManifest(manifest);
const provenanceHash = provenanceHashForManifest(manifest);

function fail(message) {
  throw new Error(`Phase D fairness blocked: ${message}`);
}

function printManifestSummary() {
  console.log("PHASE D // FAIRNESS MANIFEST");
  console.log(`Schema: ${manifest.schema}`);
  console.log(`Contract: ${manifest.contract}`);
  console.log(`Items: ${manifest.items.length}`);
  console.log(`Image root CID: ${manifest.image_root_cid}`);
  console.log(`Canonical UTF-8 bytes: ${Buffer.byteLength(canonical, "utf8")}`);
  console.log(`Provenance hash: ${provenanceHash}`);
}

if (command === "manifest" || command === "hash") {
  printManifestSummary();
  if (process.env.PRINT_CANONICAL_BYTES === "1") {
    console.log("\nCANONICAL MANIFEST BYTES (UTF-8 text)");
    console.log(canonical);
  }
  process.exit(0);
}

if (command === "assign") {
  const seedBlockHash = process.env.VESSEL_SEED_BLOCK_HASH?.trim();
  if (!seedBlockHash) fail("set VESSEL_SEED_BLOCK_HASH");
  const assignment = buildAssignment(manifest, provenanceHash, seedBlockHash);
  validateAssignment(manifest, assignment);
  printManifestSummary();
  console.log(`Seed block hash: ${seedBlockHash.toLowerCase()}`);
  console.log("\nASSIGNMENT");
  console.log(JSON.stringify(assignment, null, 2));
  process.exit(0);
}

if (command !== "seed") {
  fail("command must be one of: manifest, hash, assign, seed");
}

const provenanceTxHash = process.env.VESSEL_PROVENANCE_TX_HASH?.trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(provenanceTxHash ?? "")) {
  fail("set VESSEL_PROVENANCE_TX_HASH to the successful provenance transaction");
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

const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const rpcChainId = await publicClient.getChainId();
if (rpcChainId !== EXPECTED_CHAIN_ID) {
  fail(`RPC chain ${rpcChainId} != ${EXPECTED_CHAIN_ID}`);
}

const abi = parseAbi([
  "function provenanceHash() view returns (bytes32)",
  "function totalSupply() view returns (uint256)",
  "function remainingSupply() view returns (uint256)",
  "function revealed() view returns (bool)",
  "function commitProvenance(bytes32 newProvenanceHash)",
]);

const [onchainProvenance, totalSupply, remainingSupply, revealed, receipt, transaction] =
  await Promise.all([
    publicClient.readContract({
      address: EXPECTED_CONTRACT,
      abi,
      functionName: "provenanceHash",
    }),
    publicClient.readContract({
      address: EXPECTED_CONTRACT,
      abi,
      functionName: "totalSupply",
    }),
    publicClient.readContract({
      address: EXPECTED_CONTRACT,
      abi,
      functionName: "remainingSupply",
    }),
    publicClient.readContract({
      address: EXPECTED_CONTRACT,
      abi,
      functionName: "revealed",
    }),
    publicClient.getTransactionReceipt({ hash: provenanceTxHash }),
    publicClient.getTransaction({ hash: provenanceTxHash }),
  ]);

if (totalSupply !== 10n || remainingSupply !== 0n) {
  fail("Assembly must remain sold out before seed derivation");
}
if (revealed) fail("Reveal already happened");
if (onchainProvenance.toLowerCase() !== provenanceHash.toLowerCase()) {
  fail(`onchain provenance ${onchainProvenance} != manifest hash ${provenanceHash}`);
}
if (receipt.status !== "success") fail("provenance transaction receipt is not successful");
if (transaction.to?.toLowerCase() !== EXPECTED_CONTRACT.toLowerCase()) {
  fail("provenance transaction target is not the rehearsal contract");
}

let decoded;
try {
  decoded = decodeFunctionData({ abi, data: transaction.input });
} catch {
  fail("could not decode provenance transaction calldata");
}
if (
  decoded.functionName !== "commitProvenance" ||
  decoded.args?.[0]?.toLowerCase() !== provenanceHash.toLowerCase()
) {
  fail("transaction is not commitProvenance(manifestHash)");
}

const seedBlockNumber = receipt.blockNumber + SEED_BLOCK_OFFSET;
const latestBlockNumber = await publicClient.getBlockNumber();

printManifestSummary();
console.log(`Provenance tx: ${provenanceTxHash}`);
console.log(`Provenance block: ${receipt.blockNumber}`);
console.log(`Seed block rule: provenance block + ${SEED_BLOCK_OFFSET}`);
console.log(`Seed block: ${seedBlockNumber}`);
console.log(`Latest block: ${latestBlockNumber}`);

if (latestBlockNumber < seedBlockNumber) {
  console.log(`SEED STATUS: WAIT (${seedBlockNumber - latestBlockNumber} blocks remaining)`);
  process.exitCode = 2;
} else {
  const seedBlock = await publicClient.getBlock({ blockNumber: seedBlockNumber });
  if (!seedBlock.hash) fail("seed block has no hash");
  const assignment = buildAssignment(manifest, provenanceHash, seedBlock.hash);
  validateAssignment(manifest, assignment);

  console.log("SEED STATUS: READY");
  console.log(`Seed: ${seedBlock.hash}`);
  console.log("\nASSIGNMENT");
  console.log(JSON.stringify(assignment, null, 2));
}
