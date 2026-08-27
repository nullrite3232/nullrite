import assert from "node:assert/strict";
import ganache from "ganache";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  getAddress,
  keccak256,
  parseEther,
  toHex,
} from "viem";
import { artifact, compileContracts } from "./contract-utils.mjs";

const contracts = compileContracts({ includeHarness: true });
const harness = artifact(
  contracts,
  "contracts/test/VesselNFTTestHarness.sol",
  "VesselNFTTestHarness"
);

const provider = ganache.provider({
  logging: { quiet: true },
  chain: { chainId: 31337, hardfork: "shanghai" },
  wallet: { totalAccounts: 8, defaultBalance: 1000 },
  miner: { blockGasLimit: 100_000_000 },
});

const chain = defineChain({
  id: 31337,
  name: "NULL RITE Local Test",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1"] } },
});

const transport = custom(provider);
const publicClient = createPublicClient({ chain, transport });
const rawAccounts = await provider.request({ method: "eth_accounts", params: [] });
const accounts = rawAccounts.map((value) => getAddress(value));
const wallet = (index) =>
  createWalletClient({ account: accounts[index], chain, transport });

const owner = wallet(0);
const user1 = wallet(1);
const user2 = wallet(2);
const recipient = wallet(3);
const initialPrice = parseEther("0.01");
const price = parseEther("0.02");
const sealedURI = "ipfs://null-rite-test/sealed.json";
const revealedBaseURI = "ipfs://null-rite-test/revealed/";

const deployHash = await owner.deployContract({
  abi: harness.abi,
  bytecode: harness.bytecode,
  args: [accounts[0], initialPrice, 3n, 4n, sealedURI, 5n],
});
const deployment = await publicClient.waitForTransactionReceipt({ hash: deployHash });
assert.equal(deployment.status, "success");
assert.ok(deployment.contractAddress);
const address = deployment.contractAddress;

async function read(functionName, args = []) {
  return publicClient.readContract({ address, abi: harness.abi, functionName, args });
}

