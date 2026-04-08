"use client";

import React, { useState, useEffect } from "react";
import { WifiOff01Icon, ReloadIcon } from "hugeicons-react";

const OfflineFallback = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-[#008000]/5 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-[#008000]/10 rounded-3xl flex items-center justify-center text-[#008000]">
            <WifiOff01Icon size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic uppercase">
          No Connection
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! It seems you&apos;re disconnected. Please check your internet connection to continue browsing the marketplace.
        </p>

        <button
          onClick={handleRetry}
          className="w-full bg-[#008000] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#006000] transition-all shadow-xl shadow-[#008000]/20 active:scale-95"
        >
          <ReloadIcon size={20} className="animate-spin-slow" />
          Try Again
        </button>

        <div className="mt-8 pt-8 border-t border-gray-100 italic">
          <span className="text-sm font-black text-gray-400">BIMARKETPLACE</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
