"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogisticsCompany } from "@/lib/logistics";
import { Container } from "@/components/layout/Container";
import { Search02Icon, TruckIcon, Location01Icon } from "hugeicons-react";
import { useSession } from "next-auth/react";

interface LogisticsListProps {
  initialCompanies: LogisticsCompany[];
}

const LogisticsCard = ({ company }: { company: LogisticsCompany }) => {
  return (
    <Link
      href={`/logistics/${company.id}`}
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f7f9] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#008000]/10 to-white" />
        {company.logo_url ? (
          <Image
            src={company.logo_url.replace("http://", "https://")}
            alt={company.name}
            width={200}
            height={125}
            unoptimized
            className="relative object-contain h-full w-full p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <TruckIcon size={54} className="relative text-[#008000]/80 transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        {/* Logistics Title / Name */}
        <h3 className="text-[17px] truncate font-bold text-gray-900 line-clamp-2 leading-snug hover:underline uppercase">
          {company.name}
        </h3>

        {/* Description / Location */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500 font-medium line-clamp-2">
            {company.description || "Reliable and verified logistics service."}
          </span>
          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
            <Location01Icon size={14} />
            <span className="truncate">{company.pickup_address || "No pickup address provided"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="w-full text-center text-sm bg-[#f5f5f5] text-gray-900 py-2.5 rounded-xl group-hover:bg-[#006000] hover:text-white transition-colors font-bold hover:shadow-sm">
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function LogisticsList({ initialCompanies }: LogisticsListProps) {
  const { data: session } = useSession();
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

  const isEmptyState = filteredCompanies.length === 0;

  return (
    <div className={`w-full bg-white min-h-screen transition-all duration-300 ${session && !((session.user as any)?.is_verified ?? (session.user as any)?.email_verified ?? true) ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-[90px]'}`}>
      <Container className="mt-2 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-5 ">Find the best logistics partners</h1>
        
        {/* Search Bar Container */}
        <div className="mx-auto ">
          <div className="flex items-center w-full max-w-2xl bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden">
            <input
              type="text"
              placeholder="Search by name, service, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
            />
            <div
              className="text-black px-5 h-full flex items-center justify-center shrink-0"
            >
              <Search02Icon size={20} />
            </div>
          </div>
        </div>

        <div className="w-full mt-8">
          {isEmptyState ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No logistics services found</h3>
              <p className="text-sm text-gray-500">Try a different search term or check back later.</p>
            </div>
          ) : (
            <div className={`grid gap-6 justify-items-center transition-all duration-300 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full`}>
              {filteredCompanies.map((company) => (
                <LogisticsCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

