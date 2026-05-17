"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight01Icon, ArrowLeft01Icon, SparklesIcon, SecurityCheckIcon, WhatsappIcon } from "hugeicons-react";

const slides = [
  {
    title: "Premium Tech & Campus Essentials",
    description: "Upgrade your gear with the best deals on electronics, laptop stands, power banks, and accessories from verified peers.",
    badge: "Student Favourites",
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    image: "/assets/images/sale-fast.png",
  },
  {
    title: "100% Verified Local Sellers",
    description: "Shop with absolute peace of mind. Every vendor in our community is vetted to ensure safe, high-quality, and authentic products.",
    badge: "Trusted Commerce",
    gradient: "from-green-600 via-emerald-600 to-cyan-700",
    image: "/assets/images/search_banner.jpg",
  },
  {
    title: "Seamless WhatsApp Checkout",
    description: "Found something you like? Finalize details and order directly through a quick WhatsApp message to the seller with pre-filled details.",
    badge: "Instant Purchase",
    gradient: "from-emerald-600 via-teal-600 to-green-700",
    image: "/assets/images/bi.png",
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const scrollToProducts = () => {
    const productsElement = document.querySelector("#main-content");
    if (productsElement) {
      const offset = 120; // accounting for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = productsElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="relative w-full py-8 md:py-12 bg-white overflow-hidden border-b border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Typography and CTAs */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100/60 w-fit">
            <SparklesIcon size={16} className="text-[#008000] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#008000]">
              The Ultimate Local Marketplace
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Buy & Sell <span className="text-[#008000] bg-gradient-to-r from-[#008000] to-emerald-600 bg-clip-text text-transparent">Effectively</span> in Your Community
          </h1>

          <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
            Discover a curated collection of quality products listed by verified local sellers. Experience secure details, instant checkouts, and direct contact with sellers via WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={scrollToProducts}
              className="px-8 py-4 bg-[#008000] text-white font-black rounded-2xl hover:bg-[#006000] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-700/10 cursor-pointer text-sm tracking-wide"
            >
              Explore Products
              <ArrowRight01Icon size={18} />
            </button>
            <a href="/products/new" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-zinc-50 border border-zinc-200 text-gray-800 font-bold rounded-2xl hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
                Start Selling
              </button>
            </a>
          </div>

          {/* Quick stats / trust highlights */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 max-w-lg mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xl md:text-2xl font-black text-[#008000]">100%</span>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vetted Sellers</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl md:text-2xl font-black text-gray-900">Swift</span>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">WhatsApp checkout</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl md:text-2xl font-black text-gray-900">Safe</span>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Local Pickups</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Carousel */}
        <div 
          className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-green-900/5 group border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides Container */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out flex flex-col justify-end p-6 md:p-8
                    ${isActive ? "opacity-100 translate-x-0 scale-100 z-10" : "opacity-0 translate-x-8 scale-95 z-0 pointer-events-none"}
                  `}
                >
                  {/* Slide Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-95 transition-all duration-700`} />
                  
                  {/* Decorative glassmorphic circle overlays */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

                  {/* Slide Content */}
                  <div className="relative z-20 flex flex-col gap-3 text-left">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white w-fit border border-white/10">
                      {slide.badge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-md">
                      {slide.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-gray-900 active:scale-90 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Previous slide"
          >
            <ArrowLeft01Icon size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-gray-900 active:scale-90 transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Next slide"
          >
            <ArrowRight01Icon size={20} />
          </button>

          {/* Indicators / Pagination Dots */}
          <div className="absolute bottom-6 right-6 md:right-8 z-30 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer
                  ${index === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
