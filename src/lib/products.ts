import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { allProducts as staticProducts } from "@/data/products";
import type { Product, ProductFilters } from "@/types/database";

interface DbProductJoined {
  id: string;
  name: string;
  category_id?: string;
  primary_timber_id?: string;
  price: number;
  primary_image: string;
  dimensions: string;
  description: string;
  is_popular?: boolean;
  link: string;
  tagline?: string | null;
  lead_time?: string | null;
  features?: string[];
  specs?: { label: string; value: string }[];
  categories?: { id: string; name: string } | null;
  timbers?: {
    id: string;
    name: string;
    provenance: string;
    swatch_url: string;
    description: string;
  } | null;
  product_images?: Array<{
    src: string;
    alt: string;
    title: string;
    display_order: number;
  }>;
  product_timber_options?: Array<{
    id: string;
    timber_id: string;
    price: number;
    description?: string | null;
    timbers?: {
      id: string;
      name: string;
      provenance: string;
      swatch_url: string;
      description: string;
    } | null;
  }>;
}

/**
 * Format raw Supabase database row with relational joins into hydrated Product domain model
 */
function mapDbProductToDomain(row: DbProductJoined): Product {
  const categoryName = row.categories?.name || row.category_id || "";
  const primaryTimberName = row.timbers?.name || row.primary_timber_id || "";

  // Map product images sorted by display_order
  const gallery = Array.isArray(row.product_images)
    ? [...row.product_images]
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img) => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        }))
    : undefined;

  // Map timber variation options
  const timberOptions = Array.isArray(row.product_timber_options)
    ? row.product_timber_options.map((opt) => ({
        id: opt.timbers?.id || opt.timber_id,
        name: opt.timbers?.name || opt.timber_id,
        provenance: opt.timbers?.provenance || "",
        swatch: opt.timbers?.swatch_url || "",
        price: opt.price,
        desc: opt.description || opt.timbers?.description || "",
      }))
    : undefined;

  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    timber: primaryTimberName,
    price: row.price,
    image: row.primary_image,
    dimensions: row.dimensions,
    description: row.description,
    isPopular: row.is_popular ?? false,
    link: row.link,
    tagline: row.tagline || undefined,
    leadTime: row.lead_time || undefined,
    gallery: gallery && gallery.length > 0 ? gallery : undefined,
    timbers: timberOptions && timberOptions.length > 0 ? timberOptions : undefined,
    features: row.features || undefined,
    specs: row.specs || undefined,
  };
}

