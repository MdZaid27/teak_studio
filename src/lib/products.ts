import * as fs from "fs";
import * as path from "path";
import { getSupabaseClient, getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";
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
  is_active?: boolean;
  compare_at_price?: number | null;
  stock_status?: string | null;
  wood_options?: unknown[];
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

export const TIMBER_DEFINITIONS: Record<
  string,
  { id: string; name: string; provenance: string; swatch: string; desc: string }
> = {
  "hunsur-teak": {
    id: "hunsur-teak",
    name: "Hunsur Teak",
    provenance: "Mysore / Karnataka",
    swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
    desc: "Golden amber tones with straight linear grain and high natural oils.",
  },
  "indian-rosewood": {
    id: "indian-rosewood",
    name: "Malabar Rosewood",
    provenance: "Malabar / Western Ghats",
    swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
    desc: "Dense burgundy-chocolate heartwood with natural dramatic swirl grain.",
  },
  "assam-teak": {
    id: "assam-teak",
    name: "Assam Teak",
    provenance: "North-East Foothills",
    swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
    desc: "Muted olive-golden hues with calm, serene minimalist grain fiber.",
  },
};

export interface CreateProductInput {
  title: string;
  slug: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number | null;
  shortDescription: string;
  description: string;
  timbers: {
    timberId: string;
    priceDelta?: number;
    price?: number;
  }[];
  dimensions: string;
  weight?: string;
  joinery?: string;
  primaryImage: string;
  galleryImages?: string[];
  leadTime?: string;
  stockStatus?: "in_stock" | "made_to_order" | "out_of_stock" | "archived";
  isActive?: boolean;
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  category?: string;
  basePrice?: number;
  compareAtPrice?: number | null;
  shortDescription?: string;
  description?: string;
  timbers?: {
    timberId: string;
    priceDelta?: number;
    price?: number;
  }[];
  dimensions?: string;
  weight?: string;
  joinery?: string;
  primaryImage?: string;
  galleryImages?: string[];
  leadTime?: string;
  stockStatus?: "in_stock" | "made_to_order" | "out_of_stock" | "archived";
  isActive?: boolean;
}

/**
 * Format raw Supabase database row with relational joins into hydrated Product domain model
 */
function mapDbProductToDomain(row: DbProductJoined): Product {
  const categoryName = row.categories?.name || row.category_id || "";
  const primaryTimberName = row.timbers?.name || row.primary_timber_id || "";

  // Decode visibility, status, and compare-at pricing from specs if table columns are not present
  const visibilitySpec = row.specs?.find((s) => s.label === "Visibility")?.value;
  const statusSpec = row.specs?.find((s) => s.label === "Status")?.value;
  const comparePriceSpec = row.specs?.find((s) => s.label === "CompareAtPrice")?.value;

  const isActive =
    row.is_active !== undefined
      ? row.is_active !== false
      : visibilitySpec
      ? visibilitySpec !== "hidden"
      : true;

  const stockStatus =
    row.stock_status ||
    statusSpec ||
    (row.lead_time?.toLowerCase().includes("in stock") ? "in_stock" : "made_to_order");

  const compareAtPrice =
    row.compare_at_price ??
    (comparePriceSpec && !isNaN(Number(comparePriceSpec)) ? Number(comparePriceSpec) : undefined);

  // Map product images sorted by display_order
  const gallery = Array.isArray(row.product_images) && row.product_images.length > 0
    ? [...row.product_images]
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img) => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        }))
    : undefined;

  // Map timber variation options
  const timberOptions = Array.isArray(row.product_timber_options) && row.product_timber_options.length > 0
    ? row.product_timber_options.map((opt) => {
        const timberDef = TIMBER_DEFINITIONS[opt.timber_id] || {
          id: opt.timber_id,
          name: opt.timbers?.name || opt.timber_id,
          provenance: opt.timbers?.provenance || "Indian Subcontinent",
          swatch: opt.timbers?.swatch_url || "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
          desc: opt.description || opt.timbers?.description || "",
        };

        return {
          id: opt.timbers?.id || opt.timber_id,
          name: opt.timbers?.name || timberDef.name,
          provenance: opt.timbers?.provenance || timberDef.provenance,
          swatch: opt.timbers?.swatch_url || timberDef.swatch,
          price: opt.price,
          desc: opt.description || opt.timbers?.description || timberDef.desc,
          origin: opt.timbers?.provenance || timberDef.provenance,
          region: opt.timbers?.provenance || timberDef.provenance,
          swatchImage: opt.timbers?.swatch_url || timberDef.swatch,
          slug: opt.timbers?.id || opt.timber_id,
        };
      })
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
    slug: row.link ? row.link.replace(/^\/(products|shop)\//, "") : row.id,
    tagline: row.tagline || undefined,
    leadTime: row.lead_time || undefined,
    isActive,
    compareAtPrice,
    stockStatus,
    gallery: gallery && gallery.length > 0 ? gallery : undefined,
    timbers: timberOptions && timberOptions.length > 0 ? timberOptions : undefined,
    woodOptions: timberOptions && timberOptions.length > 0 ? timberOptions : undefined,
    features: row.features || undefined,
    specs: row.specs || undefined,
  };
}

