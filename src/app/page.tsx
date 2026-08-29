import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data based on escrow_deals schema
const mockDeals = [
  {
    id: "a1b2c3d4-1234-5678-90ab-cdef12345678",
    vehicle_make: "Honda",
    vehicle_model: "Civic",
    vehicle_year: 2021,
    amount_mxnb: 350000.00,
    status: "FUNDED_MXNB",
    role: "BUYER",
  },
  {
    id: "e5f6g7h8-8765-4321-ba09-87654321fedc",
    vehicle_make: "Toyota",
    vehicle_model: "Corolla",
    vehicle_year: 2020,
    amount_mxnb: 280000.00,
    status: "KYC_PENDING",
    role: "SELLER",
  },
];

export default function Home() {
  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Escrow Deals</h1>
          <p className="text-muted-foreground mt-2">Manage your vehicle buying and selling transactions securely.</p>
        </div>
        <Button>Create Offer</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockDeals.map((deal) => (
          <Card key={deal.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{deal.vehicle_year} {deal.vehicle_make} {deal.vehicle_model}</CardTitle>
                <Badge variant={deal.status === "FUNDED_MXNB" ? "default" : "secondary"}>
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
