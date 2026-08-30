"use client";

import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import EscrowTestABI from "@/artifacts/contracts/EscrowTest.sol/EscrowTest.json";
import { useDeals } from "@/hooks/useDeals";

export default function CreateOfferPage() {
  const { addDeal } = useDeals();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amount = formData.get("amount") as string;

    // Dummy values for test
    const dummyToken = "0x0000000000000000000000000000000000000001";
    const dummySeller = "0x0000000000000000000000000000000000000002";
    const dummyIntermediary = "0x0000000000000000000000000000000000000003";

    // Deterministic ID logic based on a new simulated UUID
    const newId = crypto.randomUUID();
    const transactionId = BigInt("0x" + newId.replace(/-/g, "").slice(0, 16));
    const contractAddress = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

    writeContract({
      address: contractAddress,
      abi: EscrowTestABI.abi,
      functionName: "deposit",
      args: [BigInt(amount), dummyToken, transactionId, dummySeller, dummyIntermediary],
    });

    addDeal({
      id: newId,
      vehicle_make: formData.get("make") as string,
      vehicle_model: formData.get("model") as string,
      vehicle_year: parseInt(formData.get("year") as string),
      vehicle_vin: formData.get("vin") as string,
      amount_mxnb: parseFloat(amount),
      status: "CONTRACT_SIGNED",
      role: "BUYER",
      docs_verified: false,
      inspection_passed: false,
      buyer: { kyc_status: true, wallet: "0x..." },
      seller: { kyc_status: false, wallet: dummySeller },
    });
  };

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Oferta Escrow</h1>
          <p className="text-muted-foreground mt-2">Inicializa una nueva transacción segura para un vehículo.</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Vehículo y Transacción</CardTitle>
          <CardDescription>Ingresa los detalles del vehículo y el monto del escrow.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Marca</Label>
                <Input id="make" name="make" placeholder="ej. Honda" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" placeholder="ej. Civic" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" name="year" type="number" placeholder="2021" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Número de Serie)</Label>
                <Input id="vin" name="vin" placeholder="VIN de 17 caracteres" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto (MXNB)</Label>
              <Input id="amount" name="amount" type="number" placeholder="350000" required />
            </div>

            <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
              {isPending ? "Confirmando..." : isConfirming ? "Esperando recibo..." : "Crear Oferta"}
            </Button>

            {isConfirmed && <div className="text-green-500 mt-4 text-center">¡Transacción confirmada!</div>}
          </form>
        </CardContent>
      </Card>
    </Shell>
  );
}
