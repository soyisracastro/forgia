import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_OTP_TYPES = ['recovery', 'signup', 'invite', 'magiclink', 'email'] as const;
type OtpType = (typeof VALID_OTP_TYPES)[number];

function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/app')) return '/app';
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const safePath = getSafeRedirectPath(searchParams.get('next'));

  // Token hash flow: works cross-device (e.g. reset initiated on desktop, link clicked on mobile)
  if (token_hash && type && VALID_OTP_TYPES.includes(type as OtpType)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as OtpType,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // PKCE code flow: same-device auth
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
