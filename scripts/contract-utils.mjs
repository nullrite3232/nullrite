import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const ROOT = process.cwd();

function readSource(relativePath) {
  return { content: fs.readFileSync(path.join(ROOT, relativePath), "utf8") };
}

function findImports(importPath) {
  const candidates = [
    path.join(ROOT, importPath),
    path.join(ROOT, "node_modules", importPath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { contents: fs.readFileSync(candidate, "utf8") };
    }
  }

  return { error: `Import not found: ${importPath}` };
}

export function compileContracts({ includeHarness = false } = {}) {
  const sources = {
    "contracts/VesselNFT.sol": readSource("contracts/VesselNFT.sol"),
  };

  if (includeHarness) {
    sources["contracts/test/VesselNFTTestHarness.sol"] = readSource(
      "contracts/test/VesselNFTTestHarness.sol"
    );
  }

  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const errors = (output.errors ?? []).filter((item) => item.severity === "error");
  if (errors.length) {
    throw new Error(errors.map((item) => item.formattedMessage).join("\n"));
  }

  return output.contracts;
}

export function artifact(contracts, sourceName, contractName) {
  const compiled = contracts?.[sourceName]?.[contractName];
  if (!compiled) throw new Error(`Missing compiled contract ${sourceName}:${contractName}`);

  return {
    abi: compiled.abi,
    bytecode: `0x${compiled.evm.bytecode.object}`,
    deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
  };
}
