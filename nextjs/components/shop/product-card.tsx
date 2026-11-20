import Link from "next/link";
import Image from "next/image";
import { formatMmk } from "@/lib/shop/format";
import { ProductAddToCartButton, ProductWishlistButton } from "@/components/shop/product-card-actions";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  product_images?: { image_url: string; sort_order: number }[] | null;
  product_variants?: {
    id: number;
    price: number;
    compare_price: number | null;
    is_active: boolean;
    stock_quantity?: number;
  }[] | null;
}

export function ProductCard({
  product,
  initiallyWishlisted = false,
}: {
  product: ProductCardData;
  initiallyWishlisted?: boolean;
}) {
  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const activeVariants = (product.product_variants ?? []).filter((variant) => variant.is_active);
  const lowestVariant = activeVariants.length
    ? activeVariants.reduce((min, variant) => variant.price < min.price ? variant : min, activeVariants[0])
    : null;
  const lowestPrice = lowestVariant?.price ?? null;
  const comparePrice = lowestVariant?.compare_price ?? null;
  const isOutOfStock = !lowestVariant || (lowestVariant.stock_quantity !== undefined && lowestVariant.stock_quantity <= 0);
  const discountPercent = lowestPrice !== null && comparePrice !== null && comparePrice > lowestPrice
    ? Math.round(((comparePrice - lowestPrice) / comparePrice) * 100)
    : null;

  return (
    <article className="group relative flex w-full flex-col overflow-hidden border-2 border-black bg-white text-black shadow-[6px_6px_0px_#202126] transition-transform duration-200 hover:-translate-y-1">
      {discountPercent !== null ? (
        <span className="absolute left-3 top-3 z-20 bg-black px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-white">-{discountPercent}%</span>
      ) : null}

      <ProductWishlistButton productId={product.id} productSlug={product.slug} initiallyWishlisted={initiallyWishlisted} />

      <Link href={`/products/${product.slug}`} className="block w-full">
        <div className="relative aspect-square w-full overflow-hidden border-b-2 border-black bg-[#FAFAF8]">
          {images[0] ? (
            <Image
              src={images[0].image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs font-bold text-gray-400">NO IMAGE</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[38px] font-mono text-sm font-bold uppercase leading-tight tracking-wide text-black sm:min-h-[44px] sm:text-lg">
            {product.name}
          </h3>
        </Link>

        <div className="my-3 border-t-2 border-dashed border-black sm:my-5" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">Price</p>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold leading-none text-black sm:text-xl">
                {lowestPrice !== null ? formatMmk(lowestPrice) : "N/A"}
              </span>
              {comparePrice !== null && lowestPrice !== null && comparePrice > lowestPrice ? (
                <span className="mt-1 font-mono text-xs text-gray-400 line-through">{formatMmk(comparePrice)}</span>
              ) : null}
            </div>
          </div>

          <ProductAddToCartButton
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            variantId={lowestVariant?.id ?? null}
            imageUrl={images[0]?.image_url ?? null}
            isOutOfStock={isOutOfStock}
          />
        </div>
      </div>
    </article>
  );
}
