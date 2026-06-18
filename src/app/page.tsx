import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/infra/auth/session";

const FEATURES = [
  {
    title: "Felanmälan",
    body: "Boende rapporterar fel direkt i portalen. Styrelsen får ordning och reda på alla ärenden.",
  },
  {
    title: "Upphandling & bud",
    body: "Publicera uppdrag och låt hantverkare lägga bud via en delningslänk. Jämför pris och tid på ett ställe.",
  },
  {
    title: "Anslagstavla",
    body: "Nyheter från styrelsen och ett arkiv för stadgar, protokoll och årsredovisning.",
  },
  {
    title: "Bokningar",
    body: "Tvättstuga, gästlägenhet och gemensamma lokaler – boka utan dubbelbokningar.",
  },
];

export default async function Home() {
  if (await getSession()) {
    redirect("/app");
  }
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">Föreningsportalen</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="font-medium text-slate-600 hover:text-slate-900">
              Logga in
            </Link>
            <Link
              href="/registrera"
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
            >
              Skapa förening
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <section className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Mindre byråkrati för din bostadsrättsförening
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Samla felanmälan, upphandling, kommunikation och bokningar på ett
            ställe. Låt hantverkare lägga bud på era uppdrag – helt digitalt.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/registrera"
              className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
            >
              Kom igång gratis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium hover:bg-slate-50"
            >
              Logga in
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        Föreningsportalen · byggd för svenska bostadsrättsföreningar
      </footer>
    </div>
  );
}
