"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LogisticsCompany } from "@/lib/logistics";
import { Container } from "@/components/layout/Container";
import { ArrowLeft02Icon, Location01Icon, TruckIcon, Link01Icon, MailIcon, Phone01Icon } from "hugeicons-react";

export default function LogisticsProfile({ company }: { company: LogisticsCompany }) {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/logistics" className="inline-flex items-center gap-2 text-sm font-semibold text-[#008000] hover:text-[#005500] mb-6">
            <ArrowLeft02Icon size={18} /> Back to logistics services
          </Link>

          <div className="overflow-hidden rounded-[32px] border border-gray-200 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-0 lg:gap-8">
              <div className="relative bg-[#F0FDF4] p-10">
                <div className="flex flex-col items-start gap-6">
                  <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ECFDF3] text-[#047857]">
                        <TruckIcon size={26} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#047857] font-bold">Logistics Company</p>
                        <h1 className="text-3xl font-black text-gray-900 mt-2">{company.name}</h1>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-white border border-gray-100 p-6 shadow-sm w-full">
                    <div className="grid gap-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Location01Icon size={20} className="text-[#008000]" />
                        <p className="text-sm">{company.pickup_address || "No pickup address specified."}</p>
                      </div>
                      {company.coverage_area ? (
                        <div className="flex items-center gap-3 text-gray-600">
                          <TruckIcon size={20} className="text-[#008000]" />
                          <p className="text-sm">Coverage: {company.coverage_area}</p>
                        </div>
                      ) : null}
                      {company.estimated_delivery_time ? (
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]">⏱️</span>
                          <p className="text-sm">Est. delivery: {company.estimated_delivery_time}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-white border border-gray-100 p-6 shadow-sm w-full">
                    <h2 className="text-sm font-bold uppercase tracking-[0.26em] text-[#008000] mb-4">Contact</h2>
                    <div className="space-y-3 text-gray-700">
                      {company.contact_person ? (
                        <p><span className="font-semibold text-gray-900">Contact:</span> {company.contact_person}</p>
                      ) : null}
                      {company.contact_phone ? (
                        <p className="flex items-center gap-2"><Phone01Icon size={16} className="text-[#008000]" />{company.contact_phone}</p>
                      ) : null}
                      {company.contact_email ? (
                        <p className="flex items-center gap-2"><MailIcon size={16} className="text-[#008000]" />{company.contact_email}</p>
                      ) : null}
                      {company.website ? (
                        <p className="flex items-center gap-2"><Link01Icon size={16} className="text-[#008000]" /><a href={company.website} target="_blank" rel="noreferrer" className="underline text-[#064E3B]">Visit website</a></p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 lg:p-14">
                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#008000]">About</p>
                    <p className="mt-4 text-gray-700 leading-8">{company.description || "No company description available yet. Please contact them for full service details."}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {company.service_types ? (
                      <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-6">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Service types</p>
                        <p className="text-sm text-gray-600">{company.service_types}</p>
                      </div>
                    ) : null}

                    {company.delivery_options ? (
                      <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-6">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Delivery options</p>
                        <p className="text-sm text-gray-600">{company.delivery_options}</p>
                      </div>
                    ) : null}
                  </div>

                  {company.pricing_notes ? (
                    <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Pricing notes</p>
                      <p className="text-sm text-gray-600">{company.pricing_notes}</p>
                    </div>
                  ) : null}

                  <div className="rounded-[32px] border border-gray-100 bg-[#F8FAFC] p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#008000]">Status</p>
                        <p className="mt-2 text-lg font-bold text-gray-900">{company.is_active ? "Active" : "Not Active"}</p>
                      </div>
                      <div className={`rounded-full px-4 py-2 text-sm font-semibold ${company.tracking_available ? "bg-[#ECFDF5] text-[#166534]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                        {company.tracking_available ? "Tracking available" : "Tracking unavailable"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
