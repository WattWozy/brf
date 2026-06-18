import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { requireSession } from "@/app/lib/auth";
import { getContext } from "@/infra/container";

const NAV = [
  { href: "/app", label: "Översikt", boardOnly: false },
  { href: "/app/anslag", label: "Anslagstavla", boardOnly: false },
  { href: "/app/felanmalan", label: "Felanmälan", boardOnly: false },
  { href: "/app/uppdrag", label: "Uppdrag", boardOnly: true },
  { href: "/app/bokningar", label: "Bokningar", boardOnly: false },
];

export default async function AppLayout({
  children,
}: LayoutProps<"/app">) {
  const principal = await requireSession();
  const ctx = getContext();
  const [brf, user] = await Promise.all([
    ctx.brfs.findById(principal.brfId),
    ctx.users.findById(principal.userId),
  ]);
  const isBoard = principal.role === "STYRELSE";

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/app" className="font-semibold">
              {brf?.name ?? "Föreningsportalen"}
            </Link>
            {isBoard && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                Styrelse
              </span>
            )}
          </div>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{user?.name}</span>
            <button className="font-medium text-slate-600 hover:text-slate-900">
              Logga ut
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {NAV.filter((n) => !n.boardOnly || isBoard).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
