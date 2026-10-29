import Link from "next/link";
import { GridIcon } from "hugeicons-react";
import { fetchCategories } from "@/lib/categories";
import type { Metadata } from "next";
import CategoryGrid from "./CategoryGrid";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Categories | BI Marketplace",
  description: "Browse product categories on BI Marketplace.",
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <Container as="main" className="min-h-screen bg-white pb-20 pt-[70px] md:pt-20">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-base font-semibold text-zinc-950">Shop Our Top Categories</h1>

        {categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <div className="mt-10 rounded-3xl border border-zinc-100 bg-white px-6 py-14 text-center shadow-sm sm:py-20">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#008000]/10 text-[#008000]">
              <GridIcon size={30} />
            </div>
            <h2 className="text-xl font-black text-zinc-900">Categories are on the way</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              There are no categories to show right now. Explore the marketplace and check back soon.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#008000] px-5 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Explore marketplace
            </Link>
          </div>
        )}
      </section>
    </Container>
  );
}
