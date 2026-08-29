-- ENUMS
CREATE TYPE deal_status AS ENUM (
  'DRAFT', 'KYC_PENDING', 'DOCS_PENDING', 'INSPECTION_PENDING',
  'FUNDED_MXNB', 'CONTRACT_SIGNED', 'RELEASED', 'CANCELLED_PENALIZED'
);
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'INTERMEDIARY_ADMIN', 'INSPECTOR');
CREATE TYPE dictamen_status AS ENUM ('OK_NO_ALERTS', 'BUY_UNDER_CLIENT_RESPONSIBILITY', 'REJECTED');

-- USERS & PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  curp VARCHAR(18) UNIQUE,
  rfc VARCHAR(13) UNIQUE,
  kyc_status BOOLEAN DEFAULT FALSE,
  kyc_provider_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin VARCHAR(17) UNIQUE NOT NULL,
  repuve_status JSONB NOT NULL DEFAULT '{"valid": false}',
  year INT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT NOT NULL,
  engine_number TEXT NOT NULL,
  exterior_color TEXT NOT NULL,
  interior_color TEXT NOT NULL,
  import_pedimento TEXT,
  current_plate_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEAL ESCROW ENGINE
CREATE TABLE escrow_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  vehicle_id UUID REFERENCES vehicles(id),
  amount_mxnb NUMERIC(15,2) NOT NULL,
  funding_source_type TEXT NOT NULL,
  financing_institution_ref TEXT,
  status deal_status DEFAULT 'DRAFT',
  buyer_waiver_signed BOOLEAN DEFAULT FALSE,
  waiver_pdf_url TEXT,
  dictamen_result dictamen_status,
  dictamen_confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VEHICLE DOCUMENTS (E2E Encrypted Vault)
CREATE TABLE vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- INSPECTIONS & CHECKLIST
CREATE TABLE vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES escrow_deals(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id),
  obd2_codes JSONB DEFAULT '[]'::jsonb,
  paint_thickness_microns JSONB NOT NULL,
  checklist_data JSONB NOT NULL,
  digital_signature_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- PREVENT PUBLIC ACCESS (by default when RLS enabled, but adding explicit deny if needed, not supported by PG directly, just no public policies)

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Restrict update to non-sensitive columns
CREATE POLICY "Users can update their own non-sensitive profile data" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- By default Supabase doesn't support column-level RLS easily for updates,
    -- but we can restrict role and kyc changes via a trigger or simply omitting them in client updates.
    -- Better approach in Postgres: create a view or trigger.
    -- However, we can use a basic workaround or a trigger here if we want strict enforcement.
    -- For now, let's just create a trigger to prevent modifying role and kyc_status
  );

CREATE OR REPLACE FUNCTION prevent_sensitive_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR
     NEW.kyc_status IS DISTINCT FROM OLD.kyc_status OR
     NEW.kyc_provider_ref IS DISTINCT FROM OLD.kyc_provider_ref THEN

    -- Allow bypass for Service Role (admin)
    IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Cannot modify sensitive profile fields (role, kyc_status, kyc_provider_ref)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_profile_update();

-- VEHICLES POLICIES
CREATE POLICY "Vehicles are viewable by parties in a deal" ON vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deals
      WHERE escrow_deals.vehicle_id = vehicles.id
      AND (escrow_deals.buyer_id = auth.uid() OR escrow_deals.seller_id = auth.uid())
    )
  );

-- ESCROW_DEALS POLICIES
CREATE POLICY "Buyers and Sellers can view their assigned deals" ON escrow_deals
  FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers and Sellers can update their assigned deals" ON escrow_deals
  FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Intermediary Admin can view and update all deals" ON escrow_deals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'INTERMEDIARY_ADMIN'
    )
  );

-- VEHICLE_DOCUMENTS POLICIES
CREATE POLICY "Parties can view documents of their deals" ON vehicle_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deals
      WHERE escrow_deals.vehicle_id = vehicle_documents.vehicle_id
      AND (escrow_deals.buyer_id = auth.uid() OR escrow_deals.seller_id = auth.uid())
    )
  );

-- VEHICLE_INSPECTIONS POLICIES
CREATE POLICY "Buyers and Sellers have read-only access to inspections" ON vehicle_inspections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deals
      WHERE escrow_deals.id = vehicle_inspections.deal_id
      AND (escrow_deals.buyer_id = auth.uid() OR escrow_deals.seller_id = auth.uid())
    )
  );

CREATE POLICY "Inspector and Admin can write to inspections" ON vehicle_inspections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('INSPECTOR', 'INTERMEDIARY_ADMIN')
    )
  );
