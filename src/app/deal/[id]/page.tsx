"use client";

import { use } from "react";
import { Shell } from "@/components/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealActions } from "@/components/DealActions";
import { useDeals } from "@/hooks/useDeals";

export default function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getDeal, isLoaded } = useDeals();
  const deal = getDeal(id);

  if (!isLoaded) return <Shell><div>Loading...</div></Shell>;
  if (!deal) return <Shell><div>Deal not found.</div></Shell>;

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
            <DealActions deal={deal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Make & Model</span>
              <span className="font-medium">{deal.vehicle_year} {deal.vehicle_make} {deal.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIN</span>
              <span className="font-mono">{deal.vehicle_vin}</span>
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
