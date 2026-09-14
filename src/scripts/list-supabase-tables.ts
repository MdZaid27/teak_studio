import * as fs from "fs";
import * as path from "path";
import dns from "dns";

if (dns && typeof dns.lookup === "function") {
  const originalLookup = dns.lookup.bind(dns);
  dns.lookup = ((hostname: string, options: any, callback: any) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (typeof hostname === "string" && hostname.endsWith(".supabase.co")) {
      if (options && options.all) {
        return callback(null, [
          { address: "172.64.149.246", family: 4 },
          { address: "104.18.38.10", family: 4 },
        ]);
      }
      return callback(null, "172.64.149.246", 4);
    }
    return originalLookup(hostname, options, callback);
  }) as typeof dns.lookup;
}

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(url, key);

  const tablesToCheck = [
    "products",
    "categories",
    "timber_options",
    "orders",
    "order_items",
    "patron_profiles",
    "patron_addresses",
    "patron_wishlists",
    "studio_bookings",
    "bespoke_inquiries",
    "newsletter_subscribers",
    "swatch_orders"
  ];

  console.log("Checking tables in remote Supabase...");
  for (const t of tablesToCheck) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`❌ Table '${t}': ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table '${t}': EXISTS (sample count: ${data.length})`);
    }
  }
}

main().catch(console.error);
