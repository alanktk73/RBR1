import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { userId, kycStatus, providerRef } = payload;

    if (!userId || typeof kycStatus !== 'boolean' || !providerRef) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    // Validate Webhook Signature/Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.KYC_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase admin client to bypass RLS for webhook updates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          // No-op for service role client
        },
      }
    });

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: kycStatus, kyc_provider_ref: providerRef })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile KYC:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('KYC webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
