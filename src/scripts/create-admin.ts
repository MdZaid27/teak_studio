import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import dns from "dns";

// Server-side safeguard: Prevent local ISP transparent DNS hijacking of *.supabase.co
if (dns && typeof dns.lookup === "function") {
  const originalLookup = dns.lookup.bind(dns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Load .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const adminEmail = process.argv[2] || "admin@teakhaus.in";
  const adminPassword = process.argv[3] || "Admin@TeakHaus2026!";

  console.log(`Configuring admin user: ${adminEmail}...`);

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  if (existing) {
    console.log(`User ${adminEmail} already exists (ID: ${existing.id}). Updating password...`);
    const updatePayload: Record<string, unknown> = {
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: "admin" },
      app_metadata: { ...existing.app_metadata, role: "admin" },
    };
    if (adminPassword.length >= 6) {
      updatePayload.password = adminPassword;
    }
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, updatePayload);
    if (updateError) {
      console.error("Failed to update user:", updateError.message);
      process.exit(1);
    }
    console.log(`✓ Admin user metadata updated successfully (role: admin)!`);
  } else {
    console.log(`Creating new admin user: ${adminEmail}...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });
    if (createError) {
      console.error("Failed to create admin:", createError.message);
      process.exit(1);
    }
    console.log(`✓ Admin user created successfully (ID: ${newUser.user?.id})`);
  }

  console.log(`Admin credentials ready:`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main();
