
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env from parent .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Variables", { supabaseUrl, supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDate() {
    const today = new Date();
    const kstDate = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const mmdd = todayStr.slice(5); // MM-DD

    console.log(`Checking for date: ${todayStr} (MM-DD: ${mmdd})`);

    const { data, error } = await supabase
        .from("reading_plan")
        .select("*");

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log(`Total Plans: ${data.length}`);

    const exact = data.find(p => p.date === todayStr);
    console.log(`Exact Match (${todayStr}):`, exact ? "FOUND" : "MISSING");

    const fuzzy = data.find(p => p.date && p.date.endsWith(mmdd));
    console.log(`Fuzzy Match (${mmdd}):`, fuzzy ? `FOUND (Date: ${fuzzy.date})` : "MISSING");
}

checkDate();
