-- Create custom types for transaction status
CREATE TYPE escrow_status AS ENUM (
    'PENDING',
    'FUNDED',
    'AWAITING_INSPECTION',
    'RELEASED',
    'COMPLETED',
    'REFUNDED',
    'CANCELLED'
);

-- Create the escrow_transactions table
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Transaction State
    status escrow_status NOT NULL DEFAULT 'PENDING',

    -- Wallets
    buyer_address text NOT NULL,
    seller_address text NOT NULL,
    intermediary_address text,

    -- Financial Details
    amount numeric NOT NULL,
    token_address text NOT NULL,
    chain_id integer NOT NULL,
    smart_contract_transaction_id text,

    -- Vehicle Info (Obligatorio)
    vehicle_vin text NOT NULL,
    vehicle_repuve text NOT NULL,
    vehicle_year integer NOT NULL,
    vehicle_brand text NOT NULL,
    vehicle_model text NOT NULL,
    vehicle_line text NOT NULL,
    vehicle_version text NOT NULL,
    vehicle_equipment text NOT NULL,
    vehicle_key text NOT NULL, -- clave vehicular
    vehicle_engine_number text NOT NULL,
    vehicle_color_exterior text NOT NULL,
    vehicle_color_interior text NOT NULL,
    vehicle_pedimento_number text, -- si aplica

    -- Documentation (JSON or URLs to storage)
    doc_factura_origen jsonb, -- factura origen con secuencia de endosos
    doc_refacturas jsonb,
    doc_recibos_tenencias jsonb, -- 5 años al menos
    doc_verificacion_ambiental text, -- si aplica
    -- identificaciones oficiales de todos los dueños
    doc_identificaciones jsonb,
    doc_tarjeta_circulacion text, -- o baja de placas
    doc_altas_bajas_placas jsonb, -- si aplica
    doc_libro_mantenimiento text, -- o formato lleno
    doc_fotos_geolocalizadas jsonb,
    doc_reporte_evaluacion text,
    doc_declinacion_revision text
);

-- Enable Row Level Security (RLS)
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Disable public access by default (implicit when RLS is enabled, but good to be explicit)
-- Only roles with explicitly granted policies can access the table.

-- Policy: Comprador y Vendedor solo pueden hacer SELECT de sus contratos
CREATE POLICY "Users can view their own transactions" ON escrow_transactions
FOR SELECT
USING (
        lower(buyer_address) = lower(auth.jwt()->>'wallet_address') OR
        lower(seller_address) = lower(auth.jwt()->>'wallet_address')
);

-- Policy: Intermediario tiene permisos de UPDATE sobre el estado
-- Assume intermediary has a specific claim in their JWT, e.g., 'role': 'intermediary'
CREATE POLICY "Intermediary can update transaction state" ON escrow_transactions
FOR UPDATE
USING (
    auth.jwt() ->> 'role' = 'intermediary'
)
WITH CHECK (
    auth.jwt() ->> 'role' = 'intermediary'
);

-- Policy: Intermediary can view all transactions
CREATE POLICY "Intermediary can view all transactions" ON escrow_transactions
FOR SELECT
USING (
    auth.jwt() ->> 'role' = 'intermediary'
);
