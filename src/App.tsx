import { useEffect, useState } from 'react';
import {
  BookmarkCheck,
  Camera,
  Download,
  Smartphone,
  Users,
  WifiOff,
} from 'lucide-react';
import { AndroidInstallView } from './components/AndroidInstallView.tsx';
import { CommunityFeed } from './components/CommunityFeed.tsx';
import { SavedItemsView } from './components/SavedItemsView.tsx';
import { ScanSection } from './components/ScanSection.tsx';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall.ts';
import type { CommunityPost, EwasteAnalysis, SavedScanItem } from './types.ts';

type ActiveTab = 'scan' | 'community' | 'saved' | 'android';

const STORAGE_KEY = 'recircuit_saved_items_v1';

function loadSavedItems(): SavedScanItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scan');
  const [savedItems, setSavedItems] = useState<SavedScanItem[]>(() => loadSavedItems());
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [postedIds, setPostedIds] = useState<Record<string, boolean>>({});
  const [isPosting, setIsPosting] = useState(false);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postError, setPostError] = useState('');

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'community' || tabParam === 'saved' || tabParam === 'android') {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [savedItems]);

  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      setIsLoadingPosts(true);
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Could not load community posts.');
        const data = await res.json();
        if (!cancelled && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch {
        // Keep empty list gracefully if offline
      } finally {
        if (!cancelled) setIsLoadingPosts(false);
      }
    }
    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalysisComplete = ({
    imageUrl,
    analysis,
    userNote,
  }: {
    imageUrl: string;
    analysis: EwasteAnalysis;
    userNote?: string;
  }) => {
    const id = `scan-${Date.now()}`;
    const newItem: SavedScanItem = {
      id,
      imageUrl,
      createdAt: new Date().toISOString(),
      userNote,
      completedSteps: [],
      analysis,
    };
    setSavedItems((prev) => [newItem, ...prev.slice(0, 24)]);
    setActiveScanId(id);
    return id;
  };

  const handleToggleStep = (itemId: string, stepKey: string) => {
    setSavedItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.completedSteps.includes(stepKey);
        return {
          ...item,
          completedSteps: exists
            ? item.completedSteps.filter((k) => k !== stepKey)
            : [...item.completedSteps, stepKey],
        };
      })
    );
  };

  const handleDeleteSavedItem = (itemId: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
    if (activeScanId === itemId) {
      setActiveScanId(null);
    }
  };

  const activeScan = savedItems.find((item) => item.id === activeScanId) || null;

  const handlePostToCommunity = async (authorName: string) => {
    if (!activeScan) return;
    setIsPosting(true);
    setPostError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          userNote: activeScan.userNote,
          imageUrl: activeScan.imageUrl,
          analysis: activeScan.analysis,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not publish post.');
      }
      setPosts((prev) => [data.post as CommunityPost, ...prev]);
      setPostedIds((prev) => ({ ...prev, [activeScan.id]: true }));
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to publish post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleHelpfulVote = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, helpfulCount: p.helpfulCount + 1 } : p))
    );
    try {
      await fetch(`/api/posts/${encodeURIComponent(postId)}/helpful`, {
        method: 'POST',
      });
    } catch {
      // Optimistic count remains responsive
    }
  };

  const handlePrimaryInstallAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setActiveTab('android');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F6] text-slate-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-12 md:h-16 bg-white/95 backdrop-blur-md border-b border-[#E4E7E2]">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
          >
            ReCircuit
          </button>

          {/* Zone 2: 4 Single-line Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'scan'
                  ? 'border-[#0F766E] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan E-Waste
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'community'
                  ? 'border-[#0F766E] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Community Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'border-[#0F766E] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              My Items ({savedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'android'
                  ? 'border-[#0F766E] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Android App
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            {!isInstalled ? (
              <button
                type="button"
                onClick={handlePrimaryInstallAction}
                className="min-h-[36px] md:min-h-[40px] px-3.5 md:px-4 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs md:text-sm font-semibold hover:bg-[#0D655E] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstallable ? 'Install App' : 'Get Android App'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveScanId(null);
                  setActiveTab('scan');
                }}
                className="min-h-[36px] md:min-h-[40px] px-3.5 md:px-4 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs md:text-sm font-semibold hover:bg-[#0D655E] transition-colors whitespace-nowrap shrink-0"
              >
                New Scan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-24 md:pb-12">
        {postError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {postError}
          </div>
        )}

        {activeTab === 'scan' && (
          <ScanSection
            onAnalysisComplete={handleAnalysisComplete}
            activeScan={activeScan}
            onToggleStep={handleToggleStep}
            onPostToCommunity={handlePostToCommunity}
            isPosted={activeScan ? !!postedIds[activeScan.id] : false}
            isPosting={isPosting}
            onResetScan={() => setActiveScanId(null)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeed
            posts={posts}
            isLoading={isLoadingPosts}
            onHelpful={handleHelpfulVote}
            onGoToScan={() => {
              setActiveScanId(null);
              setActiveTab('scan');
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedItemsView
            items={savedItems}
            onToggleStep={handleToggleStep}
            onDeleteItem={handleDeleteSavedItem}
            onGoToScan={() => {
              setActiveScanId(null);
              setActiveTab('scan');
            }}
          />
        )}

        {activeTab === 'android' && (
          <AndroidInstallView
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            isIOS={isIOS}
            onInstall={install}
          />
        )}
      </main>

      {/* Desktop Quiet Footer */}
      <footer className="hidden md:block border-t border-[#E4E7E2] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-slate-500">
          <span>ReCircuit · Practical at-home e-waste reuse &amp; safety guides</span>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className="text-slate-700 hover:text-slate-900 font-medium underline-offset-2 hover:underline"
          >
            Install on Android or Download APK Kit
          </button>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Thumb-Zone Tab Bar (60px height) */}
      <nav
        aria-label="Primary mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E7E2] pb-safe"
      >
        <div className="grid grid-cols-4 h-[60px]">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'scan' ? 'text-[#0F766E]' : 'text-slate-500'
            }`}
          >
            <Camera className="w-5 h-5" strokeWidth={activeTab === 'scan' ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-tight">Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'community' ? 'text-[#0F766E]' : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5" strokeWidth={activeTab === 'community' ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-tight">Community</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'saved' ? 'text-[#0F766E]' : 'text-slate-500'
            }`}
          >
            <BookmarkCheck className="w-5 h-5" strokeWidth={activeTab === 'saved' ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-tight">
              Saved ({savedItems.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'android' ? 'text-[#0F766E]' : 'text-slate-500'
            }`}
          >
            <Smartphone className="w-5 h-5" strokeWidth={activeTab === 'android' ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium tracking-tight">Android</span>
          </button>
        </div>
      </nav>

      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-800 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Offline — Saved items remain available</span>
        </div>
      )}
    </div>
  );
}
