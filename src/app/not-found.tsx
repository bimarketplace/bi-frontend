import Link from "next/link";
import { ArrowLeft01Icon, Search01Icon } from "hugeicons-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 pb-24 pt-24 text-center">
      <section className="w-full max-w-md rounded-3xl border border-zinc-100 bg-white px-6 py-12 shadow-sm sm:px-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#008000]/10 text-[#008000]">
          <Search01Icon size={30} />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#008000]">Page not found</p>
        <h1 className="mt-3 text-2xl font-black text-zinc-950 sm:text-3xl">
          This page isn't here
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          The page may have moved, or the link might be out of date. Let's get you back to BI Marketplace.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008000] px-5 text-sm font-bold text-white transition hover:bg-green-800"
        >
          <ArrowLeft01Icon size={18} />
          Back to marketplace
        </Link>
      </section>
    </main>
  );
}
