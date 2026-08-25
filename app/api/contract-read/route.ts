import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, type Address } from "viem";
import { RH_TESTNET_CHAIN } from "@/lib/chain";

const CONTRACT_ADDRESS = "0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500" as Address;

const CONTRACT_ABI = parseAbi([
  "function publicMintActive() view returns (bool)",
  "function maxMintPerWallet() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
]);

const publicClient = createPublicClient({
  chain: RH_TESTNET_CHAIN,
  transport: http(),
});

type FunctionName =
  | "publicMintActive"
  | "maxMintPerWallet"
  | "totalSupply"
  | "mintPrice"
  | "balanceOf";

interface ContractCall {
  functionName: FunctionName;
  args?: readonly unknown[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calls } = body;

    if (!calls || !Array.isArray(calls)) {
      return NextResponse.json(
        { success: false, error: "Invalid calls array" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      calls.map(async (call: ContractCall) => {
        const { functionName, args = [] } = call;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName,
          args: args as any,
        });
        return result;
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Contract read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read contract" },
      { status: 500 }
    );
  }
}