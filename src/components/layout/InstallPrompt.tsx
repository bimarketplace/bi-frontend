'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Download01Icon, 
  Cancel01Icon, 
  Share01Icon, 
  PlusSignIcon,
  SmartPhone01Icon
} from 'hugeicons-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the prompt in the last 7 days
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed_at');
    if (lastDismissed) {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(lastDismissed) < sevenDaysInMs) {
        return;
      }
    }

    // Detect iOS and standalone mode
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandaloneMode = ('standalone' in (window as any).navigator) && (window as any).navigator.standalone;

    setIsIos(isIosDevice);
    setIsStandalone(isStandaloneMode);

    // If it's iOS and not in standalone mode, show our custom instruction prompt
    if (isIosDevice && !isStandaloneMode) {
      setShowPrompt(true);
    }

    // Listen for beforeinstallprompt event (non-iOS browsers)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandaloneMode) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      localStorage.setItem('pwa_prompt_installed_at', Date.now().toString());
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="relative bg-white/90 backdrop-blur-2xl px-6 py-6 rounded-[32px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-primary-600/[0.05]">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-primary-950 hover:bg-zinc-100 rounded-full transition-all"
          aria-label="Dismiss"
        >
          <Cancel01Icon size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 relative rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <Image 
              src="/icon512_rounded.png"
              alt="App Icon"
              fill
              className="object-cover"
            />
          </div>
          <div className="pr-8">
            <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-none mb-2 mt-1">
              {isIos ? 'Install App on iPhone' : 'BIMARKETPLACE'}
            </h3>
            <p className="text-sm font-medium text-zinc-500 leading-snug">
              {isIos 
                ? 'Install our app for a faster, better mobile experience!' 
                : 'Install our web app on your device for quick access anytime!'}
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="mt-6 space-y-4">
            <div className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100/50">
              <div className="flex items-center gap-3 text-sm font-bold text-zinc-800 mb-3">
                <SmartPhone01Icon size={18} />
                How to install:
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
                  <div className="w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-[10px] text-zinc-900">1</div>
                  Tap the <Share01Icon size={16} className="text-blue-500 mx-0.5" /> Share icon in the bottom menu.
                </li>
                <li className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
                  <div className="w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm text-[10px] text-zinc-900">2</div>
                  Select <PlusSignIcon size={16} className="text-zinc-900 mx-0.5" /> 'Add to Home Screen' from the menu.
                </li>
              </ul>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-3.5 bg-[#008000] text-white rounded-2xl font-black text-sm tracking-tight hover:bg-zinc-800 transition-all shadow-xl shadow-primary-900/10 flex items-center justify-center gap-2"
            >
              Okay, I got it
            </button>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3.5 bg-zinc-50 text-zinc-600 rounded-2xl font-bold text-sm tracking-tight hover:bg-zinc-100 transition-all"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-[1.5] py-3.5 bg-[#008000] text-white rounded-2xl font-black text-sm tracking-tight hover:bg-zinc-800 transition-all shadow-xl shadow-primary-900/10 flex items-center justify-center gap-2"
            >
              <Download01Icon size={20} />
              Install Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}