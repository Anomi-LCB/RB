import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    let cookieStore;
    try {
        cookieStore = await cookies();
    } catch (e) {
        console.error("Failed to access cookies in createClient:", e);
        // Fallback to minimal mock if cookies are inaccessible
        cookieStore = { getAll: () => [], set: () => { } };
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    try {
                        return cookieStore.getAll();
                    } catch (e) {
                        console.error("Error in cookies.getAll():", e);
                        return [];
                    }
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            try {
                                // @ts-ignore - Handle possible differences in cookieStore.set
                                cookieStore.set(name, value, options);
                            } catch (e) {
                                // Ignore individual cookie set errors
                            }
                        });
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}
