import Link from "next/link";
import { HomeIcon, GridIcon, UserIcon } from "@/components/shop/icons";

export function MobileTabBar({ user }: { user: { id: string } | null }) {
  const tabs = [
    { href: "/", label: "Discover", icon: HomeIcon },
    { href: "/shop", label: "Shop", icon: GridIcon },
    { href: user ? "/profile" : "/login", label: "Account", icon: UserIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-dim bg-surface-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Link
              key={`${tab.href}-${index}`}
              href={tab.href}
              className="flex min-w-[56px] flex-col items-center justify-center gap-0.5 text-on-surface-variant transition-colors"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
