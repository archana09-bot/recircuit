import React, { useMemo, useState } from 'react';
import { ChevronRight, ThumbsUp, X } from 'lucide-react';
import type { CommunityPost } from '../types.ts';
import { AnalysisView } from './AnalysisView.tsx';
import { ResilientImage } from './ResilientImage.tsx';

interface CommunityFeedProps {
  posts: CommunityPost[];
  isLoading: boolean;
  onHelpful: (postId: string) => void;
  onGoToScan: () => void;
}

const CATEGORIES = [
  'All',
  'Cables & Chargers',
  'Mobile & Batteries',
  'Audio & Peripherals',
  'Networking & Power',
  'Small Appliances',
  'Computing & Boards',
] as const;

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  isLoading,
  onHelpful,
  onGoToScan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [modalSteps, setModalSteps] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter((p) => p.analysis.category === selectedCategory);
  }, [posts, selectedCategory]);

  const toggleModalStep = (stepKey: string) => {
    setModalSteps((prev) =>
      prev.includes(stepKey) ? prev.filter((k) => k !== stepKey) : [...prev, stepKey]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
            Community E-Waste Feed
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real household electronics posted by people, paired with DIY at-home steps.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToScan}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] text-white text-sm font-medium hover:bg-[#0D655E] transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          Post Your E-Waste
        </button>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-[#E4E7E2] text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-[#E4E7E2] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/2 bg-slate-200 rounded" />
                <div className="h-5 w-4/5 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white border border-[#E4E7E2] rounded-2xl p-8 text-center">
          <p className="text-base font-semibold text-slate-900">
            No posts in {selectedCategory} yet
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Snap a photo of your own item to be the first to share a home guide here.
          </p>
          <button
            type="button"
            onClick={onGoToScan}
            className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] text-white text-sm font-medium hover:bg-[#0D655E] transition-colors"
          >
            Scan an Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const firstMethod = post.analysis.diyMethods[0];
            return (
              <article
                key={post.id}
                className="bg-white border border-[#E4E7E2] rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setModalSteps([]);
                    }}
                    className="block w-full aspect-[4/3] bg-slate-100 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <ResilientImage
                      src={post.imageUrl}
                      alt={post.analysis.itemName}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                    />
                  </button>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>{post.authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.analysis.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          post.analysis.hazardLevel === 'High Caution'
                            ? 'text-red-700 font-medium'
                            : post.analysis.hazardLevel === 'Handle with Care'
                              ? 'text-amber-800 font-medium'
                              : 'text-teal-800 font-medium'
                        }
                      >
                        {post.analysis.hazardLevel}
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-bold text-slate-900 leading-snug">
                      {post.analysis.itemName}
                    </h2>

                    {firstMethod && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        Top DIY fix: {firstMethod.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onHelpful(post.id)}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-teal-700" />
                    <span className="font-mono tabular-nums">{post.helpfulCount}</span>
                    <span>Helpful</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setModalSteps([]);
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 hover:bg-teal-50 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    View DIY Guide
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detail Sheet / Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-[#F7F8F6] w-full max-w-4xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-white">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">
                  Posted by {selectedPost.authorName}
                </p>
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {selectedPost.analysis.itemName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                aria-label="Close guide"
                className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <AnalysisView
                imageUrl={selectedPost.imageUrl}
                analysis={selectedPost.analysis}
                userNote={selectedPost.userNote}
                completedSteps={modalSteps}
                onToggleStep={toggleModalStep}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
