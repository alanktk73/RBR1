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
          <h1 className="text-3xl font-bold tracking-tight">Tus Tratos Escrow</h1>
          <p className="text-muted-foreground mt-2">Gestiona tus transacciones de compra y venta de vehículos de forma segura.</p>
        </div>
        <div className="flex space-x-4 items-center">
          <DemoDealCreator />
          <Link href="/create">
            <Button>Crear Oferta</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isLoaded ? (
          <div>Cargando tratos...</div>
        ) : deals.map((deal) => (
          <Card key={deal.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{deal.vehicle_year} {deal.vehicle_make} {deal.vehicle_model}</CardTitle>
                <Badge variant={deal.status === "CONTRACT_SIGNED" ? "default" : "secondary"}>
                  {deal.status.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription>Rol: {deal.role === "BUYER" ? "COMPRADOR" : deal.role === "SELLER" ? "VENDEDOR" : deal.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="text-2xl font-bold mb-6">
                ${deal.amount_mxnb.toLocaleString('es-MX')} MXNB
              </div>
              <Link href={`/deal/${deal.id}`} className="w-full">
                <Button variant="outline" className="w-full">Ver Detalles</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
