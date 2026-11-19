import React, { useState } from 'react';
import {
  AlertTriangle,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type { EwasteAnalysis, HazardLevel } from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface AnalysisViewProps {
  imageUrl: string;
  analysis: EwasteAnalysis;
  userNote?: string;
  completedSteps: string[];
  onToggleStep: (stepKey: string) => void;
  onPostToCommunity?: (authorName: string) => Promise<void>;
  isPosted?: boolean;
  isPosting?: boolean;
  isSaved?: boolean;
  onSaveItem?: () => void;
}

function getHazardMeta(level: HazardLevel) {
  if (level === 'High Caution') {
    return {
      icon: ShieldAlert,
      textClass: 'text-red-700',
      surfaceClass: 'bg-red-50/70 border-red-200',
      label: 'High Caution — Follow Safety Containment',
    };
  }
  if (level === 'Handle with Care') {
    return {
      icon: AlertTriangle,
      textClass: 'text-amber-800',
      surfaceClass: 'bg-amber-50/70 border-amber-200',
      label: 'Handle with Care',
    };
  }
  return {
    icon: ShieldCheck,
    textClass: 'text-teal-800',
    surfaceClass: 'bg-teal-50/60 border-teal-200',
    label: 'Safe to Handle at Home',
  };
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  imageUrl,
  analysis,
  userNote,
  completedSteps,
  onToggleStep,
  onPostToCommunity,
  isPosted = false,
  isPosting = false,
  isSaved = false,
  onSaveItem,
}) => {
  const [activeMethodIdx, setActiveMethodIdx] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);

  const hazardMeta = getHazardMeta(analysis.hazardLevel);
  const HazardIcon = hazardMeta.icon;
  const activeMethod = analysis.diyMethods[activeMethodIdx] || analysis.diyMethods[0];

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPostToCommunity) return;
    await onPostToCommunity(authorName);
    setShowPostForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E4E7E2] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-5 bg-slate-100 relative min-h-[220px]">
            <ResilientImage
              src={imageUrl}
              alt={analysis.itemName}
              className="w-full h-full object-cover max-h-[320px] md:max-h-none"
            />
          </div>

          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
                <span>{analysis.category}</span>
                <span aria-hidden="true">·</span>
                <span>{analysis.confidence} match</span>
                <span aria-hidden="true">·</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${hazardMeta.textClass}`}>
                  <HazardIcon className="w-3.5 h-3.5" strokeWidth={2} />
                  {analysis.hazardLevel}
                </span>
              </div>

              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 leading-tight text-balance">
                {analysis.itemName}
              </h2>

              <p className="mt-2 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {analysis.summary}
              </p>

              {userNote && (
                <p className="mt-3 text-xs text-slate-500">
                  Your note: <span className="text-slate-700">{userNote}</span>
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {onSaveItem && (
                <button
                  type="button"
                  onClick={onSaveItem}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                    isSaved
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {isSaved ? 'Saved Offline' : 'Save to My Items'}
                </button>
              )}

              {onPostToCommunity && !isPosted && (
                <button
                  type="button"
                  onClick={() => setShowPostForm((prev) => !prev)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium bg-[#0F766E] text-white hover:bg-[#0D655E] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                  Post to Community
                </button>
              )}

              {isPosted && (
                <span className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-teal-800">
                  <CheckCircle2 className="w-4 h-4" />
                  Posted to Community Feed
                </span>
              )}
            </div>

            {showPostForm && onPostToCommunity && !isPosted && (
              <form onSubmit={handlePublish} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your first name (optional)"
                  maxLength={32}
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <button
                  type="submit"
                  disabled={isPosting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                >
                  {isPosting ? 'Publishing...' : 'Publish Photo & Guide'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Safety Warnings Banner */}
      {analysis.safetyWarnings.length > 0 && (
        <div className={`rounded-2xl border p-4 sm:p-5 ${hazardMeta.surfaceClass}`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <HazardIcon className={`w-4 h-4 shrink-0 ${hazardMeta.textClass}`} />
            <span>{hazardMeta.label}</span>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-sm text-slate-700">
            {analysis.safetyWarnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="font-mono text-xs text-slate-500 mt-1 tabular-nums">{i + 1}.</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DIY Methods You Can Do Yourself (No Recycling Center Needed) */}
      {analysis.diyMethods.length > 0 && (
        <section className="bg-white border border-[#E4E7E2] rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Do-It-Yourself Home Options
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                No recycling center trip required — tap any step to check it off.
              </p>
            </div>

            {analysis.diyMethods.length > 1 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
                {analysis.diyMethods.map((method, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMethodIdx(idx)}
                    className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      activeMethodIdx === idx
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Option {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeMethod && (
            <div className="pt-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800 font-medium">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{activeMethod.effort}</span>
                  {activeMethod.toolsNeeded.length > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-600">
                        Tools: {activeMethod.toolsNeeded.join(', ')}
                      </span>
                    </>
                  )}
                </div>
                <h4 className="mt-1.5 text-lg font-semibold text-slate-900">
                  {activeMethod.title}
                </h4>
                <p className="mt-1 text-sm text-slate-600">{activeMethod.outcome}</p>
              </div>

              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {activeMethod.steps.map((step, sIdx) => {
                  const stepKey = `${activeMethodIdx}-${sIdx}`;
                  const checked = completedSteps.includes(stepKey);
                  return (
                    <button
                      key={stepKey}
                      type="button"
                      onClick={() => onToggleStep(stepKey)}
                      className="w-full min-h-[52px] py-3.5 px-1 flex items-start gap-3.5 text-left hover:bg-slate-50/80 transition-colors"
                    >
                      <span
                        className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? 'bg-[#0F766E] border-[#0F766E] text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                      <span
                        className={`text-sm sm:text-[15px] leading-relaxed ${
                          checked ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                          {String(sIdx + 1).padStart(2, '0')}
                        </span>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Safe At-Home Prep & Reusable Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E4E7E2] rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900">
            Safe At-Home Prep & Storage
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            If the item cannot be reused right away, keep it safe at home:
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
            {analysis.safeAtHomePrep.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="font-mono text-xs text-teal-700 mt-1 tabular-nums">
                  {idx + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-[#E4E7E2] rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900">
            Useful Parts Worth Keeping
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Components inside this item you can save for home fixes or crafts:
          </p>
          <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
            {analysis.reusableParts.map((part, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm text-slate-800">
                <span>{part}</span>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