async function write(client, functionName, args = [], value) {
  const hash = await client.writeContract({
    address,
    abi: harness.abi,
    functionName,
    args,
    ...(value === undefined ? {} : { value }),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  assert.equal(receipt.status, "success", `${functionName} transaction reverted`);
  return receipt;
}

async function expectRevert(label, request) {
  let reverted = false;
  try {
    await publicClient.simulateContract({ address, abi: harness.abi, ...request });
  } catch {
    reverted = true;
  }
  assert.equal(reverted, true, `${label} should revert`);
}

assert.equal(await read("MAX_SUPPLY"), 3232n);
assert.equal(await read("totalSupply"), 0n);
assert.equal(await read("publicMintActive"), false);
assert.equal(await read("summoningStarted"), false);
assert.equal(await read("revealed"), false);

await expectRevert("mint while sealed", {
  account: accounts[1],
  functionName: "mint",
  args: [1n],
  value: initialPrice,
});
await expectRevert("non-owner config", {
  account: accounts[1],
  functionName: "configureMint",
  args: [price, 3n, 4n],
});

await write(owner, "configureMint", [price, 3n, 4n]);
assert.equal(await read("mintPrice"), price);
await write(owner, "setPublicMintActive", [true]);
assert.equal(await read("summoningStarted"), true);
assert.equal(await read("publicMintActive"), true);

await expectRevert("config after first opening", {
  account: accounts[0],
  functionName: "configureMint",
  args: [price, 2n, 4n],
});
await expectRevert("zero quantity", {
  account: accounts[1],
  functionName: "mint",
  args: [0n],
  value: 0n,
});
await expectRevert("per transaction limit", {
  account: accounts[1],
  functionName: "mint",
  args: [4n],
  value: price * 4n,
});
await expectRevert("underpayment", {
  account: accounts[1],
  functionName: "mint",
  args: [1n],
  value: price - 1n,
});
await expectRevert("overpayment", {
  account: accounts[1],
  functionName: "mint",
  args: [1n],
  value: price + 1n,
});

await write(user1, "mint", [3n], price * 3n);
assert.equal(await read("totalSupply"), 3n);
assert.equal(await read("mintedByWallet", [accounts[1]]), 3n);
assert.equal(await read("ownerOf", [1n]), accounts[1]);
assert.equal(await read("ownerOf", [2n]), accounts[1]);
assert.equal(await read("ownerOf", [3n]), accounts[1]);
assert.equal(await read("tokenURI", [1n]), sealedURI);

await write(user1, "transferFrom", [accounts[1], accounts[2], 1n]);
assert.equal(await read("ownerOf", [1n]), accounts[2]);
assert.equal(await read("mintedByWallet", [accounts[1]]), 3n);

await expectRevert("lifetime wallet cap survives transfer", {
  account: accounts[1],
  functionName: "mint",
  args: [2n],
  value: price * 2n,
});
await write(user1, "mint", [1n], price);
assert.equal(await read("totalSupply"), 4n);
assert.equal(await read("mintedByWallet", [accounts[1]]), 4n);

const provenance = keccak256(toHex("NULL RITE test provenance"));
await expectRevert("provenance before Assembly complete", {
  account: accounts[0],
  functionName: "commitProvenance",
  args: [provenance],
});

await write(owner, "setPublicMintActive", [false]);
await expectRevert("mint while paused", {
  account: accounts[2],
  functionName: "mint",
  args: [1n],
  value: price,
});
assert.equal(await read("summoningStarted"), true);
await write(owner, "setPublicMintActive", [true]);
await write(user2, "mint", [1n], price);

assert.equal(await read("totalSupply"), 5n);
assert.equal(await read("publicMintActive"), false);
await expectRevert("mint after sold out", {
  account: accounts[2],
  functionName: "mint",
  args: [1n],
  value: price,
});
await expectRevert("reopen sold-out Assembly", {
  account: accounts[0],
  functionName: "setPublicMintActive",
  args: [true],
});

await expectRevert("zero provenance", {
  account: accounts[0],
  functionName: "commitProvenance",
  args: [`0x${"00".repeat(32)}`],
});
await write(owner, "commitProvenance", [provenance]);
assert.equal(await read("provenanceHash"), provenance);
await expectRevert("provenance is one-time", {
  account: accounts[0],
  functionName: "commitProvenance",
  args: [keccak256(toHex("different"))],
});
await expectRevert("empty reveal URI", {
  account: accounts[0],
  functionName: "reveal",
  args: [""],
});

const ownerBeforeReveal = await read("ownerOf", [1n]);
await write(owner, "reveal", [revealedBaseURI]);
assert.equal(await read("revealed"), true);
assert.equal(await read("ownerOf", [1n]), ownerBeforeReveal);
assert.equal(await read("tokenURI", [1n]), `${revealedBaseURI}1.json`);
assert.equal(await read("tokenURI", [5n]), `${revealedBaseURI}5.json`);
await expectRevert("second reveal", {
  account: accounts[0],
  functionName: "reveal",
  args: [revealedBaseURI],
});

let directPaymentRejected = false;
try {
  await user1.sendTransaction({ to: address, value: 1n });
} catch {
  directPaymentRejected = true;
}
assert.equal(directPaymentRejected, true, "direct ETH transfer should be rejected");

const contractBalance = await publicClient.getBalance({ address });
assert.equal(contractBalance, price * 5n);
const recipientBefore = await publicClient.getBalance({ address: accounts[3] });
await write(owner, "withdraw", [accounts[3]]);
const recipientAfter = await publicClient.getBalance({ address: accounts[3] });
assert.equal(await publicClient.getBalance({ address }), 0n);
assert.equal(recipientAfter - recipientBefore, contractBalance);

await write(owner, "transferOwnership", [accounts[3]]);
assert.equal(await read("owner"), accounts[0]);
assert.equal(await read("pendingOwner"), accounts[3]);
await write(recipient, "acceptOwnership");
assert.equal(await read("owner"), accounts[3]);

console.log("VesselNFT RC tests passed: lifecycle, limits, sold-out, reveal, withdrawal, ownership.");
await provider.disconnect();
