import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    console.log("--- Auth Callback Started ---");
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    console.log("Code:", code ? "exists" : "missing");
    console.log("Origin:", origin);

    if (code) {
        try {
            const cookieStore = await cookies()
            console.log("Cookies accessed");

            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll()
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        },
                    },
                }
            )

            console.log("Exchanging code...");
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error) {
                console.log("Success! Redirecting to /");
                return NextResponse.redirect(`${origin}${next}`)
            }

            console.error("Supabase Error:", error.message);
        } catch (err: any) {
            console.error("Detailed Server Error:", err.message, err.stack);
        }
    }

    console.log("Redirecting to login with error");
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
