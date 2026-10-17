import { useState, useEffect, useMemo } from 'react';
import { TerminalHeader } from './components/TerminalHeader';
import { FilterTabStrip, TabKey } from './components/FilterTabStrip';
import { StatsBar } from './components/StatsBar';
import { IntelCard } from './components/IntelCard';
import { useBookmarks } from './hooks/useBookmarks';
import { IntelEdition, EditionIndexManifest, IntelItem } from './types/intel';
import { Terminal, RefreshCw, AlertTriangle, Filter } from 'lucide-react';

import initialLatest from '../public/data/latest.json';
import initialIndex from '../public/data/index.json';
import initialFlagship from '../public/data/constant_opportunities.json';

// Resilient multi-mirror JSON fetcher (Local -> GitHub Raw -> jsDelivr CDN -> Bundled Fallback)
async function fetchJsonWithFallback<T>(relPath: string, fallbackData?: T): Promise<T> {
  // 1. Try local path first
  try {
    const res = await fetch(`./${relPath.replace(/^\.?\/?/, '')}`, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      // Ensure it's valid JSON and not an HTML redirect or bot challenge
      if (!text.trim().startsWith('<') && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
        return JSON.parse(text);
      }
    }
  } catch (err) {
    console.warn(`Local fetch for ${relPath} bypassed:`, err);
  }

  // 2. Try raw.githubusercontent.com and jsDelivr CDN mirrors
  const cleanPath = relPath.replace(/^\.?\/?/, '');
  const cdnMirrors = [
    `https://raw.githubusercontent.com/r-spandan/beagod/main/public/${cleanPath}`,
    `https://cdn.jsdelivr.net/gh/r-spandan/beagod@main/public/${cleanPath}`
  ];

  for (const cdnUrl of cdnMirrors) {
    try {
      const res = await fetch(cdnUrl, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        if (!text.trim().startsWith('<')) {
          return JSON.parse(text);
        }
      }
    } catch {
      // try next mirror
    }
  }

  if (fallbackData !== undefined) {
    return fallbackData;
  }

  throw new Error(`Failed to load ${relPath} from host or mirrors`);
}

