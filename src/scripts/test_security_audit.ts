import { isUserAdmin } from "../lib/auth";
import { checkRateLimit } from "../lib/rate-limit";
import * as fs from "fs";
import * as path from "path";

async function runSecurityAuditTests() {
  console.log("================================================================");
  console.log("TEAK HAUS — AUTOMATED BACKEND & SECURITY VERIFICATION SUITE");
  console.log("================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Admin Authorization Boundary
  // ---------------------------------------------------------------------------
  console.log("--- 1. Admin Authorization Boundary Tests ---");

  // A. Broad email pattern bypass attempts (Must all be rejected)
  assert(!isUserAdmin({ email: "badminton@gmail.com" }), "Rejects email containing 'admin' (badminton@gmail.com)");
  assert(!isUserAdmin({ email: "admin@attacker.com" }), "Rejects arbitrary email starting with admin@ (admin@attacker.com)");
  assert(!isUserAdmin({ email: "sysadmin@fakecompany.com" }), "Rejects email with sysadmin pattern");
  assert(!isUserAdmin({ email: "administrator@gmail.com" }), "Rejects administrator@gmail.com");
  assert(!isUserAdmin(null), "Rejects null user");
  assert(!isUserAdmin({ email: null }), "Rejects null email");

  // B. User-editable user_metadata privilege escalation attempt (Must be rejected)
  assert(
    !isUserAdmin({
      email: "attacker@gmail.com",
      // @ts-expect-error Testing client-injected metadata
      user_metadata: { role: "admin" },
    }),
    "Rejects privilege escalation via client-editable user_metadata"
  );

  // C. Server-controlled app_metadata (Must be accepted)
  assert(
    isUserAdmin({
      email: "curator@teakhaus.in",
      app_metadata: { role: "admin" },
    }),
    "Accepts user with verified server-controlled app_metadata.role === 'admin'"
  );

  // D. Exact Server-Controlled Allowlist
  assert(
    isUserAdmin({
      email: "curator@teakhaus.in",
    }),
    "Accepts exact verified admin email (curator@teakhaus.in)"
  );
  assert(
    isUserAdmin({
      email: "admin@teakhaus.in",
    }),
    "Accepts exact verified admin email (admin@teakhaus.in)"
  );

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: In-Memory Sliding Window Rate Limiter
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Sliding Window Rate Limiter Tests ---");
  const testIp = `test-ip-${Date.now()}`;
  const testKey = `test-endpoint:${testIp}`;

  // Make 3 allowed calls
  const r1 = checkRateLimit(testKey, 3, 1000);
  assert(r1.success && r1.remaining === 2, "Rate limiter allows first request (remaining: 2)");

  const r2 = checkRateLimit(testKey, 3, 1000);
  assert(r2.success && r2.remaining === 1, "Rate limiter allows second request (remaining: 1)");

  const r3 = checkRateLimit(testKey, 3, 1000);
  assert(r3.success && r3.remaining === 0, "Rate limiter allows third request (remaining: 0)");

  // 4th call should be blocked
  const r4 = checkRateLimit(testKey, 3, 1000);
  assert(!r4.success && r4.remaining === 0, "Rate limiter blocks fourth request (returns 429 condition)");

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Database & Migration Artifacts
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Database RLS Migration Artifact Verification ---");
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20260915_production_security_rls.sql");
  assert(fs.existsSync(migrationPath), "Migration file 20260915_production_security_rls.sql exists");

  const migrationContent = fs.readFileSync(migrationPath, "utf-8");
  assert(
    migrationContent.includes("DROP POLICY IF EXISTS \"Public read orders\""),
    "Migration explicitly drops development-era public read orders policy"
  );
  assert(
    migrationContent.includes("DROP POLICY IF EXISTS \"Public read patron profiles\""),
    "Migration explicitly drops public read patron profiles policy"
  );
  assert(
    migrationContent.includes("DROP POLICY IF EXISTS \"Public read patron addresses\""),
    "Migration explicitly drops public read patron addresses policy"
  );
  assert(
    migrationContent.includes("DROP POLICY IF EXISTS \"Public read newsletter_subscribers\""),
    "Migration explicitly drops public read newsletter_subscribers policy"
  );
  assert(
    migrationContent.includes("(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"),
    "Migration enforces server-controlled app_metadata JWT role for administrative access"
  );
  assert(
    migrationContent.includes("(SELECT auth.uid())"),
    "Migration wraps auth.uid() in scalar subquery for query plan caching performance"
  );

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Next.js 16 Proxy Convention
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Next.js 16 Proxy Convention Verification ---");
  const proxyPath = path.resolve(process.cwd(), "src/proxy.ts");
  assert(fs.existsSync(proxyPath), "src/proxy.ts exists and conforms to Next.js 16 file convention");

  const proxyContent = fs.readFileSync(proxyPath, "utf-8");
  assert(proxyContent.includes("export async function proxy"), "src/proxy.ts exports named proxy function");
  assert(proxyContent.includes("matcher: [\"/admin/:path*\"]"), "src/proxy.ts configures matcher for /admin routes");
  assert(proxyContent.includes("isUserAdmin"), "src/proxy.ts validates user against hardened isUserAdmin");

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Error and Not Found Pages
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Custom Error and Not-Found Page Verification ---");
  const notFoundPath = path.resolve(process.cwd(), "src/app/not-found.tsx");
  const errorPath = path.resolve(process.cwd(), "src/app/error.tsx");
  assert(fs.existsSync(notFoundPath), "src/app/not-found.tsx exists with custom 404 UI");
  assert(fs.existsSync(errorPath), "src/app/error.tsx exists with custom client error boundary");

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: Route Consolidation
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. Duplicate Route Consolidation Verification ---");
  const studioBookingsRoute = fs.readFileSync(path.resolve(process.cwd(), "src/app/api/studio-bookings/route.ts"), "utf-8");
  assert(studioBookingsRoute.includes("from \"@/app/api/bookings/route\""), "studio-bookings route forwards to canonical bookings route");

  const commissionsRoute = fs.readFileSync(path.resolve(process.cwd(), "src/app/api/commissions/route.ts"), "utf-8");
  assert(commissionsRoute.includes("from \"@/app/api/bespoke/route\""), "commissions route forwards to canonical bespoke route");

  // ---------------------------------------------------------------------------
  // TEST GROUP 7: Environment Variable Hygiene
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. Environment Variable Template Hygiene ---");
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  assert(fs.existsSync(envExamplePath), ".env.example exists");

  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
  assert(!envExampleContent.includes("re_") || envExampleContent.includes("re_your_"), "No real Resend keys in .env.example");
  assert(envExampleContent.includes("NEXT_PUBLIC_SUPABASE_URL"), ".env.example documents NEXT_PUBLIC_SUPABASE_URL");
  assert(envExampleContent.includes("CLOUDFLARE_R2_ACCOUNT_ID"), ".env.example documents Cloudflare R2 variables");
  assert(envExampleContent.includes("RESEND_API_KEY"), ".env.example documents RESEND_API_KEY");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} security checks passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================\n");

  if (passed === total) {
    console.log("🌟 ALL VERIFIED SECURITY & BACKEND HARDENING AUDIT CHECKS PASSED!");
    process.exit(0);
  } else {
    console.error("❌ Some security checks failed.");
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});
