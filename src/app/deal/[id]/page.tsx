import { Shell } from "@/components/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Mock data for the specific deal
  const deal = {
    id,
    status: "FUNDED_MXNB",
    amount_mxnb: 350000.00,
    vehicle: {
      year: 2021,
      make: "Honda",
      model: "Civic",
      vin: "3HGEJ123456789012"
    },
    buyer: {
      kyc_status: true,
      wallet: "0x1234...5678"
    },
    seller: {
      kyc_status: true,
      wallet: "0x8765...4321"
    },
    docs_verified: true,
    inspection_passed: false
  };

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Details</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">ID: {deal.id}</p>
        </div>
        <Badge variant="default" className="text-lg py-1 px-4">{deal.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financials</CardTitle>
            <CardDescription>Escrow vault status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Amount Held</span>
              <span className="text-2xl font-bold">${deal.amount_mxnb.toLocaleString('es-MX')} MXNB</span>
            </div>
            <div className="flex space-x-4 pt-2">
              <Button className="w-full" disabled={deal.status !== "CONTRACT_SIGNED"}>Release Funds</Button>
              <Button variant="outline" className="w-full" disabled={deal.status === "RELEASED"}>Refund</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Make & Model</span>
              <span className="font-medium">{deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIN</span>
              <span className="font-mono">{deal.vehicle.vin}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parties & Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Buyer</p>
                <p className="text-muted-foreground font-mono text-xs">{deal.buyer.wallet}</p>
              </div>
              <Badge variant={deal.buyer.kyc_status ? "default" : "secondary"}>
                {deal.buyer.kyc_status ? "KYC Verified" : "KYC Pending"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Seller</p>
                <p className="text-muted-foreground font-mono text-xs">{deal.seller.wallet}</p>
              </div>
              <Badge variant={deal.seller.kyc_status ? "default" : "secondary"}>
                {deal.seller.kyc_status ? "KYC Verified" : "KYC Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Documents Verified</span>
              <span>{deal.docs_verified ? "✅" : "⏳"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Physical Inspection</span>
              <span>{deal.inspection_passed ? "✅" : "⏳"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Funds Deposited</span>
              <span>✅</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
