import React, { useState } from 'react';
import { CheckCircle2, Download, FileArchive, Smartphone } from 'lucide-react';

interface AndroidInstallViewProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const AndroidInstallView: React.FC<AndroidInstallViewProps> = ({
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}) => {
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    const ok = await onInstall();
    if (ok) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
          Get ReCircuit on Your Android Phone
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Install ReCircuit directly onto your Android home screen as a native-style app, or download the Android APK Builder Kit to compile a standalone <span className="font-mono text-xs">.apk</span> package.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Option 1: Direct Android WebAPK Install */}
        <section className="bg-white border border-[#E4E7E2] rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Instant Install on Android (WebAPK)
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Google Chrome on Android converts ReCircuit into a standalone Android WebAPK with its own app icon, full-screen camera scanner, and offline saved guides — no Play Store or cable required.
            </p>

            <ol className="mt-5 space-y-2.5 text-sm text-slate-700 border-t border-slate-100 pt-4">
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-teal-800 mt-0.5 tabular-nums">01</span>
                <span>Open this page in Google Chrome on your Android phone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-teal-800 mt-0.5 tabular-nums">02</span>
                <span>
                  Tap <strong>Install App</strong> below (or open Chrome&apos;s <span className="font-mono">⋮</span> menu and tap <strong>Add to Home screen → Install</strong>).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-teal-800 mt-0.5 tabular-nums">03</span>
                <span>Launch ReCircuit from your Android app drawer like any installed app.</span>
              </li>
            </ol>
          </div>

          <div className="pt-2">
            {isInstalled || installSuccess ? (
              <div className="min-h-[48px] px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-semibold inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                Installed on this device
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0D655E] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install Android App Now
              </button>
            ) : isIOS ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700">
                On iPhone/iPad Safari: tap the <strong>Share</strong> icon and choose{' '}
                <strong>Add to Home Screen</strong>.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700">
                When opened in Chrome on Android, an instant install prompt appears automatically, or tap Chrome&apos;s <strong>⋮</strong> menu → <strong>Install app</strong>.
              </div>
            )}
          </div>
        </section>

        {/* Option 2: Downloadable Android APK Builder Kit */}
        <section className="bg-white border border-[#E4E7E2] rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <FileArchive className="w-5 h-5" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Download Android APK Builder Kit (.zip)
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Need a standalone <span className="font-mono text-xs">.apk</span> file to sideload or share? Download this pre-configured Bubblewrap &amp; Capacitor Android project archive wired to your live ReCircuit app.
            </p>

            <div className="mt-5 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Included inside the kit:</p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">·</span>
                  <span>
                    <span className="font-mono text-slate-800">twa-manifest.json</span> — prefilled Android Trusted Web Activity config
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">·</span>
                  <span>
                    <span className="font-mono text-slate-800">capacitor.config.json</span> — ready for Android Studio APK builds
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">·</span>
                  <span>
                    <span className="font-mono text-slate-800">build-apk.sh</span> — builds <span className="font-mono">app-release-signed.apk</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <a
            href="/api/android-apk-kit"
            download="recircuit-android-apk-kit.zip"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download APK Builder Kit (.zip)
          </a>
        </section>
      </div>
    </div>
  );
};
