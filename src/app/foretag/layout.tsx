import type { ReactNode } from "react";
import Link from "next/link";
import { getBusinessSession } from "@/infra/auth/business-session";
import { logoutBusinessAction } from "@/app/actions/businesses";

export default async function ForetagLayout({ children }: { children: ReactNode }) {
  const session = await getBusinessSession();

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/foretag/uppdrag" className="font-semibold text-slate-900">
              Företagsportalen
            </Link>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Hantverkare
            </span>
          </div>
          {session ? (
            <form action={logoutBusinessAction} className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">{session.companyName}</span>
              <button className="font-medium text-slate-600 hover:text-slate-900">
                Logga ut
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <Link href="/foretag/logga-in" className="font-medium text-slate-600 hover:text-slate-900">
                Logga in
              </Link>
              <Link
                href="/foretag/registrera"
                className="rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
              >
                Registrera
              </Link>
            </div>
          )}
        </div>
        {session && (
          <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
            <Link
              href="/foretag/uppdrag"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Uppdragspool
            </Link>
            <Link
              href="/foretag/mina-bud"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Mina bud
            </Link>
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
