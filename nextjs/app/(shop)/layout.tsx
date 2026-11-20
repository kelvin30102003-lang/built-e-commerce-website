import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { MobileTabBar } from "@/components/shop/mobile-tab-bar";
import { CartAddedToast } from "@/components/shop/cart-added-toast";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentProfile();

  return (
    <>
      <SiteHeader user={user} profile={profile} />
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar user={user} />
      <CartAddedToast />
    </>
  );
}
