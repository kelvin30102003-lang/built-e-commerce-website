import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { fetchCartItemCount } from "@/lib/shop/cart";
import { CartBadge } from "@/components/shop/cart-badge";
import { HeartIcon, UserIcon } from "@/components/shop/icons";

const NAV_LINKS = [
  {href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/orders", label: "Order" },
  { href: "/contact", label: "Contact " },
];

export async function SiteHeader({
  user,
  profile,
}: {
  user: { id: string } | null;
  profile: { role: string; avatar_url: string | null } | null;
}) {
  let itemCount = 0;
  if (user) {
    const supabase = await createClient();
    itemCount = await fetchCartItemCount(supabase, user.id);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-dim bg-surface-lowest/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="select-none text-sm font-semibold uppercase tracking-label-wide text-primary "
        >
          Venus
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-semibold uppercase tracking-label text-on-surface-variant transition-colors hover:text-primary "
            >
              {link.label}
            </Link>
          ))}
          {(profile?.role === "admin" || profile?.role === "staff") && (
            <Link
              href="/admin"
              className="text-[11px] font-semibold uppercase tracking-label text-on-surface-variant transition-colors hover:text-primary "
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right-side icons */}
        <div className="flex items-center gap-1" >

          {/* ❤️ Wishlist (replaces search + old bookmark) */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="flex h-11 w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-primary "
          >
            <HeartIcon />
          </Link>

          {/* 🛍️ Shopping Bag with count badge */}
          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="flex h-11 items-center justify-center gap-1 px-2 text-on-surface-variant transition-colors hover:text-primary "
          >
            <CartBadge count={itemCount} />
          </Link>

          {/* 👤 User / Profile */}
          <Link
            href={user ? "/profile" : "/login"}
            aria-label={user ? "Account" : "Login"}
            className="ml-1 flex items-center"
          >
            {user && profile?.avatar_url ? (
              <span className="relative block h-8 w-8 overflow-hidden rounded-full border border-surface-dim">
                <Image src={profile.avatar_url} alt="" fill sizes="32px" className="object-cover" />
              </span>
            ) : (
              <span className="flex h-11 w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-primary">
                <UserIcon />
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
