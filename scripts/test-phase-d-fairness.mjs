import assert from "node:assert/strict";
import {
  ASSIGNMENT_DOMAIN,
  DEFAULT_MANIFEST_PATH,
  EXPECTED_CHAIN_ID,
  EXPECTED_CONTRACT,
  SEED_BLOCK_OFFSET,
  buildAssignment,
  canonicalManifest,
  loadManifest,
  provenanceHashForManifest,
  validateAssignment,
  validateManifest,
} from "./phase-d-fairness-lib.mjs";

const EXPECTED_PROVENANCE_HASH =
  "0x457a35bda9a590175de6d89258591486fdfe87210d97110bf39a21cb9aaacf75";
const TEST_SEED =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const EXPECTED_TEST_ASSIGNMENT = [2, 6, 1, 9, 10, 3, 4, 7, 8, 5];

const manifest = loadManifest(DEFAULT_MANIFEST_PATH);
validateManifest(manifest);

assert.equal(manifest.chain_id, EXPECTED_CHAIN_ID);
assert.equal(manifest.contract.toLowerCase(), EXPECTED_CONTRACT.toLowerCase());
assert.equal(manifest.collection_size, 10);
assert.equal(manifest.items.length, 10);
assert.equal(SEED_BLOCK_OFFSET, 20n);
assert.equal(ASSIGNMENT_DOMAIN, "NULL_RITE_PHASE_D_ASSIGNMENT_V1");

const canonical = canonicalManifest(manifest);
const reformatted = JSON.parse(JSON.stringify(manifest, null, 4));
assert.equal(canonicalManifest(reformatted), canonical);
assert.equal(Buffer.byteLength(canonical, "utf8"), 1626);

const provenance = provenanceHashForManifest(manifest);
assert.equal(provenance, EXPECTED_PROVENANCE_HASH);

const assignmentA = buildAssignment(manifest, provenance, TEST_SEED);
const assignmentB = buildAssignment(manifest, provenance, TEST_SEED);
assert.deepEqual(assignmentA, assignmentB);
validateAssignment(manifest, assignmentA);

assert.deepEqual(
  assignmentA.map((row) => row.token_id),
  [1,2,3,4,5,6,7,8,9,10]
);
assert.deepEqual(
  assignmentA.map((row) => row.source_token_id),
  EXPECTED_TEST_ASSIGNMENT
);
assert.equal(new Set(assignmentA.map((row) => row.source_token_id)).size, 10);
assert.equal(new Set(assignmentA.map((row) => row.filename)).size, 10);
for (const row of assignmentA) {
  assert.equal(
    row.image,
    `ipfs://${manifest.image_root_cid}/${row.filename}`
  );
}

console.log("PHASE D FAIRNESS TESTS: PASS");
console.log(`CANONICAL_UTF8_BYTES=${Buffer.byteLength(canonical, "utf8")}`);
console.log(`PROVENANCE_HASH=${provenance}`);
console.log(`TEST_SEED=${TEST_SEED}`);
console.log(`TEST_ASSIGNMENT=${assignmentA.map((row) => row.source_token_id).join(",")}`);
