"use client";

import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DemoDealCreator } from "@/components/DemoDealCreator";
import { useDeals } from "@/hooks/useDeals";

export default function Home() {
  const { deals, isLoaded } = useDeals();

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Escrow Deals</h1>
          <p className="text-muted-foreground mt-2">Manage your vehicle buying and selling transactions securely.</p>
        </div>
        <div className="flex space-x-4 items-center">
          <DemoDealCreator />
          <Link href="/create">
            <Button>Create Offer</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isLoaded ? (
          <div>Loading deals...</div>
        ) : deals.map((deal) => (
          <Card key={deal.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{deal.vehicle_year} {deal.vehicle_make} {deal.vehicle_model}</CardTitle>
                <Badge variant={deal.status === "CONTRACT_SIGNED" ? "default" : "secondary"}>
                  {deal.status.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription>Role: {deal.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="text-2xl font-bold mb-6">
                ${deal.amount_mxnb.toLocaleString('es-MX')} MXNB
              </div>
              <Link href={`/deal/${deal.id}`} className="w-full">
                <Button variant="outline" className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
