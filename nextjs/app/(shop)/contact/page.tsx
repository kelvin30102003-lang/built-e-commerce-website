import { createClient } from "@/lib/supabase/server";

const contactItems = [
  {
    key: "support_email",
    label: "Email",
    href: (value: string) => `mailto:${value}`,
  },
  {
    key: "support_phone",
    label: "Phone",
    href: (value: string) => `tel:${value.replace(/[^+\d]/g, "")}`,
  },
  { key: "support_address", label: "Address" },
  { key: "opening_hours", label: "Opening hours" },
] as const;

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("contact_settings")
    .select("support_email, support_phone, support_address, opening_hours")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          Venus Contact Lens
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          We’d love to hear from you. Reach us through any of the details below.
        </p>
      </header>

      <section aria-label="Shop contact information" className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {contactItems.map((item) => {
          const { key, label } = item;
          const href = "href" in item ? item.href : null;
          const value = settings?.[key]?.trim();
          return (
            <article
              key={key}
              className="rounded-xl border border-surface-dim bg-white p-5 sm:p-6"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                {label}
              </h2>
              {value ? (
                href ? (
                  <a
                    href={href(value)}
                    className="mt-3 inline-block break-words text-base font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-3 whitespace-pre-line break-words text-base font-medium leading-7 text-foreground">
                    {value}
                  </p>
                )
              ) : (
                <p className="mt-3 text-sm text-secondary">Not available yet</p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
