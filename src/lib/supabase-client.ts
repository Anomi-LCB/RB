import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Fail-safe: malformed tokens can cause 'atob' parsing errors in the browser.
    // If the browser environment detects corrupted session data, we clear it.
    if (typeof window !== 'undefined') {
        try {
            const storageKeys = Object.keys(localStorage);
            storageKeys.forEach(key => {
                // Supabase keys usually start with 'sb-'
                if (key.startsWith('sb-')) {
                    const sessionData = localStorage.getItem(key);
                    if (sessionData) {
                        try {
                            const parsed = JSON.parse(sessionData);
                            // Valid Supabase session should have an access_token
                            if (parsed && typeof parsed === 'object' && parsed.access_token) {
                                const parts = parsed.access_token.split('.');
                                if (parts.length !== 3) throw new Error("Invalid JWT format");

                                // Base64Url to Base64 conversion
                                let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                                // Add padding if necessary
                                const pad = payload.length % 4;
                                if (pad) {
                                    if (pad === 1) throw new Error("Invalid Length");
                                    payload += new Array(5 - pad).join('=');
                                }

                                // Try decoding
                                atob(payload);
                            }
                        } catch (err) {
                            console.warn(`[Supabase-Client] Detected corrupted token in ${key}, removing to prevent crash. Error:`, err);
                            localStorage.removeItem(key);
                        }
                    }
                }
            });
        } catch (e) {
            console.error("[Supabase-Client] Error checking/clearing storage:", e);
            // Extreme fallback: if we can't even iterate items safely, we might need to clear everything, 
            // but that's too destructive for now. safer to just let it fail or clear known prefixes.
        }
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
