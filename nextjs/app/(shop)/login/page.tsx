import { LoginRegisterPanel } from "@/components/shop/login-register-panel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const defaultTab = params.tab === "register" ? "register" : "login";
  const registered = !!params.registered;
  const redirectTo = params.redirect?.startsWith("/") && !params.redirect.startsWith("//")
    ? params.redirect
    : "/";

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-md items-center">
        <LoginRegisterPanel
          defaultTab={defaultTab}
          registered={registered}
          redirectTo={redirectTo}
        />
      </div>
    </main>
  );
}