/**
 * Fetch all products directly from Supabase PostgreSQL.
 * Pure database query with zero disk I/O overhead.
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  const supabase = getSupabaseClient();

  if (supabase && isConfigured) {
    try {
      let query = supabase.from("products").select(`
        *,
        categories ( id, name ),
        timbers ( id, name, provenance, swatch_url, description ),
        product_images ( id, src, alt, title, display_order ),
        product_timber_options (
          id,
          timber_id,
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

      if (!error && data && data.length > 0) {
        let prods = data.map(mapDbProductToDomain);
        if (!filters.includeHidden) {
          prods = prods.filter((p) => p.isActive !== false && p.stockStatus !== "archived");
        }
        return prods;
      }
    } catch (err) {
      if (isProduction) {
        throw new Error(`[TEAK HAUS DB ERROR] Failed to fetch products: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.warn("[TEAK HAUS] Supabase query failed, falling back to static seeds:", err);
    }
  }

  // Fallback strictly in offline local development without credentials
  return staticProducts.filter((product) => {
    const prodCat = (product.category || "").toLowerCase();
    const filterCat = (filters.category || "").toLowerCase();
    const matchCategory =
      !filters.category ||
      filters.category === "All Pieces" ||
      prodCat === filterCat ||
      prodCat.includes(filterCat) ||
      filterCat.includes(prodCat);

    const cleanTimber = filters.timber ? filters.timber.toLowerCase().replace("indian ", "").replace("malabar ", "").replace(/-/g, " ") : "";
    const prodTimber = (product.timber || "").toLowerCase();
    const woodNames = (product.woodOptions || product.timbers || []).map((w) => w.name.toLowerCase());
    const matchTimber =
      !filters.timber ||
      filters.timber === "All Timbers" ||
      prodTimber.includes(cleanTimber) ||
      cleanTimber.includes(prodTimber) ||
      woodNames.some((w) => w.includes(cleanTimber));

    return matchCategory && matchTimber;
  });
}

/**
 * Fetch all products for the admin console (including inactive/archived products).
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  return getProducts({ includeHidden: true });
}

/**
 * Fetch a single product by its unique ID / slug directly from Supabase.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const isConfigured = isSupabaseConfigured();
  const supabase = getSupabaseClient();

  if (supabase && isConfigured) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories ( id, name ),
          timbers ( id, name, provenance, swatch_url, description ),
          product_images ( id, src, alt, title, display_order ),
          product_timber_options (
            id,
            timber_id,
            price,
            description,
            timbers ( id, name, provenance, swatch_url, description )
          )
        `)
        .or(`id.eq.${id},link.eq./products/${id},link.eq./shop/${id}`)
        .maybeSingle();

      if (!error && data) {
        return mapDbProductToDomain(data);
      }
    } catch {
      // Fallback
    }
  }

  // Fallback
  const all = await getProducts({ includeHidden: true });
  return all.find((p) => p.id === id || p.slug === id || p.link.includes(id)) || null;
}

/**
 * Create a new product directly in Supabase PostgreSQL.
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const slug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || `piece-${Date.now()}`;
  const categoryId = input.category.toLowerCase().trim();
  const primaryTimberId = input.timbers[0]?.timberId || "hunsur-teak";
  const link = `/products/${slug}`;
  const basePrice = Math.max(0, Math.round(input.basePrice));
  const compareAtPrice = input.compareAtPrice ? Math.max(0, Math.round(input.compareAtPrice)) : null;
  const primaryImage = input.primaryImage?.trim() || (input.galleryImages && input.galleryImages[0]) || "/brand/teak-haus-dark.png";
  const stockStatus = input.stockStatus || "in_stock";
  const isActive = input.isActive ?? true;
  const leadTime = input.leadTime?.trim() || (stockStatus === "in_stock" ? "In Stock — 48h Dispatch" : "Made to order • 3–4 weeks");

  const features = [
    "100% Solid Indian Hardwood — zero veneers, zero MDF",
    "Traditional mortise & tenon joinery pinned with hardwood dowels",
    "Hand-rubbed organic beeswax & natural protective oil finish",
    "Naturally seasoned to 8–10% equilibrium moisture content",
  ];

  // Store metadata in specs array to ensure schema compatibility
  const specs = [
    { label: "Dimensions", value: input.dimensions || "Custom Architectural" },
    { label: "Weight", value: input.weight || "Solid Heartwood" },
    { label: "Joinery", value: input.joinery || "Traditional Mortise & Tenon" },
    { label: "Primary Timber", value: TIMBER_DEFINITIONS[primaryTimberId]?.name || primaryTimberId },
    { label: "Category", value: input.category },
    { label: "Status", value: stockStatus },
    { label: "Visibility", value: isActive ? "active" : "hidden" },
    ...(compareAtPrice ? [{ label: "CompareAtPrice", value: String(compareAtPrice) }] : []),
  ];

  // Map timber variations
  const timberVariations = input.timbers.map((t) => {
    const def = TIMBER_DEFINITIONS[t.timberId] || {
      id: t.timberId,
      name: t.timberId,
      provenance: "Indian Subcontinent",
      swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
      desc: "Solid Indian timber",
    };
    const delta = t.priceDelta ?? 0;
    const price = t.price ?? (basePrice + delta);

    return {
      id: def.id,
      name: def.name,
      provenance: def.provenance,
      swatch: def.swatch,
      price: Math.max(0, price),
      desc: def.desc,
      origin: def.provenance,
      region: def.provenance,
      swatchImage: def.swatch,
      slug: def.id,
    };
  });

  const galleryItems = (input.galleryImages || []).filter(Boolean).map((src, idx) => ({
    src,
    alt: `${input.title} perspective ${idx + 1}`,
    title: `Atelier Perspective ${idx + 1}`,
  }));

  if (galleryItems.length === 0 && primaryImage) {
    galleryItems.push({
      src: primaryImage,
      alt: input.title,
      title: "Hero Perspective",
    });
  }

  const newProduct: Product = {
    id: slug,
    name: input.title,
    category: input.category,
    timber: TIMBER_DEFINITIONS[primaryTimberId]?.name || "Hunsur Teak",
    price: basePrice,
    compareAtPrice: compareAtPrice,
    image: primaryImage,
    dimensions: input.dimensions,
    description: input.description,
    tagline: input.shortDescription,
    leadTime,
    isActive,
    stockStatus,
    link,
    slug,
    isPopular: false,
    gallery: galleryItems,
    timbers: timberVariations,
    woodOptions: timberVariations,
    features,
    specs,
  };

  // Write directly to Supabase via Admin Client
  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      await adminClient.from("categories").upsert({
        id: categoryId,
        name: input.category,
      });

      const dbPayload: Record<string, unknown> = {
        id: slug,
        name: input.title,
        category_id: categoryId,
        primary_timber_id: primaryTimberId,
        price: basePrice,
        primary_image: primaryImage,
        dimensions: input.dimensions,
        description: input.description,
        tagline: input.shortDescription,
        lead_time: leadTime,
        link,
        features,
        specs,
      };

      const { error: prodErr } = await adminClient.from("products").upsert(dbPayload);

      if (!prodErr) {
        if (galleryItems.length > 0) {
          await adminClient.from("product_images").delete().eq("product_id", slug);
          await adminClient.from("product_images").insert(
            galleryItems.map((g, idx) => ({
              product_id: slug,
              src: g.src,
              alt: g.alt,
              title: g.title,
              display_order: idx,
            }))
          );
        }

        if (timberVariations.length > 0) {
          await adminClient.from("product_timber_options").delete().eq("product_id", slug);
          await adminClient.from("product_timber_options").insert(
            timberVariations.map((tv) => ({
              product_id: slug,
              timber_id: tv.id,
              price: tv.price,
              description: tv.desc,
            }))
          );
        }
      } else {
        console.error("[TEAK HAUS DB] Supabase product insert error:", prodErr.message);
      }
    } catch (err) {
      console.error("[TEAK HAUS DB] Database write error:", err);
    }
  }

  return newProduct;
}

/**
 * Update an existing product directly in Supabase.
 */
