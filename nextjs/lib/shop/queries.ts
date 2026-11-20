import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type ProductSort = "newest" | "name_asc";

export interface ProductListFilters {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: ProductSort;
  pageSize?: number;
  /** Opaque cursor from a previous page's `nextCursor`/`prevCursor`. */
  cursor?: string;
  /** Direction to page in relative to `cursor`. Ignored if `cursor` is absent. */
  direction?: "after" | "before";
}

const DEFAULT_PAGE_SIZE = 12;

interface CursorPayload {
  sortValue: string;
  id: number;
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload | null {
  if (cursor.length > 1024) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      typeof parsed?.sortValue === "string" &&
      parsed.sortValue.length <= 256 &&
      Number.isSafeInteger(parsed?.id) &&
      parsed.id > 0
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// Sort column backing each public sort option, plus `id` as a tie-breaker so
// the composite (sortColumn, id) cursor is always unique and stable.
const SORT_COLUMN: Record<ProductSort, "created_at" | "name"> = {
  newest: "created_at",
  name_asc: "name",
};

export async function fetchProducts(
  supabase: SupabaseClient<Database>,
  filters: ProductListFilters,
) {
  const sort: ProductSort = filters.sort && filters.sort in SORT_COLUMN ? filters.sort : "newest";
  const pageSize = Math.max(1, Math.min(Math.trunc(filters.pageSize ?? DEFAULT_PAGE_SIZE), 48));
  const sortColumn = SORT_COLUMN[sort];
  const ascending = sort === "name_asc";

  const selectFields = `id, name, slug,
       product_variants(id, price, compare_price, stock_quantity, is_active),
       product_images(id, image_url, sort_order)` as const;

  let query = supabase
    .from("products")
    .select(selectFields)
    .eq("status", "active");

  const search = filters.search?.trim().slice(0, 100);
  if (search) {
    const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("name", `%${escapedSearch}%`);
  }

  const [categoryResult, brandResult] = await Promise.all([
    filters.categorySlug
      ? supabase.from("categories").select("id").eq("slug", filters.categorySlug).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    filters.brandSlug
      ? supabase.from("brands").select("id").eq("slug", filters.brandSlug).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if ((filters.categorySlug && (categoryResult.error || !categoryResult.data)) ||
      (filters.brandSlug && (brandResult.error || !brandResult.data))) {
    const lookupFailed = Boolean(categoryResult.error || brandResult.error);
    if (lookupFailed) console.error("Could not resolve product filters.");
    return { products: [], pageSize, hasNext: false, hasPrev: false, nextCursor: null, prevCursor: null, error: lookupFailed };
  }
  if (categoryResult.data) query = query.eq("category_id", categoryResult.data.id);
  if (brandResult.data) query = query.eq("brand_id", brandResult.data.id);

  // Listing cards only need the cheapest in-stock variant and the lead image.
  query = query
    .eq("product_variants.is_active", true)
    .gt("product_variants.stock_quantity", 0)
    .order("price", { referencedTable: "product_variants", ascending: true })
    .order("id", { referencedTable: "product_variants", ascending: true })
    .limit(1, { referencedTable: "product_variants" })
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("id", { referencedTable: "product_images", ascending: true })
    .limit(1, { referencedTable: "product_images" });

  // Paging "before" a cursor means walking backwards, so both the row order
  // and the comparison direction flip; we re-reverse the page after fetching.
  const paging = filters.cursor ? decodeCursor(filters.cursor) : null;
  const goingBackward = paging !== null && filters.direction === "before";
  const rowsAscending = goingBackward ? !ascending : ascending;

  query = query.order(sortColumn, { ascending: rowsAscending }).order("id", { ascending: rowsAscending });

  if (paging) {
    const op = rowsAscending ? "gt" : "lt";
    // PostgREST or()/and() filter values must be quoted to survive commas,
    // parens, or periods in arbitrary text columns like `name`.
    const quote = (value: string) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    // Composite keyset predicate: (sortColumn, id) strictly after/before the cursor.
    query = query.or(
      `${sortColumn}.${op}.${quote(paging.sortValue)},and(${sortColumn}.eq.${quote(paging.sortValue)},id.${op}.${paging.id})`,
    );
  }

  const { data, error } = await query.limit(pageSize + 1);
  if (error) {
    console.error(
      "Could not load products:",
      `code=${error.code}; message=${error.message}; details=${error.details ?? ""}; hint=${error.hint ?? ""}`,
    );
    return { products: [], pageSize, hasNext: false, hasPrev: false, nextCursor: null, prevCursor: null, error: true };
  }

  const rows = data ?? [];
  const hasMore = rows.length > pageSize;
  const page = rows.slice(0, pageSize);
  if (goingBackward) page.reverse();

  const first = page[0];
  const last = page[page.length - 1];

  const prevCursor = first
    ? encodeCursor({ sortValue: String(first[sortColumn]), id: first.id })
    : null;
  const nextCursor = last
    ? encodeCursor({ sortValue: String(last[sortColumn]), id: last.id })
    : null;

  return {
    products: page,
    pageSize,
    hasNext: goingBackward ? true : hasMore,
    hasPrev: goingBackward ? hasMore : paging !== null,
    nextCursor,
    prevCursor,
    error: false,
  };
}

export async function fetchProductBySlug(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, short_description, description, status, created_at,
       category:categories(id, name, slug),
       brand:brands(id, name, slug),
       product_variants(id, sku, variant_name, price, compare_price, stock_quantity, is_active),
       product_images(id, image_url, sort_order),
       reviews(id, rating, comment, status, created_at, user_id, profiles(full_name))`,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("reviews.status", "approved")
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("id", { referencedTable: "product_images", ascending: true })
    .limit(12, { referencedTable: "product_images" })
    .order("created_at", { referencedTable: "reviews", ascending: false })
    .order("id", { referencedTable: "reviews", ascending: false })
    .limit(20, { referencedTable: "reviews" })
    .maybeSingle();

  if (error) {
    console.error("Could not load product:", error.message);
    throw new Error("Could not load this product. Please try again.");
  }
  return data;
}

export async function fetchActiveCategories(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Could not load categories:", error);
    return [];
  }
  return data ?? [];
}

export async function fetchActiveBrands(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) {
    console.error("Could not load brands:", error);
    return [];
  }
  return data ?? [];
}
