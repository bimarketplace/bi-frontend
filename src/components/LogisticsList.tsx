"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogisticsCompany } from "@/lib/logistics";
import { Container } from "@/components/layout/Container";
import { Search02Icon, TruckIcon, Location01Icon, ArrowRight01Icon } from "hugeicons-react";

interface LogisticsListProps {
  initialCompanies: LogisticsCompany[];
}

const LogisticsCard = ({ company }: { company: LogisticsCompany }) => {
  return (
    <Link
      href={`/logistics/${company.id}`}
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f7f9] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#008000]/10 to-white" />
        <TruckIcon size={54} className="relative text-[#008000]/80" />
      </div>

      <div className="flex-1 p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{company.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{company.description || "Reliable and verified logistics service."}</p>
        </div>

        <div className="grid gap-2 text-sm text-gray-600">
          {company.service_types ? (
            <p className="font-medium text-gray-700"><span className="font-semibold text-gray-900">Services:</span> {company.service_types}</p>
          ) : null}
          {company.coverage_area ? (
            <p><span className="font-semibold text-gray-900">Coverage:</span> {company.coverage_area}</p>
          ) : null}
          {company.delivery_options ? (
            <p><span className="font-semibold text-gray-900">Delivery:</span> {company.delivery_options}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Location01Icon size={16} />
            <span>{company.pickup_address ? company.pickup_address : "No pickup address provided"}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#008000]/10 text-[#008000] font-semibold text-xs">
            View Profile <ArrowRight01Icon size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function LogisticsList({ initialCompanies }: LogisticsListProps) {
  const [search, setSearch] = useState("");
  const companies = Array.isArray(initialCompanies) ? initialCompanies : [];

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return companies;

    return companies.filter((company) => {
      return [
        company.name,
        company.description,
        company.service_types,
        company.coverage_area,
        company.delivery_options,
        company.contact_person,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [companies, search]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-[#008000] font-bold">Logistics Partners</p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Choose the best logistics services</h1>
          </div>

          <div className="w-full sm:w-[420px]">
            <label className="relative block">
              <span className="sr-only">Search logistics companies</span>
              <Search02Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, service, or area"
                className="w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-[#008000] focus:ring-4 focus:ring-[#008000]/10"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <LogisticsCard key={company.id} company={company} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-gray-200 bg-gray-50">
              <p className="text-lg font-semibold text-gray-900">No logistics services found.</p>
              <p className="mt-3 text-sm text-gray-600">Try a different search term or check back later.</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
