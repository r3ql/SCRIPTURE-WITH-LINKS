import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        title="Install Scripture With Links to Phone or Desktop"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Download App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shrink-0"
          title="Install to iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-600" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-stone-900 font-display-sacred">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed space-y-2">
                1. Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.<br />
                2. Scroll down the menu and tap <strong>Add to Home Screen</strong>.<br />
                3. Tap <strong>Add</strong> in the top right corner.
              </p>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                📱 This will install Scripture With Links as a standalone app with full offline capabilities on your phone.
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-amber-900 py-2.5 text-xs font-bold text-white hover:bg-amber-800 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't trigger prompt yet
  return (
    <button
      onClick={() => {
        alert(
          'To install SCRIPTURE WITH LINKS on your phone or computer:\n\n• On Chrome/Android: Tap browser menu (⋮) -> "Install App" or "Add to Home screen"\n• On iOS Safari: Tap Share -> "Add to Home Screen"'
        );
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shrink-0"
      title="Install PWA to Device"
    >
      <Smartphone className="w-3.5 h-3.5 text-stone-600" />
      <span className="hidden xl:inline">Download App</span>
    </button>
  );
};
