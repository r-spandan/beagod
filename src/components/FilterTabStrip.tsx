import React from 'react';
import { Bookmark, Download, FileText, Trash2 } from 'lucide-react';

export type TabKey = 
  | 'ALL'
  | 'GEOPOLITICS'
  | 'ECONOMY_FINANCE'
  | 'TECH_ENGINEERING'
  | 'ADULTING_MENTAL_MODELS'
  | 'OPPORTUNITIES'
  | 'BOOKMARKS';

interface FilterTabStripProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: Record<string, number>;
  bookmarkCount: number;
  onExportJSON?: () => void;
  onExportMD?: () => void;
  onClearBookmarks?: () => void;
}

interface TabDef {
  key: TabKey;
  label: string;
  extColor: string;
}

const TABS: TabDef[] = [
  { key: 'ALL', label: 'ALL_items.sh', extColor: 'text-[#00FF66]' },
  { key: 'GEOPOLITICS', label: '01_geopolitics.md', extColor: 'text-[#38BDF8]' },
  { key: 'ECONOMY_FINANCE', label: '02_economy_finance.py', extColor: 'text-[#FBBF24]' },
  { key: 'TECH_ENGINEERING', label: '03_tech_engineering.rs', extColor: 'text-[#F43F5E]' },
  { key: 'ADULTING_MENTAL_MODELS', label: '04_adulting_models.txt', extColor: 'text-[#A855F7]' },
  { key: 'OPPORTUNITIES', label: '05_opportunities.json', extColor: 'text-[#00E5FF]' },
  { key: 'BOOKMARKS', label: 'saved_bookmarks.db', extColor: 'text-[#FFB800]' },
];

export const FilterTabStrip: React.FC<FilterTabStripProps> = ({
  activeTab,
  onTabChange,
  counts,
  bookmarkCount,
  onExportJSON,
  onExportMD,
  onClearBookmarks
}) => {
  return (
    <div className="border-b border-[#1F2330] bg-[#050505] overflow-x-auto no-scrollbar">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 flex items-center justify-between min-w-max">
        {/* Tab list */}
        <div className="flex items-center space-x-1 py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'BOOKMARKS' ? bookmarkCount : (counts[tab.key] || 0);

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs transition-all border-b-2 font-medium ${
                  isActive
                    ? 'border-[#00FF66] bg-[#0D0E12] text-[#E2E8F0] shadow-sm'
                    : 'border-transparent text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#0D0E12]/50'
                }`}
              >
                {tab.key === 'BOOKMARKS' ? (
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarkCount > 0 ? 'text-[#FFB800] fill-[#FFB800]/20' : 'text-[#64748B]'}`} />
                ) : (
                  <span className={`text-[10px] ${tab.extColor}`}>●</span>
                )}
                <span>[{tab.label}</span>
                <span className={`text-[11px] ${isActive ? 'text-[#00FF66] font-bold' : 'text-[#64748B]'}`}>
                  ({count})
                </span>
                <span>]</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls for Bookmark Tab */}
        {activeTab === 'BOOKMARKS' && bookmarkCount > 0 && (
          <div className="flex items-center space-x-2 py-1 pl-4 border-l border-[#1F2330] text-xs">
            {onExportJSON && (
              <button
                onClick={onExportJSON}
                className="flex items-center space-x-1 px-2 py-1 bg-[#0D0E12] border border-[#1F2330] text-[#00E5FF] hover:border-[#00E5FF] transition-colors"
                title="Export Bookmarks as JSON"
              >
                <Download className="w-3 h-3" />
                <span>[EXPORT_JSON]</span>
              </button>
            )}
            {onExportMD && (
              <button
                onClick={onExportMD}
                className="flex items-center space-x-1 px-2 py-1 bg-[#0D0E12] border border-[#1F2330] text-[#00FF66] hover:border-[#00FF66] transition-colors"
                title="Export Bookmarks as Markdown"
              >
                <FileText className="w-3 h-3" />
                <span>[EXPORT_MD]</span>
              </button>
            )}
            {onClearBookmarks && (
              <button
                onClick={onClearBookmarks}
                className="flex items-center space-x-1 px-2 py-1 bg-[#0D0E12] border border-[#1F2330] text-[#FF3366] hover:border-[#FF3366] transition-colors"
                title="Wipe Local Bookmarks"
              >
                <Trash2 className="w-3 h-3" />
                <span>[CLEAR_DB]</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
