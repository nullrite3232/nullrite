import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { encodePacked, keccak256, toBytes } from "viem";

export const FAIRNESS_SCHEMA = "nullrite.phase-d.rehearsal-manifest.v1";
export const EXPECTED_CHAIN_ID = 46630;
export const EXPECTED_CONTRACT = "0x0ab741e1c3377854678958404e749c2a1e71e0e2";
export const EXPECTED_IMAGE_ROOT_CID = "QmPax47qCinP2c6hj77F4CBvB74VHsas2j8Dqa3TdGphZq";
export const ASSIGNMENT_DOMAIN = "NULL_RITE_PHASE_D_ASSIGNMENT_V1";
export const SEED_BLOCK_OFFSET = 20n;
export const DEFAULT_MANIFEST_PATH = fileURLToPath(
  new URL("../fairness/phase-d-rehearsal-manifest.json", import.meta.url)
);

const RARITIES = new Set(["Common", "Uncommon", "Rare", "Epic", "Legendary"]);
const BYTES32_RE = /^0x[0-9a-fA-F]{64}$/;

function fail(message) {
  throw new Error(`Phase D fairness blocked: ${message}`);
}

export function canonicalizeJson(value) {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) fail("canonical JSON only accepts safe integers");
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`)
      .join(",")}}`;
  }
  fail(`unsupported canonical JSON value type: ${typeof value}`);
}

export function loadManifest(path = DEFAULT_MANIFEST_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("manifest must be a JSON object");
  }
  if (manifest.schema !== FAIRNESS_SCHEMA) fail("unexpected manifest schema");
  if (manifest.project !== "NULL RITE") fail("unexpected project");
  if (manifest.network !== "Robinhood Testnet") fail("unexpected network");
  if (manifest.chain_id !== EXPECTED_CHAIN_ID) fail("unexpected chain id");
  if (String(manifest.contract).toLowerCase() !== EXPECTED_CONTRACT.toLowerCase()) {
    fail("unexpected contract");
  }
  if (manifest.collection_size !== 10) fail("rehearsal collection size must be 10");
  if (manifest.image_root_cid !== EXPECTED_IMAGE_ROOT_CID) fail("unexpected image root CID");
  if (!Array.isArray(manifest.items) || manifest.items.length !== 10) {
    fail("manifest must contain exactly 10 items");
  }

  const ids = new Set();
  const filenames = new Set();

  manifest.items.forEach((item, index) => {
    const expectedId = index + 1;
    if (item.token_id !== expectedId) {
      fail(`manifest item ${index} token_id must be ${expectedId}`);
    }
    if (ids.has(item.token_id)) fail(`duplicate source token_id ${item.token_id}`);
    ids.add(item.token_id);

    const expectedFilename = `Vessel_${String(item.token_id).padStart(4, "0")}.png`;
    if (item.filename !== expectedFilename) {
      fail(`source ${item.token_id} filename must be ${expectedFilename}`);
    }
    if (filenames.has(item.filename)) fail(`duplicate filename ${item.filename}`);
    filenames.add(item.filename);

    if (!RARITIES.has(item.rarity)) fail(`invalid rarity for source ${item.token_id}`);
    if (item.source_rel !== `${item.rarity}/${item.filename}`) {
      fail(`source_rel mismatch for source ${item.token_id}`);
    }
    if (!Number.isSafeInteger(item.bytes) || item.bytes <= 0) {
      fail(`invalid byte size for source ${item.token_id}`);
    }
  });

  return manifest;
}

export function canonicalManifest(manifest) {
  validateManifest(manifest);
  return canonicalizeJson(manifest);
}

export function provenanceHashForManifest(manifest) {
  return keccak256(toBytes(canonicalManifest(manifest)));
}

export function assertBytes32(value, label) {
  if (!BYTES32_RE.test(value ?? "")) fail(`${label} must be a 32-byte hex value`);
  return value.toLowerCase();
}

export function buildAssignment(manifest, provenanceHash, seedBlockHash) {
  validateManifest(manifest);
  const provenance = assertBytes32(provenanceHash, "provenance hash");
  const seed = assertBytes32(seedBlockHash, "seed block hash");

  const ranked = manifest.items.map((item) => {
    const score = keccak256(
      encodePacked(
        ["string", "bytes32", "bytes32", "uint256"],
        [ASSIGNMENT_DOMAIN, provenance, seed, BigInt(item.token_id)]
      )
    );
    return { item, score };
  });

  ranked.sort((a, b) => {
    const byScore = a.score.localeCompare(b.score);
    return byScore !== 0 ? byScore : a.item.token_id - b.item.token_id;
  });

  return ranked.map(({ item, score }, index) => ({
    token_id: index + 1,
    source_token_id: item.token_id,
    filename: item.filename,
    rarity: item.rarity,
    image: `ipfs://${manifest.image_root_cid}/${item.filename}`,
    score,
  }));
}

export function validateAssignment(manifest, assignment) {
  validateManifest(manifest);
  if (!Array.isArray(assignment) || assignment.length !== manifest.collection_size) {
    fail("assignment length mismatch");
  }
  const tokenIds = new Set();
  const sourceIds = new Set();
  for (const row of assignment) {
    if (!Number.isSafeInteger(row.token_id) || row.token_id < 1 || row.token_id > 10) {
      fail("invalid assigned token id");
    }
    if (!Number.isSafeInteger(row.source_token_id) || row.source_token_id < 1 || row.source_token_id > 10) {
      fail("invalid source token id");
    }
    tokenIds.add(row.token_id);
    sourceIds.add(row.source_token_id);
  }
  if (tokenIds.size !== 10 || sourceIds.size !== 10) {
    fail("assignment must be a one-to-one permutation");
  }
  return assignment;
}
