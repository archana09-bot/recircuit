import React, { useState } from 'react';
import { ChevronRight, Trash2, X } from 'lucide-react';
import type { SavedScanItem } from '../types.ts';
import { AnalysisView } from './AnalysisView.tsx';
import { ResilientImage } from './ResilientImage.tsx';

interface SavedItemsViewProps {
  items: SavedScanItem[];
  onToggleStep: (itemId: string, stepKey: string) => void;
  onDeleteItem: (itemId: string) => void;
  onGoToScan: () => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  items,
  onToggleStep,
  onDeleteItem,
  onGoToScan,
}) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const openItem = items.find((item) => item.id === openItemId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
            My Saved E-Waste
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Stored on your device so you can follow DIY steps even without internet.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToScan}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] text-white text-sm font-medium hover:bg-[#0D655E] transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          Scan New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#E4E7E2] rounded-2xl p-8 text-center">
          <p className="text-base font-semibold text-slate-900">No saved items yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Snap a photo of any old electronics in your home to save its DIY disposal and reuse plan offline.
          </p>
          <button
            type="button"
            onClick={onGoToScan}
            className="mt-4 min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] text-white text-sm font-medium hover:bg-[#0D655E] transition-colors"
          >
            Scan Your First Item
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E7E2] rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {items.map((item) => {
            const totalFirstMethodSteps = item.analysis.diyMethods[0]?.steps.length ?? 0;
            const doneCount = item.completedSteps.length;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenItemId(item.id)}
                  className="flex items-center gap-4 min-w-0 flex-1 text-left"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.analysis.itemName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <span>{item.analysis.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {doneCount}/{totalFirstMethodSteps} steps checked
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-bold text-slate-900 truncate">
                      {item.analysis.itemName}
                    </h2>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.analysis.diyMethods[0]?.title || item.analysis.summary}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`Remove ${item.analysis.itemName}`}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenItemId(item.id)}
                    aria-label={`Open ${item.analysis.itemName}`}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpenItemId(null)}
        >
          <div
            className="bg-[#F7F8F6] w-full max-w-4xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-white">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {openItem.analysis.itemName}
              </h3>
              <button
                type="button"
                onClick={() => setOpenItemId(null)}
                aria-label="Close item"
                className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <AnalysisView
                imageUrl={openItem.imageUrl}
                analysis={openItem.analysis}
                userNote={openItem.userNote}
                completedSteps={openItem.completedSteps}
                onToggleStep={(stepKey) => onToggleStep(openItem.id, stepKey)}
                isSaved={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
