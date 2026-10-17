import React from 'react';
import { Activity, Clock, Database, Globe } from 'lucide-react';
import { IntelEdition } from '../types/intel';

interface StatsBarProps {
  edition: IntelEdition | null;
  filteredCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ edition, filteredCount }) => {
  if (!edition) return null;

  return (
    <div className="bg-[#050505] border-b border-[#1F2330] text-[11px] text-[#64748B]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Pipeline Telemetry */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>DISPLAYING:</span>
            <span className="text-[#00FF66] font-bold">{filteredCount} ITEMS</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>SOURCES_INGESTED:</span>
            <span className="text-[#E2E8F0] font-semibold">{edition.stats.sources_scanned}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[#64748B]">NEWS:</span>
            <span className="text-[#00FF66]">{edition.stats.news_count}</span>
            <span className="text-[#64748B]">|</span>
            <span className="text-[#64748B]">OPPORTUNITIES:</span>
            <span className="text-[#00E5FF] font-semibold">{edition.stats.opportunities_count}</span>
          </div>
        </div>

        {/* Right: Timestamps */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center space-x-1 text-[#64748B]">
            <Clock className="w-3 h-3 text-[#FFB800]" />
            <span>BST:</span>
            <span className="text-[#E2E8F0]">{edition.generated_at_bst}</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-[#64748B]">
            <Globe className="w-3 h-3 text-[#A855F7]" />
            <span>UTC:</span>
            <span className="text-[#64748B]">{edition.generated_at_utc}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
