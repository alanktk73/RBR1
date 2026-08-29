import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data representing all deals for the admin
const adminMockDeals = [
  {
    id: "a1b2c3d4-1234-5678-90ab-cdef12345678",
    vehicle_vin: "3HGEJ123456789012",
    buyer_id: "usr_999",
    seller_id: "usr_888",
    amount_mxnb: 350000.00,
    status: "INSPECTION_PENDING",
    created_at: "2024-05-10T14:48:00Z"
  },
  {
    id: "e5f6g7h8-8765-4321-ba09-87654321fedc",
    vehicle_vin: "2T1BR123456789012",
    buyer_id: "usr_777",
    seller_id: "usr_666",
    amount_mxnb: 280000.00,
    status: "DOCS_PENDING",
    created_at: "2024-05-11T09:30:00Z"
  },
  {
    id: "f9e8d7c6-5432-1098-7654-321098765432",
    vehicle_vin: "1G1AL123456789012",
    buyer_id: "usr_555",
    seller_id: "usr_444",
    amount_mxnb: 150000.00,
    status: "CONTRACT_SIGNED",
    created_at: "2024-05-12T11:15:00Z"
  },
];

export default function AdminDashboard() {
  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and oversee all platform escrow transactions.</p>
        </div>
      </div>

      <div className="rounded-md border border-border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deal ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount (MXNB)</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {adminMockDeals.map((deal) => (
                <tr key={deal.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-mono text-xs">{deal.id.split('-')[0]}...</td>
                  <td className="p-4 align-middle">${deal.amount_mxnb.toLocaleString('es-MX')}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={
                      deal.status === "CONTRACT_SIGNED" ? "default" :
                      deal.status.includes("PENDING") ? "secondary" : "outline"
                    }>
                      {deal.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 align-middle text-right space-x-2">
                    {deal.status === "DOCS_PENDING" && (
                      <Button size="sm" variant="outline">Verify Docs</Button>
                    )}
                    {deal.status === "CONTRACT_SIGNED" && (
                      <Button size="sm">Approve Release</Button>
                    )}
                    <Link href={`/deal/${deal.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {adminMockDeals.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No active deals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
