"use client";

import { useState, useEffect } from "react";

export type Deal = {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin: string;
  amount_mxnb: number;
  status: string;
  role: string;
  docs_verified: boolean;
  inspection_passed: boolean;
  buyer: { kyc_status: boolean; wallet: string };
  seller: { kyc_status: boolean; wallet: string };
};

const initialMockDeals: Deal[] = [
  {
    id: "a1b2c3d4-1234-5678-90ab-cdef12345678",
    vehicle_make: "Honda",
    vehicle_model: "Civic",
    vehicle_year: 2021,
    vehicle_vin: "3HGEJ123456789012",
    amount_mxnb: 350000.00,
    status: "CONTRACT_SIGNED",
    role: "BUYER",
    docs_verified: true,
    inspection_passed: true,
    buyer: { kyc_status: true, wallet: "0x1234...5678" },
    seller: { kyc_status: true, wallet: "0x8765...4321" },
  }
];

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("escrow_deals");
    if (stored) {
      setDeals(JSON.parse(stored));
    } else {
      setDeals(initialMockDeals);
      localStorage.setItem("escrow_deals", JSON.stringify(initialMockDeals));
    }
    setIsLoaded(true);
  }, []);

  const addDeal = (deal: Deal) => {
    const updated = [deal, ...deals];
    setDeals(updated);
    localStorage.setItem("escrow_deals", JSON.stringify(updated));
  };

  const updateDealStatus = (id: string, newStatus: string) => {
    const updated = deals.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setDeals(updated);
    localStorage.setItem("escrow_deals", JSON.stringify(updated));
  };

  const getDeal = (id: string) => deals.find(d => d.id === id);

  return { deals, addDeal, updateDealStatus, getDeal, isLoaded };
}
