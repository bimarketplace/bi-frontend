"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LogisticsCompany } from "@/lib/logistics";
import { Container } from "@/components/layout/Container";
import { Location01Icon, TruckIcon, Link01Icon, AiMailIcon, AiPhone01Icon, InformationCircleIcon } from "hugeicons-react";
import { Avatar } from "@/components/layout/Navbar";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function LogisticsProfile({ company }: { company: LogisticsCompany }) {
  const { data: session } = useSession();

  return (
    <div className={`w-full bg-white min-h-screen transition-all duration-300 ${session && !((session.user as any)?.is_verified ?? (session.user as any)?.email_verified ?? true) ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-[90px]'}`}>
      <Container>
        <div className="w-full">
          <div className="flex items-center gap-4 mb-4">
            {company.logo_url ? (
              <div className="relative h-16 w-16 bg-[#ECFDF3] flex items-center justify-center ring-1 ring-gray-100">
                <Image
                  src={company.logo_url.replace("http://", "https://")}
                  alt={company.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <Avatar 
                name={company.name.charAt(0).toUpperCase()} 
                size="lg"
                variant="light"
                className="ring-1 ring-gray-100 rounded-none"
              />
            )}
            
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 uppercase">
                {company.name}
              </span>
              <span className="text-sm font-medium text-gray-500">
                Logistics Partner
              </span>
              {company.pickup_address && (
                <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                  <Location01Icon size={14} />
                  <span className="text-xs font-medium">
                    {company.pickup_address}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 my-4">
            <button
              onClick={() => {
                const url = `${window.location.origin}/logistics/${company.id}`;
                const message = `🚚 Check out ${company.name} on BI Marketplace! Browse their services here: ${url}`;
                navigator.clipboard.writeText(message);
                toast.success("Logistics link copied!");
              }}
              className="px-5 py-2.5 cursor-pointer bg-[#f5f5f5] text-gray-900 text-[14px] font-bold rounded-[10px] hover:bg-[#e5e5e5] transition-all"
            >
              Copy Profile Link
            </button>
            {company.contact_phone ? (
              <a 
                href={`https://wa.me/${company.contact_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${company.name}, I am contacting you from BI Marketplace.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 cursor-pointer bg-[#008000] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#006000] transition-all inline-flex items-center justify-center"
              >
                Contact Us
              </a>
            ) : company.contact_email ? (
              <a 
                href={`mailto:${company.contact_email}`}
                className="px-5 py-2.5 cursor-pointer bg-[#008000] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#006000] transition-all inline-flex items-center justify-center"
              >
                Contact Us
              </a>
            ) : null}
          </div>

          <p className="text-sm font-medium text-gray-900 mb-4 whitespace-pre-wrap">
            {company.description || "Reliable and verified logistics service."}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Service Details */}
            <div className="bg-[#fcfcfc] rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <TruckIcon size={18} className="text-[#008000]" /> Services & Coverage
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                {company.service_types && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Service Types</span>
                    {company.service_types}
                  </div>
                )}
                {company.coverage_area && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Coverage Area</span>
                    {company.coverage_area}
                  </div>
                )}
                {company.delivery_options && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Delivery Options</span>
                    {company.delivery_options}
                  </div>
                )}
                {company.estimated_delivery_time && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Estimated Delivery Time</span>
                    {company.estimated_delivery_time}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-[#fcfcfc] rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <AiMailIcon size={18} className="text-[#008000]" /> Contact Information
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                {company.contact_person && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Contact Person</span>
                    {company.contact_person}
                  </div>
                )}
                {company.contact_phone && (
                  <div className="flex items-center gap-2">
                    <AiPhone01Icon size={16} className="text-gray-400" />
                    <span>{company.contact_phone}</span>
                  </div>
                )}
                {company.contact_email && (
                  <div className="flex items-center gap-2">
                    <AiMailIcon size={16} className="text-gray-400" />
                    <span>{company.contact_email}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Link01Icon size={16} className="text-gray-400" />
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-[#008000] hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#fcfcfc] rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <InformationCircleIcon size={18} className="text-[#008000]" /> Additional Information
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                {company.pricing_notes && (
                  <div>
                    <span className="block font-semibold text-gray-900 mb-1">Pricing Notes</span>
                    {company.pricing_notes}
                  </div>
                )}
                <div>
                  <span className="block font-semibold text-gray-900 mb-2">Status</span>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${company.is_active ? "bg-[#008000]/10 text-[#008000]" : "bg-red-100 text-red-700"}`}>
                      {company.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${company.tracking_available ? "bg-[#008000]/10 text-[#008000]" : "bg-gray-100 text-gray-700"}`}>
                      {company.tracking_available ? "Tracking Available" : "Tracking Unavailable"}
                    </span>
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