/**
/**
 * Fetch all products from database with optional category & timber filters.
 *
 * In Production:
 * - Missing credentials -> throws configuration Error.
 * - Database query failure -> throws server Error.
 * - Never silently falls back to static seed data.
 *
 * In Local Development:
 * - Falls back to verified seed data ONLY when database credentials are not yet configured.
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (isProduction && !isConfigured) {
    throw new Error(
      "[KILN STUDIO CONFIG ERROR] Database credentials (NEXT_PUBLIC_SUPABASE_URL and key) are not configured in production environment."
    );
  }

  const supabase = getSupabaseClient();

  if (supabase && isConfigured) {
    let query = supabase.from("products").select(`
      *,
      categories!inner ( id, name ),
      timbers!inner ( id, name, provenance, swatch_url, description ),
      product_images ( id, src, alt, title, display_order ),
      product_timber_options (
        id,
        price,
        description,
        timbers ( id, name, provenance, swatch_url, description )
      )
    `);

    if (filters.category && filters.category !== "All Pieces") {
      const cat = filters.category.trim();
      query = query.or(`id.ilike.%${cat}%,name.ilike.%${cat}%`, { referencedTable: "categories" });
    }

    if (filters.timber && filters.timber !== "All Timbers") {
      const tim = filters.timber.trim();
      query = query.or(`id.ilike.%${tim}%,name.ilike.%${tim}%`, { referencedTable: "timbers" });
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[KILN STUDIO NOTICE] Tables ('products', 'categories') do not exist yet in your Supabase project.\n" +
          "👉 Please execute 'supabase/schema.sql' and 'supabase/seed.sql' in your Supabase SQL Editor to populate tables.\n" +
          "Serving local verified baseline until schema is applied."
        );
        return staticProducts.filter((product) => {
          const matchCategory =
            !filters.category ||
            filters.category === "All Pieces" ||
            product.category.toLowerCase() === filters.category.toLowerCase() ||
            product.category.toLowerCase().includes(filters.category.toLowerCase()) ||
            filters.category.toLowerCase().includes(product.category.toLowerCase());

          const cleanTimber = filters.timber ? filters.timber.toLowerCase().replace(/-/g, " ") : "";
          const prodTimber = product.timber.toLowerCase();
          const matchTimber =
            !filters.timber ||
            filters.timber === "All Timbers" ||
            prodTimber.includes(cleanTimber) ||
            cleanTimber.includes(prodTimber);

          return matchCategory && matchTimber;
        });
      }
      throw new Error(`[KILN STUDIO DB ERROR] Failed to fetch products from database: ${error.message}`);
    }

    return (data || []).map(mapDbProductToDomain);
  }

  // Fallback to verified seed data strictly in local development when credentials are unavailable
  if (!isProduction) {
    console.warn(
      "[KILN STUDIO DEV] Supabase credentials not configured in local environment. Serving verified local seed baseline for development testing."
    );
    return staticProducts.filter((product) => {
      const matchCategory =
        !filters.category ||
        filters.category === "All Pieces" ||
        product.category.toLowerCase() === filters.category.toLowerCase() ||
        product.category.toLowerCase().includes(filters.category.toLowerCase()) ||
        filters.category.toLowerCase().includes(product.category.toLowerCase());

      const cleanTimber = filters.timber ? filters.timber.toLowerCase().replace(/-/g, " ") : "";
      const prodTimber = product.timber.toLowerCase();
      const matchTimber =
        !filters.timber ||
        filters.timber === "All Timbers" ||
        prodTimber.includes(cleanTimber) ||
        cleanTimber.includes(prodTimber);

      return matchCategory && matchTimber;
    });
  }


  throw new Error("[KILN STUDIO] Database connection unavailable.");
}

/**
 * Fetch a single product by its unique ID / slug.
 *
 * In Production:
 * - Missing credentials -> throws configuration Error.
 * - Database failure -> throws server Error.
 *
 * In Local Development:
 * - Falls back to static seed data ONLY when database credentials are not configured.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (isProduction && !isConfigured) {
    throw new Error(
      "[KILN STUDIO CONFIG ERROR] Database credentials (NEXT_PUBLIC_SUPABASE_URL and key) are not configured in production environment."
    );
  }

  const supabase = getSupabaseClient();

  if (supabase && isConfigured) {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories ( id, name ),
        timbers ( id, name, provenance, swatch_url, description ),
        product_images ( id, src, alt, title, display_order ),
        product_timber_options (
          id,
          price,
          description,
          timbers ( id, name, provenance, swatch_url, description )
        )
      `)
      .or(`id.eq.${id},link.eq./products/${id}`)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          `[KILN STUDIO NOTICE] Table 'products' does not exist yet. Serving baseline item '${id}'.`
        );
        const found = staticProducts.find((p) => p.id === id || p.link.includes(id));
        return found || null;
      }
      throw new Error(
        `[KILN STUDIO DB ERROR] Failed to fetch product '${id}' from database: ${error.message}`
      );
    }

    if (!data) return null;
    return mapDbProductToDomain(data);
  }

  // Fallback strictly for local development without credentials
  if (!isProduction) {
    console.warn(
      "[KILN STUDIO DEV] Supabase credentials not configured in local environment. Serving verified local seed baseline for development testing."
    );
    const found = staticProducts.find((p) => p.id === id || p.link.includes(id));
    return found || null;
  }

  throw new Error("[KILN STUDIO] Database connection unavailable.");
}


