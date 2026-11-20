import Link from "next/link";

const NAV_SECTIONS = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
    ],
  },
  {
    title: "Catalog",
    links: [
      { href: "/admin/products", label: "Products", capability: "products" },
      { href: "/admin/categories", label: "Categories", capability: "products" },
      { href: "/admin/colors", label: "Colors", capability: "products" },
      { href: "/admin/brands", label: "Brands", capability: "products" },
      { href: "/admin/coupons", label: "Coupons", capability: "coupons" },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders", capability: "orders" },
      { href: "/admin/shipments", label: "Shipments", capability: "orders" },
      { href: "/admin/payments", label: "Payments", capability: "orders" },
      { href: "/admin/payment-slips", label: "Payment Slips", capability: "orders" },
      { href: "/admin/payment-methods", label: "Payment Methods", capability: "orders" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/admin/create-admin", label: "Create Admin Account", adminOnly: true },
      { href: "/admin/contact", label: "Contact Details", adminOnly: true },
      { href: "/admin/activity-logs", label: "Activity Log", capability: "reports" },
      { href: "/admin/profile", label: "My Profile" },
    ],
  },
];

export function AdminSidebar({
  role,
  permissions,
}: {
  role: string;
  permissions: Record<string, boolean>;
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-surface-dim bg-surface p-4 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto">
      <Link href="/" className="font-display text-lg font-bold text-primary">
        LuvShop Admin
      </Link>
      <nav className="mt-6 space-y-6">
        {NAV_SECTIONS.map((section) => {
          const links = section.links.filter((link) => {
            const capability = "capability" in link ? link.capability : undefined;
            const adminOnly = "adminOnly" in link && link.adminOnly;
            return (!adminOnly || role === "admin") && (!capability || role === "admin" || permissions[capability]);
          });
          if (!links.length) return null;
          return (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase text-on-surface-variant">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-container-lowest hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
