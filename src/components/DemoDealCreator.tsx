"use client";

import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import EscrowTestABI from "../artifacts/contracts/EscrowTest.sol/EscrowTest.json";
import { useDeals } from "@/hooks/useDeals";
import { useEffect } from "react";

export function DemoDealCreator() {
  const { addDeal } = useDeals();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleDemo = () => {
    const dummyToken = "0x0000000000000000000000000000000000000001";
    const dummySeller = "0x0000000000000000000000000000000000000002";
    const dummyIntermediary = "0x0000000000000000000000000000000000000003";

    // Deterministic ID logic based on a new simulated UUID
    const newId = crypto.randomUUID();
    const transactionId = BigInt("0x" + newId.replace(/-/g, "").slice(0, 16));
    const contractAddress = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
    const amount = 150000;

    writeContract({
      address: contractAddress,
      abi: EscrowTestABI.abi,
      functionName: "deposit",
      args: [BigInt(amount), dummyToken, transactionId, dummySeller, dummyIntermediary],
    });

    addDeal({
      id: newId,
      vehicle_make: "Toyota",
      vehicle_model: "Corolla",
      vehicle_year: 2023,
      vehicle_vin: "2T1BR123456789012",
      amount_mxnb: amount,
      status: "CONTRACT_SIGNED",
      role: "SELLER",
      docs_verified: false,
      inspection_passed: false,
      buyer: { kyc_status: false, wallet: "0x..." },
      seller: { kyc_status: true, wallet: dummySeller },
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="secondary"
        onClick={handleDemo}
        disabled={isPending || isConfirming}
      >
        {isPending ? "Confirming..." : isConfirming ? "Waiting for receipt..." : "Demo: Auto-Deposit"}
      </Button>
      {isConfirmed && <span className="text-sm text-green-500">Done!</span>}
    </div>
  );
}