export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const title = input.title !== undefined ? input.title : existing.name;
  const category = input.category !== undefined ? input.category : existing.category;
  const categoryId = category.toLowerCase().trim();
  const basePrice = input.basePrice !== undefined ? Math.max(0, Math.round(input.basePrice)) : existing.price;
  const compareAtPrice = input.compareAtPrice !== undefined ? input.compareAtPrice : existing.compareAtPrice;
  const dimensions = input.dimensions !== undefined ? input.dimensions : existing.dimensions;
  const shortDescription = input.shortDescription !== undefined ? input.shortDescription : (existing.tagline || "");
  const description = input.description !== undefined ? input.description : existing.description;
  const stockStatus = input.stockStatus !== undefined ? input.stockStatus : (existing.stockStatus || "in_stock");
  const leadTime =
    input.leadTime !== undefined
      ? input.leadTime
      : stockStatus === "in_stock" && !existing.leadTime?.toLowerCase().includes("in stock")
      ? "In Stock — 48h Dispatch"
      : existing.leadTime || "Made to order • 3–4 weeks";
  const isActive = input.isActive !== undefined ? input.isActive : (existing.isActive !== false);
  const primaryImage = input.primaryImage !== undefined ? input.primaryImage : existing.image;

  let timberVariations = existing.timbers || existing.woodOptions || [];
  if (input.timbers && input.timbers.length > 0) {
    timberVariations = input.timbers.map((t) => {
      const def = TIMBER_DEFINITIONS[t.timberId] || {
        id: t.timberId,
        name: t.timberId,
        provenance: "Indian Subcontinent",
        swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
        desc: "Solid Indian timber",
      };
      const delta = t.priceDelta ?? 0;
      const price = t.price ?? (basePrice + delta);

      return {
        id: def.id,
        name: def.name,
        provenance: def.provenance,
        swatch: def.swatch,
        price: Math.max(0, price),
        desc: def.desc,
        origin: def.provenance,
        region: def.provenance,
        swatchImage: def.swatch,
        slug: def.id,
      };
    });
  }

  let galleryItems = existing.gallery || [];
  if (input.galleryImages) {
    galleryItems = input.galleryImages.filter(Boolean).map((src, idx) => ({
      src,
      alt: `${title} view ${idx + 1}`,
      title: `View ${idx + 1}`,
    }));
  }

  const primaryTimberId = timberVariations[0]?.id || "hunsur-teak";

  const specs = [
    { label: "Dimensions", value: dimensions || "Custom Architectural" },
    { label: "Weight", value: input.weight || "Solid Heartwood" },
    { label: "Joinery", value: input.joinery || "Traditional Mortise & Tenon" },
    { label: "Primary Timber", value: TIMBER_DEFINITIONS[primaryTimberId]?.name || primaryTimberId },
    { label: "Category", value: category },
    { label: "Status", value: stockStatus },
    { label: "Visibility", value: isActive ? "active" : "hidden" },
    ...(compareAtPrice ? [{ label: "CompareAtPrice", value: String(compareAtPrice) }] : []),
  ];

  const updatedProduct: Product = {
    ...existing,
    name: title,
    category,
    price: basePrice,
    compareAtPrice,
    dimensions,
    description,
    tagline: shortDescription,
    leadTime,
    stockStatus,
    isActive,
    image: primaryImage,
    timbers: timberVariations,
    woodOptions: timberVariations,
    gallery: galleryItems,
    specs,
  };

  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      await adminClient.from("categories").upsert({
        id: categoryId,
        name: category,
      });

      const { error: upErr } = await adminClient
        .from("products")
        .update({
          name: title,
          category_id: categoryId,
          primary_timber_id: primaryTimberId,
          price: basePrice,
          primary_image: primaryImage,
          dimensions,
          description,
          tagline: shortDescription,
          lead_time: leadTime,
          specs,
        })
        .eq("id", id);

      if (!upErr) {
        if (input.galleryImages) {
          await adminClient.from("product_images").delete().eq("product_id", id);
          if (galleryItems.length > 0) {
            await adminClient.from("product_images").insert(
              galleryItems.map((g, idx) => ({
                product_id: id,
                src: g.src,
                alt: g.alt,
                title: g.title,
                display_order: idx,
              }))
            );
          }
        }

        if (input.timbers) {
          await adminClient.from("product_timber_options").delete().eq("product_id", id);
          if (timberVariations.length > 0) {
            await adminClient.from("product_timber_options").insert(
              timberVariations.map((tv) => ({
                product_id: id,
                timber_id: tv.id,
                price: tv.price,
                description: tv.desc,
              }))
            );
          }
        }
      }
    } catch (err) {
      console.error("[TEAK HAUS DB] Update error:", err);
    }
  }

  return updatedProduct;
}

/**
 * Archive or permanently delete a product in Supabase.
 */
export async function deleteProduct(id: string, archiveOnly = true): Promise<boolean> {
  const adminClient = getSupabaseAdminClient();

  if (archiveOnly) {
    return updateProduct(id, {
      isActive: false,
      stockStatus: "archived",
    }).then((res) => Boolean(res));
  }

  if (adminClient) {
    try {
      await adminClient.from("product_timber_options").delete().eq("product_id", id);
      await adminClient.from("product_images").delete().eq("product_id", id);
      await adminClient.from("products").delete().eq("id", id);
    } catch (err) {
      console.error("[TEAK HAUS DB] Delete error:", err);
    }
  }

  return true;
}
