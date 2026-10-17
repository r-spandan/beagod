import React from 'react';
import { Terminal, Calendar, Search, ShieldAlert, Cpu } from 'lucide-react';
import { IntelEdition, EditionIndexEntry } from '../types/intel';

interface TerminalHeaderProps {
  currentEdition: IntelEdition | null;
  availableEditions: EditionIndexEntry[];
  selectedEditionId: string;
  onSelectEdition: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAutoRefreshing?: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  currentEdition,
  availableEditions,
  selectedEditionId,
  onSelectEdition,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="border-b border-[#1F2330] bg-[#050505] sticky top-0 z-40">
      {/* Top Banner / System Shell Bar */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Terminal Prompt */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#0D0E12] border border-[#1F2330]">
            <Terminal className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="text-[#00FF66] font-bold">[root@BeAGod ~]$</span>
            <span className="text-[#E2E8F0]">./feed --live</span>
            <span className="text-[#00FF66] font-black terminal-cursor">█</span>
          </div>
          <span className="hidden md:inline-flex items-center space-x-1 text-[#64748B]">
            <Cpu className="w-3 h-3 text-[#A855F7]" />
            <span>GEMINI_2.5_CORE</span>
          </span>
        </div>

        {/* Center: System Status Bar */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {currentEdition ? (
            <>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#0D0E12] border border-[#1F2330]">
                <Calendar className="w-3 h-3 text-[#00E5FF]" />
                <span className="text-[#64748B]">EDITION:</span>
                <span className="text-[#00E5FF] font-semibold">{currentEdition.edition_id}</span>
                <span className="text-[#64748B]">[{currentEdition.edition_shift}]</span>
              </div>
              <div className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-[#0D0E12] border border-[#1F2330]">
                <span className="text-[#64748B]">SIGNAL_SPLIT:</span>
                <span className="text-[#00FF66] font-bold">70% INTEL</span>
                <span className="text-[#64748B]">/</span>
                <span className="text-[#00E5FF] font-bold">30% OPP</span>
              </div>
            </>
          ) : (
            <div className="text-[#FFB800] animate-pulse">CONNECTING_TO_MAINFRAME...</div>
          )}
        </div>

        {/* Right: Edition Switcher & Search Bar */}
        <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0 justify-end">
          {/* Edition Selector */}
          <div className="relative">
            <select
              value={selectedEditionId}
              onChange={(e) => onSelectEdition(e.target.value)}
              className="bg-[#0D0E12] border border-[#1F2330] text-[#E2E8F0] px-2.5 py-1 text-xs focus:outline-none focus:border-[#00FF66] cursor-pointer"
            >
              <option value="latest">LATEST_ACTIVE_FEED</option>
              {availableEditions.map((ed) => (
                <option key={ed.edition_id} value={ed.edition_id}>
                  {ed.label} ({ed.shift})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Search */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-[#64748B] absolute left-2 pointer-events-none" />
            <input
              type="text"
              placeholder="grep pattern..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-[#0D0E12] border border-[#1F2330] text-[#E2E8F0] pl-6 pr-2 py-1 text-xs w-32 sm:w-44 focus:w-56 transition-all duration-200 focus:outline-none focus:border-[#00FF66] placeholder-[#64748B]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[#64748B] hover:text-[#FF3366] text-xs ml-1"
                title="Clear"
              >
                [x]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target User Banner / Executive Pulse */}
      {currentEdition?.executive_pulse && (
        <div className="border-t border-[#1F2330] bg-[#0D0E12]/80 px-3 sm:px-4 py-1.5 text-xs text-[#64748B] flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[#00FF66] font-bold">// EXEC_PULSE:</span>
            <span className="text-[#E2E8F0]">{currentEdition.executive_pulse}</span>
          </div>
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-[#64748B] shrink-0 ml-4">
            <ShieldAlert className="w-3 h-3 text-[#FFB800]" />
            <span>MIST_ENGINEERING_TARGETED // 06:00 & 18:00 BST CYCLE</span>
          </div>
        </div>
      )}
    </header>
  );
};
