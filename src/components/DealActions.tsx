"use client";

import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import EscrowTestABI from "../artifacts/contracts/EscrowTest.sol/EscrowTest.json";
import { useDeals, type Deal } from "@/hooks/useDeals";

export function DealActions({ deal }: { deal: Deal }) {
  const { updateDealStatus } = useDeals();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const contractAddress = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const transactionId = BigInt("0x" + deal.id.replace(/-/g, "").slice(0, 16));

  const handleRelease = () => {
    writeContract({
      address: contractAddress,
      abi: EscrowTestABI.abi,
      functionName: "release",
      args: [transactionId],
    });
    updateDealStatus(deal.id, "RELEASED");
  };

  const handleRefund = () => {
    writeContract({
      address: contractAddress,
      abi: EscrowTestABI.abi,
      functionName: "refund",
      args: [transactionId],
    });
    updateDealStatus(deal.id, "REFUNDED");
  };

  return (
    <div className="flex flex-col space-y-4 pt-2">
      <div className="flex space-x-4">
        <Button
          className="w-full"
          disabled={deal.status !== "CONTRACT_SIGNED" || isPending || isConfirming}
          onClick={handleRelease}
        >
          {isPending ? "Confirming..." : isConfirming ? "Waiting for receipt..." : "Release Funds"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={deal.status === "RELEASED" || isPending || isConfirming}
          onClick={handleRefund}
        >
          {isPending ? "Confirming..." : isConfirming ? "Waiting for receipt..." : "Refund"}
        </Button>
      </div>
      {isConfirmed && <div className="text-green-500 text-center text-sm">Action confirmed!</div>}
    </div>
  );
}