export function App() {
  const [edition, setEdition] = useState<IntelEdition | null>(initialLatest as unknown as IntelEdition);
  const [indexManifest, setIndexManifest] = useState<EditionIndexManifest>(initialIndex as unknown as EditionIndexManifest);
  const [selectedEditionId, setSelectedEditionId] = useState<string>('latest');
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [bookmarkCategoryFilter, setBookmarkCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    exportBookmarksJSON,
    exportBookmarksMD,
    bookmarkCount
  } = useBookmarks();

  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [expandAllVersion, setExpandAllVersion] = useState<number>(0);

  const handleToggleExpandAll = () => {
    setExpandAll((prev) => !prev);
    setExpandAllVersion((v) => v + 1);
  };

  const [flagshipOpportunities, setFlagshipOpportunities] = useState<IntelItem[]>(
    initialFlagship as unknown as IntelItem[]
  );

  // Background refresh of manifest index and flagship opportunities on mount
  useEffect(() => {
    fetchJsonWithFallback<EditionIndexManifest>('data/index.json', initialIndex as unknown as EditionIndexManifest)
      .then((data) => setIndexManifest(data))
      .catch((err) => console.warn('Manifest index notice:', err));

    fetchJsonWithFallback<IntelItem[]>('data/constant_opportunities.json', initialFlagship as unknown as IntelItem[])
      .then((data) => setFlagshipOpportunities(data))
      .catch((err) => console.warn('Flagship opportunities notice:', err));
  }, []);

  // Fetch or refresh edition data based on selection
  useEffect(() => {
    const targetPath = selectedEditionId === 'latest' 
      ? 'data/latest.json'
      : `data/archive/${selectedEditionId}.json`;

    fetchJsonWithFallback<IntelEdition>(targetPath, initialLatest as unknown as IntelEdition)
      .then((data) => {
        setEdition(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.warn('Edition fetch notice:', err);
        if (!edition) {
          setError(err.message || 'Failed to load intelligence feed');
        }
        setLoading(false);
      });
  }, [selectedEditionId]);

  // Compute category counts for current active edition
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: edition?.items.length || 0,
      GEOPOLITICS: 0,
      ECONOMY_FINANCE: 0,
      TECH_ENGINEERING: 0,
      ADULTING_MENTAL_MODELS: 0,
      OPPORTUNITIES: 0,
    };

    if (edition) {
      edition.items.forEach((item) => {
        if (item.category && map[item.category] !== undefined) {
          map[item.category]++;
        }
      });
    }

    return map;
  }, [edition]);

  // Filtered items based on activeTab, search query, and bookmark category filter
  const displayedItems = useMemo(() => {
    let sourceList: IntelItem[] = [];

    if (activeTab === 'BOOKMARKS') {
      sourceList = bookmarks;
      if (bookmarkCategoryFilter !== 'ALL') {
        sourceList = sourceList.filter((item) => item.category === bookmarkCategoryFilter);
      }
    } else if (activeTab === 'FLAGSHIP_FELLOWSHIPS') {
      sourceList = flagshipOpportunities;
    } else {
      if (!edition) return [];
      sourceList = edition.items;
      if (activeTab !== 'ALL') {
        sourceList = sourceList.filter((item) => item.category === activeTab);
      }
    }

    if (!searchQuery.trim()) {
      return sourceList;
    }

    const q = searchQuery.toLowerCase();
    return sourceList.filter((item) => {
      const matchHeadline = item.headline.toLowerCase().includes(q);
      const matchSummary = item.summary_points.some((p) => p.toLowerCase().includes(q));
      const matchWhy = item.why_it_matters.toLowerCase().includes(q);
      const matchDeep = item.deep_dive_analysis?.toLowerCase().includes(q);
      const matchSource = item.side_panel.source_verification.primary_source_name.toLowerCase().includes(q);
      const matchJargon = item.side_panel.jargon_buster?.some((j) => 
        j.term.toLowerCase().includes(q) || j.definition.toLowerCase().includes(q)
      );

      return matchHeadline || matchSummary || matchWhy || matchDeep || matchSource || matchJargon;
    });
  }, [edition, activeTab, bookmarks, bookmarkCategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E2E8F0] font-mono flex flex-col selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
      {/* 1. Terminal Command Header */}
      <TerminalHeader
        currentEdition={edition}
        availableEditions={indexManifest.editions}
        selectedEditionId={selectedEditionId}
        onSelectEdition={setSelectedEditionId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. IDE-Style Filter Tab Strip */}
      <FilterTabStrip
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        bookmarkCount={bookmarkCount}
        flagshipCount={flagshipOpportunities.length}
        onExportJSON={exportBookmarksJSON}
        onExportMD={exportBookmarksMD}
        onClearBookmarks={clearAllBookmarks}
      />

      {/* 3. Pipeline Telemetry / Stats Bar */}
      <StatsBar
        edition={edition}
        filteredCount={displayedItems.length}
        allExpanded={expandAll}
        onToggleExpandAll={handleToggleExpandAll}
      />

      {/* Flagship Fellowships Banner */}
      {activeTab === 'FLAGSHIP_FELLOWSHIPS' && (
        <div className="border-b border-[#1F2330] bg-[#0D0E12] px-3 sm:px-4 py-2.5">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-[#34D399]">
              <span className="font-bold">// PERENNIAL_GLOBAL_FELLOWSHIPS:</span>
              <span className="text-[#E2E8F0]">
                Perpetual flagship scholarships (Erasmus Mundus, Fulbright, DAAD, Commonwealth, MEXT, Chevening) with full funding &amp; annual cycles.
              </span>
            </div>
            <div className="text-[11px] text-[#64748B]">
              DATABASE: <span className="text-[#00E5FF]">constant_opportunities.json</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bookmarks Sub-Filter Bar (When viewing saved_bookmarks.db) */}
      {activeTab === 'BOOKMARKS' && (
        <div className="border-b border-[#1F2330] bg-[#0D0E12]/90 px-3 sm:px-4 py-2">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#FFB800]" />
              <span className="text-[#64748B]">SAVED_DB_FILTER:</span>
              {(['ALL', 'GEOPOLITICS', 'ECONOMY_FINANCE', 'TECH_ENGINEERING', 'ADULTING_MENTAL_MODELS', 'OPPORTUNITIES'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBookmarkCategoryFilter(cat)}
                  className={`px-2 py-0.5 text-[11px] border transition-colors ${
                    bookmarkCategoryFilter === cat
                      ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/10'
                      : 'border-[#1F2330] text-[#64748B] hover:text-[#E2E8F0]'
                  }`}
                >
                  [{cat}]
                </button>
              ))}
            </div>
            <div className="text-[11px] text-[#64748B]">
              PERSISTENCE: <span className="text-[#00FF66]">localStorage (beagod_bookmarks_v1)</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Content Area */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-3 sm:px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <RefreshCw className="w-8 h-8 text-[#00FF66] animate-spin" />
            <div className="text-sm text-[#00FF66]">
              [DECRYPTING_SIGNAL_STREAM...]
            </div>
            <p className="text-xs text-[#64748B]">
              Fetching static intelligence edition from flat-file database...
            </p>
          </div>
        ) : error ? (
          <div className="border border-[#FF3366] bg-[#FF3366]/5 p-6 max-w-xl mx-auto my-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#FF3366] mx-auto" />
            <div className="text-sm font-bold text-[#FF3366]">
              [SIGNAL_RETRIEVAL_FAILED: {error}]
            </div>
            <p className="text-xs text-[#64748B]">
              Please check if the scheduled GitHub Actions pipeline has completed or verify file integrity in <code>public/data/</code>.
            </p>
            <button
              onClick={() => setSelectedEditionId('latest')}
              className="px-3 py-1 bg-[#0D0E12] border border-[#FF3366] text-xs text-[#FF3366] hover:bg-[#FF3366]/20 transition-colors"
            >
              [RETRY_LATEST_STREAM]
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="border border-[#1F2330] bg-[#0D0E12] p-12 text-center my-8 space-y-3">
            <Terminal className="w-8 h-8 text-[#64748B] mx-auto" />
            <div className="text-sm font-bold text-[#FFB800]">
              [NO_RECORDS_MATCH_CRITERIA]
            </div>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              {activeTab === 'BOOKMARKS'
                ? 'No items currently saved in your browser local database. Bookmark any card from the live feed to track it here.'
                : 'No items match your active tab filter or grep query. Try clearing the search query or switching categories.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 bg-[#12141C] border border-[#00FF66] text-xs text-[#00FF66] hover:bg-[#00FF66]/10"
              >
                [CLEAR_SEARCH_FILTER]
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map((item, index) => (
              <IntelCard
                key={`${item.id}-${expandAllVersion}`}
                item={item}
                index={index}
                isBookmarked={isBookmarked(item.id)}
                onToggleBookmark={toggleBookmark}
                onRemoveBookmark={removeBookmark}
                isBookmarkView={activeTab === 'BOOKMARKS'}
                defaultExpanded={expandAll}
              />
            ))}
          </div>
        )}
      </main>

      {/* 6. Footer Terminal Bar */}
      <footer className="border-t border-[#1F2330] bg-[#050505] text-[#64748B] text-xs py-4 px-3 sm:px-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <span className="text-[#00FF66] font-bold">BeAGod v1.0.0</span>
            <span>//</span>
            <span>Military Institute of Science and Technology (MIST), Dhaka</span>
          </div>

          <div className="text-[11px] text-[#475569]">
            <span>$0.00/MO STACK: GITHUB ACTIONS CRON + GEMINI 2.5 FLASH + GITHUB PAGES</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-[#00E5FF]">6:00 AM BST (00:00 UTC)</span>
            <span>&bull;</span>
            <span className="text-[#00E5FF]">6:00 PM BST (12:00 UTC)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
