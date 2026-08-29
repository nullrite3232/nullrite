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

const provenance = provenanceHashForManifest(manifest);
assert.match(provenance, /^0x[0-9a-f]{64}$/);
assert.notEqual(provenance, `0x${"00".repeat(32)}`);

const seed = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const assignmentA = buildAssignment(manifest, provenance, seed);
const assignmentB = buildAssignment(manifest, provenance, seed);
assert.deepEqual(assignmentA, assignmentB);
validateAssignment(manifest, assignmentA);

assert.deepEqual(
  assignmentA.map((row) => row.token_id),
  [1,2,3,4,5,6,7,8,9,10]
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
console.log(`TEST_SEED=${seed}`);
console.log(`TEST_ASSIGNMENT=${assignmentA.map((row) => row.source_token_id).join(",")}`);
