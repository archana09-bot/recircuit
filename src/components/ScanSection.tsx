import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, RotateCcw, ArrowRight } from 'lucide-react';
import { compressImageFile, compressImageFromUrl } from '../utils/imageCompress.ts';
import type { EwasteAnalysis } from '../types.ts';
import { AnalysisView } from './AnalysisView.tsx';
import { ResilientImage } from './ResilientImage.tsx';

interface ScanSectionProps {
  onAnalysisComplete: (data: {
    imageUrl: string;
    analysis: EwasteAnalysis;
    userNote?: string;
  }) => string; // returns saved item id
  activeScan: {
    id: string;
    imageUrl: string;
    analysis: EwasteAnalysis;
    userNote?: string;
    completedSteps: string[];
  } | null;
  onToggleStep: (itemId: string, stepKey: string) => void;
  onPostToCommunity: (authorName: string) => Promise<void>;
  isPosted: boolean;
  isPosting: boolean;
  onResetScan: () => void;
}

const SAMPLE_PHOTOS = [
  {
    label: 'Old Wi-Fi Router',
    url: '/src/assets/images/ewaste_post_router_1794824458958.jpg',
    note: 'Old router from my closet, works electrically but outdated speed.',
  },
  {
    label: 'Frayed Cable & Earbuds',
    url: '/src/assets/images/ewaste_post_earbuds_1794824460282.jpg',
    note: 'Left earbud is dead and charging cable jacket split near the plug.',
  },
  {
    label: 'Keyboard & Mouse',
    url: '/src/assets/images/ewaste_post_keyboard_1794824460002.jpg',
    note: 'Missing one keycap and scroll wheel skips.',
  },
];

export const ScanSection: React.FC<ScanSectionProps> = ({
  onAnalysisComplete,
  activeScan,
  onToggleStep,
  onPostToCommunity,
  isPosted,
  isPosting,
  onResetScan,
}) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [note, setNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    try {
      const compressed = await compressImageFile(file);
      setPreviewUrl(compressed.dataUrl);
      setImageBase64(compressed.base64);
      setMimeType(compressed.mimeType);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not read image file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleLoadSample = async (sample: (typeof SAMPLE_PHOTOS)[number]) => {
    setErrorMsg('');
    try {
      const compressed = await compressImageFromUrl(sample.url);
      setPreviewUrl(compressed.dataUrl);
      setImageBase64(compressed.base64);
      setMimeType(compressed.mimeType);
      setNote(sample.note);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load sample image.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setErrorMsg('Please take or select a photo of your e-waste first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/analyze-ewaste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          note: note.trim(),
        }),
      });

      const rawText = await response.text();
      let data: { analysis?: EwasteAnalysis; error?: string } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        // Handle non-JSON 502/503 proxy responses gracefully
      }
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(
            data.error ||
              'The AI recognition service is temporarily busy (503). Please tap Try Again in a moment.'
          );
        }
        throw new Error(data.error || 'Could not recognize e-waste from this photo.');
      }

      if (!data.analysis) {
        throw new Error('Could not read recognition result. Please try again.');
      }

      onAnalysisComplete({
        imageUrl: previewUrl,
        analysis: data.analysis,
        userNote: note.trim() || undefined,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong while analyzing your photo.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartNew = () => {
    setPreviewUrl('');
    setImageBase64('');
    setNote('');
    setErrorMsg('');
    onResetScan();
  };

  if (activeScan) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              Your At-Home E-Waste Plan
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Practical steps you can complete right at home.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartNew}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another Item
          </button>
        </div>

        <AnalysisView
          imageUrl={activeScan.imageUrl}
          analysis={activeScan.analysis}
          userNote={activeScan.userNote}
          completedSteps={activeScan.completedSteps}
          onToggleStep={(stepKey) => onToggleStep(activeScan.id, stepKey)}
          onPostToCommunity={onPostToCommunity}
          isPosted={isPosted}
          isPosting={isPosting}
          isSaved={true}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
      {/* Primary Scanner & Photo Upload Column */}
      <div className="lg:col-span-7 bg-white border border-[#E4E7E2] rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-teal-800">
            No recycling center needed
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight text-balance">
            Post a photo of your old electronics
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Take a quick picture of broken cables, dead phones, routers, or small gadgets. AI identifies what it is and gives you safe DIY ways to reuse, harvest parts, or handle it at home.
          </p>

          {/* Hidden native inputs for Android Camera & Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-[#F7F8F6] p-5 sm:p-7 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-slate-900">
                Snap or upload an e-waste photo
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Works best in bright indoor light with the item laid flat.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0D655E] active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <ImagePlus className="w-4 h-4" />
                  Choose Photo
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80">
                <p className="text-xs text-slate-500 mb-2.5">Or try an example item:</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-teal-600 hover:text-teal-800 transition-colors whitespace-nowrap"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] max-h-[320px] w-full">
                <ResilientImage
                  src={previewUrl}
                  alt="Selected e-waste item preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setImageBase64('');
                  }}
                  className="absolute top-3 right-3 min-h-[40px] px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-semibold shadow-sm hover:bg-white transition-colors"
                >
                  Change Photo
                </button>
              </div>

              <div>
                <label htmlFor="ewaste-note" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Optional note (helps AI tailor your DIY steps)
                </label>
                <input
                  id="ewaste-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Battery won't hold a charge, screen cracked, cord frayed..."
                  maxLength={140}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-[#0F766E] text-white text-sm sm:text-base font-semibold hover:bg-[#0D655E] disabled:opacity-70 active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recognizing E-Waste & Preparing Home Steps...
                  </>
                ) : (
                  <>
                    Identify & Get Home Steps
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <span>{errorMsg}</span>
              {imageBase64 && !isAnalyzing && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Visual Context & Simple 3-Step Overview */}
      <div className="lg:col-span-5 bg-white border border-[#E4E7E2] rounded-2xl overflow-hidden flex flex-col">
        <div className="aspect-[4/3] lg:h-56 w-full bg-slate-100 shrink-0">
          <ResilientImage
            src="/src/assets/images/ewaste_hero_workbench_1794824459368.jpg"
            alt="Household e-waste items laid out neatly on a workbench with screwdriver and gloves"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              How ReCircuit works at home
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Built for quick, safe decisions without driving across town to a drop-off center.
            </p>
          </div>

          <ol className="space-y-4 border-t border-slate-100 pt-4">
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-teal-800 mt-0.5 tabular-nums">
                01
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Snap the item</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Use your Android camera or photo gallery to upload any gadget, cord, or battery.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-teal-800 mt-0.5 tabular-nums">
                02
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Check safety first</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  See immediately whether it is safe to open at home or needs sealed containment.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-teal-800 mt-0.5 tabular-nums">
                03
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Follow DIY steps & share</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Repurpose it, harvest magnets or power bricks, and post your find to help others.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
