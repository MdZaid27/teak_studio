/**
 * KILN STUDIO — Programmatic Supabase / PostgreSQL Seeder
 * Run via: npm run db:seed
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import dns from "dns";
import { allProducts } from "../data/products";

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


// Attempt to load .env.local or .env manually if process.env is empty
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        const value = vals.join("=").replace(/(^['"]|['"]$)/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function seed() {
  console.log("==================================================");
  console.log("  KILN STUDIO — PostgreSQL / Supabase Seeder");
  console.log("==================================================");

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project-id")) {
    console.error(
      "❌ Error: Missing valid Supabase environment variables in .env.local.\n" +
        "Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
    console.log(
      "👉 Alternatively, copy and execute 'supabase/schema.sql' and 'supabase/seed.sql' in the Supabase SQL Editor."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("1. Seeding Categories...");
  const categories = [
    { id: "dining", name: "Dining" },
    { id: "living", name: "Living" },
    { id: "storage", name: "Storage" },
    { id: "bedroom", name: "Bedroom" },
  ];
  const { error: catError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "id" });
  if (catError) throw new Error(`Category seed failed: ${catError.message}`);
  console.log(`   ✓ ${categories.length} categories upserted.`);

  console.log("2. Seeding Timbers...");
  const timbers = [
    {
      id: "hunsur-teak",
      name: "Hunsur Teak",
      provenance: "Mysore / Karnataka",
      swatch_url: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
      description: "Golden amber tones with straight linear grain and high natural oils.",
    },
    {
      id: "indian-rosewood",
      name: "Indian Rosewood",
      provenance: "Malabar / Western Ghats",
      swatch_url: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
      description: "Dense burgundy-chocolate heartwood with natural dramatic swirl grain.",
    },
    {
      id: "assam-teak",
      name: "Assam Teak",
      provenance: "North-East Foothills",
      swatch_url: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
      description: "Muted olive-golden hues with calm, serene minimalist grain fiber.",
    },
  ];
  const { error: timberError } = await supabase
    .from("timbers")
    .upsert(timbers, { onConflict: "id" });
  if (timberError) throw new Error(`Timber seed failed: ${timberError.message}`);
  console.log(`   ✓ ${timbers.length} timbers upserted.`);

  console.log("3. Seeding Products...");
  const products = allProducts.map((p) => {
    let timberId = "hunsur-teak";
    if (p.timber.toLowerCase().includes("rosewood")) timberId = "indian-rosewood";
    if (p.timber.toLowerCase().includes("assam")) timberId = "assam-teak";

    return {
      id: p.id,
      name: p.name,
      category_id: p.category.toLowerCase(),
      primary_timber_id: timberId,
      price: p.price,
      primary_image: p.image,
      dimensions: p.dimensions,
      description: p.description,
      is_popular: p.isPopular || false,
      link: p.link,
      tagline: p.tagline || null,
      lead_time: p.leadTime || null,
      features: p.features || [],
      specs: p.specs || [],
    };
  });

  const { error: prodError } = await supabase
    .from("products")
    .upsert(products, { onConflict: "id" });
  if (prodError) throw new Error(`Product seed failed: ${prodError.message}`);
  console.log(`   ✓ ${products.length} products upserted.`);

  console.log("4. Seeding Gallery Images & Timber Options...");
  for (const p of allProducts) {
    if (p.gallery && p.gallery.length > 0) {
      await supabase.from("product_images").delete().eq("product_id", p.id);
      const images = p.gallery.map((g, idx) => ({
        product_id: p.id,
        src: g.src,
        alt: g.alt,
        title: g.title,
        display_order: idx,
      }));
      await supabase.from("product_images").insert(images);
    }

    if (p.timbers && p.timbers.length > 0) {
      await supabase.from("product_timber_options").delete().eq("product_id", p.id);
      const options = p.timbers.map((t) => {
        let tid = "hunsur-teak";
        if (t.name.toLowerCase().includes("rosewood") || t.id.includes("rosewood")) tid = "indian-rosewood";
        if (t.name.toLowerCase().includes("assam") || t.id.includes("assam")) tid = "assam-teak";
        return {
          product_id: p.id,
          timber_id: tid,
          price: t.price,
          description: t.desc,
        };
      });
      await supabase.from("product_timber_options").insert(options);
    }
  }

  console.log("   ✓ Product images and timber options populated.");
  console.log("\n🎉 Database seeded successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
