import React, { useState } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { IntelItem } from '../types/intel';

interface IntelCardProps {
  item: IntelItem;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (item: IntelItem) => void;
  onRemoveBookmark?: (id: string) => void;
  isBookmarkView?: boolean;
  defaultExpanded?: boolean;
}

export const IntelCard: React.FC<IntelCardProps> = ({
  item,
  index,
  isBookmarked,
  onToggleBookmark,
  onRemoveBookmark,
  isBookmarkView = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [deepDiveExpanded, setDeepDiveExpanded] = useState<boolean>(
    item.importance_tier === 'CRITICAL_DEEP_DIVE'
  );

  const isOpportunity = item.type === 'OPPORTUNITY' || item.opportunity_meta?.is_opportunity;
  const isCritical = item.importance_tier === 'CRITICAL_DEEP_DIVE';
  const isQuick = item.importance_tier === 'QUICK_SIGNAL';

  // Format index string (e.g. #01)
  const indexStr = `#${String(index + 1).padStart(2, '0')}`;

  // Importance tier badge styling
  const getTierBadge = () => {
    switch (item.importance_tier) {
      case 'CRITICAL_DEEP_DIVE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF3366]/10 text-[#FF3366] border border-[#FF3366]/30">
            [CRITICAL_DEEP_DIVE]
          </span>
        );
      case 'STANDARD_BRIEF':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
            [STANDARD_BRIEF]
          </span>
        );
      case 'QUICK_SIGNAL':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/30">
            [QUICK_SIGNAL]
          </span>
        );
    }
  };

  // Category badge styling
  const getCategoryBadge = () => {
    let colorClass = 'text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10';
    if (item.category === 'ECONOMY_FINANCE') colorClass = 'text-[#FBBF24] border-[#FBBF24]/30 bg-[#FBBF24]/10';
    if (item.category === 'TECH_ENGINEERING') colorClass = 'text-[#F43F5E] border-[#F43F5E]/30 bg-[#F43F5E]/10';
    if (item.category === 'ADULTING_MENTAL_MODELS') colorClass = 'text-[#A855F7] border-[#A855F7]/30 bg-[#A855F7]/10';
    if (item.category === 'OPPORTUNITIES') colorClass = 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/10';

    return (
      <span className={`px-2 py-0.5 text-[10px] font-mono border ${colorClass}`}>
        [{item.category}]
      </span>
    );
  };

  // Source type badge styling
  const getSourceTypeBadge = (st: string) => {
    switch (st) {
      case 'MAJOR_OUTLET':
        return <span className="text-[10px] px-1.5 py-0.5 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">MAJOR_OUTLET</span>;
      case 'NICHE_CREDIBLE':
        return <span className="text-[10px] px-1.5 py-0.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20">NICHE_CREDIBLE</span>;
      case 'SOCIAL_SIGNAL':
        return <span className="text-[10px] px-1.5 py-0.5 bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20">SOCIAL_SIGNAL</span>;
      case 'OPPORTUNITY_PORTAL':
        return <span className="text-[10px] px-1.5 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">OPPORTUNITY_PORTAL</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/20">{st}</span>;
    }
  };

  return (
    <article className="terminal-card bg-[#0D0E12] border border-[#1F2330] mb-3 text-[#E2E8F0] transition-colors">
      {/* ======================================================== */}
      {/* CARD HEADER & HEADLINE (ALWAYS VISIBLE & CLICKABLE) */}
      {/* ======================================================== */}
      <div className="p-3 sm:p-4">
        {/* Top Meta Line: Badges + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1F2330]/50 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#64748B]">{indexStr}</span>
            {getCategoryBadge()}
            {getTierBadge()}

            {/* Opportunity Quick Badges */}
            {isOpportunity && item.opportunity_meta?.deadline && (
              <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                <Clock className="w-3 h-3" />
                <span>[DEADLINE: {item.opportunity_meta.deadline}]</span>
              </span>
            )}
            {isOpportunity && item.opportunity_meta?.funding_or_reward && (
              <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                <Award className="w-3 h-3" />
                <span>[{item.opportunity_meta.funding_or_reward}]</span>
              </span>
            )}
          </div>

          {/* Action buttons (Bookmark & Expand indicator) */}
          <div className="flex items-center space-x-2">
            {isBookmarkView && onRemoveBookmark ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(item.id);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-mono bg-[#12141C] border border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366]/20 transition-colors"
                title="Remove from bookmarks"
              >
                <span>[x REMOVE]</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(item);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono border transition-all ${
                  isBookmarked
                    ? 'bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800]'
                    : 'bg-[#12141C] border-[#1F2330] text-[#64748B] hover:text-[#FFB800] hover:border-[#FFB800]/50'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Save to Local DB'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#FFB800]' : ''}`} />
                <span>{isBookmarked ? '[★ SAVED]' : '[+ BOOKMARK]'}</span>
              </button>
            )}

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono border transition-all ${
                isExpanded
                  ? 'bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]'
                  : 'bg-[#12141C] border-[#1F2330] text-[#64748B] hover:text-[#00FF66] hover:border-[#00FF66]/50'
              }`}
              title={isExpanded ? 'Collapse Brief' : 'Expand Full Details'}
            >
              <span>{isExpanded ? '[- CLOSE]' : '[+ OPEN]'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Headline Row (Click to Expand / Collapse) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="group cursor-pointer select-none flex items-start justify-between gap-3 pt-0.5"
        >
          <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-[#E2E8F0] group-hover:text-[#00FF66] transition-colors leading-snug">
            {item.headline}
          </h2>
          <span className="text-[#64748B] group-hover:text-[#00FF66] text-xs font-mono shrink-0 mt-1 flex items-center space-x-1">
            <span>{isExpanded ? '[COLLAPSE]' : '[EXPAND]'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXPANDED CONTENT: SHOWN ONLY UPON CLICKING */}
      {/* ======================================================== */}
      {isExpanded && (
        <div className="border-t border-[#1F2330] bg-[#090A0E]">
          {/* 12-Column Responsive Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1F2330]">
            
            {/* ---------------------------------------------------- */}
            {/* LEFT COLUMN: 8 COLS - MAIN INTELLIGENCE BRIEF */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                {/* Opportunity Eligibility Highlight (If applicable) */}
                {isOpportunity && item.opportunity_meta?.eligibility && (
                  <div className="mb-4 px-3 py-1.5 bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-xs text-[#00E5FF] flex items-center space-x-2">
                    <span className="font-bold">// ELIGIBILITY:</span>
                    <span className="text-[#E2E8F0]">{item.opportunity_meta.eligibility}</span>
                  </div>
                )}

                {/* 3-Point Summary Section */}
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-[#64748B] mb-2 flex items-center space-x-1">
                    <span>// EXECUTIVE_SUMMARY</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#CBD5E1]">
                    {item.summary_points.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                        <span className="text-[#00FF66] font-bold select-none mt-0.5">&gt;</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why It Matters (MIST student & Young Adult Context) */}
                <div className="mb-4 border-l-2 border-[#00FF66] bg-[#00FF66]/5 p-3 text-xs sm:text-sm">
                  <div className="text-[11px] font-mono text-[#00FF66] font-bold mb-1 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>// WHY_IT_MATTERS_TO_YOU</span>
                  </div>
                  <p className="text-[#E2E8F0] leading-relaxed">
                    {item.why_it_matters}
                  </p>
                </div>

                {/* Adaptive Deep Dive Section */}
                {item.deep_dive_analysis && (
                  <div className="mt-3 border border-[#1F2330] bg-[#050505] p-3 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-mono text-[#FF3366] font-bold flex items-center space-x-1.5">
                        <span>// DEEP_DIVE_ANALYSIS</span>
                        {isCritical && <span className="text-[10px] text-[#64748B]">[SECOND_ORDER_EFFECTS]</span>}
                      </div>
                      <button
                        onClick={() => setDeepDiveExpanded(!deepDiveExpanded)}
                        className="text-[11px] font-mono text-[#64748B] hover:text-[#E2E8F0] flex items-center space-x-1"
                      >
                        <span>{deepDiveExpanded ? '[^ COLLAPSE]' : '[v EXPAND_DEEP_DIVE]'}</span>
                        {deepDiveExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {deepDiveExpanded && (
                      <div className="mt-2 text-[#CBD5E1] leading-relaxed space-y-2 whitespace-pre-line border-t border-[#1F2330] pt-2">
                        {item.deep_dive_analysis}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Signal Footer note */}
              {isQuick && (
                <div className="text-[10px] text-[#64748B] mt-2 pt-2 border-t border-[#1F2330]/40">
                  * QUICK_SIGNAL: Low-friction tactical update.
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* RIGHT COLUMN: 4 COLS - JARGON BUSTER & SOURCE VERIFY */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 bg-[#12141C] p-4 sm:p-5 flex flex-col justify-between space-y-4 text-xs">
              <div>
                {/* Box 1: Source Verification */}
                <div className="border border-[#1F2330] bg-[#0D0E12] p-3 mb-4">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1F2330]">
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#A855F7] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>// SOURCE_VERIFICATION</span>
                    </div>
                    {getSourceTypeBadge(item.side_panel.source_verification.source_type)}
                  </div>

                  {/* Source Origin */}
                  <div className="mb-2">
                    <span className="text-[#64748B] text-[10px]">ORIGIN:</span>
                    <span className="text-[#E2E8F0] font-bold ml-1.5">
                      {item.side_panel.source_verification.primary_source_name}
                    </span>
                  </div>

                  {/* Credibility Note */}
                  <p className="text-[11px] text-[#94A3B8] italic mb-3 leading-snug">
                    "{item.side_panel.source_verification.credibility_note}"
                  </p>

                  {/* Direct Verification Links */}
                  <div className="space-y-1.5 pt-1 border-t border-[#1F2330]/60">
                    <a
                      href={item.side_panel.source_verification.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-[11px] text-[#A855F7] hover:text-[#00FF66] transition-colors break-all"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span>[-&gt; VERIFY_ORIGINAL_SOURCE]</span>
                    </a>

                    {item.side_panel.source_verification.discussion_or_secondary_url && (
                      <div>
                        <a
                          href={item.side_panel.source_verification.discussion_or_secondary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-[11px] text-[#00E5FF] hover:text-[#00FF66] transition-colors break-all"
                        >
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span>[-&gt; DISCUSSION_THREAD]</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 2: Jargon Buster Dictionary (Lexicon Decoder) */}
                <div className="border border-[#1F2330] bg-[#0D0E12] p-3">
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#FFB800] font-semibold mb-2 pb-1.5 border-b border-[#1F2330]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>// LEXICON_DECODER</span>
                  </div>

                  {item.side_panel.jargon_buster && item.side_panel.jargon_buster.length > 0 ? (
                    <div className="space-y-2.5">
                      {item.side_panel.jargon_buster.map((jb, jIdx) => (
                        <div key={jIdx} className="border-l border-[#FFB800]/40 pl-2">
                          <span className="text-[#FFB800] font-bold text-xs block mb-0.5">
                            {jb.term}
                          </span>
                          <p className="text-[11px] text-[#94A3B8] leading-snug">
                            {jb.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#64748B] italic">
                      [No specialized jargon terms flagged for this item]
                    </div>
                  )}
                </div>
              </div>

              {/* Semantic topic slug */}
              <div className="text-[10px] text-[#475569] font-mono pt-2 border-t border-[#1F2330]/50 truncate">
                SLUG: {item.topic_slug}
              </div>
            </div>
          </div>

          {/* Quick Collapse Footer Bar */}
          <div
            onClick={() => setIsExpanded(false)}
            className="border-t border-[#1F2330] py-1.5 px-4 bg-[#0D0E12] hover:bg-[#12141C] text-center cursor-pointer text-[11px] text-[#64748B] hover:text-[#00FF66] transition-colors flex items-center justify-center space-x-1"
          >
            <span>[^ COLLAPSE_BRIEF]</span>
          </div>
        </div>
      )}
    </article>
  );
};
