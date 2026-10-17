import { useState, useEffect, useCallback } from 'react';
import { IntelItem } from '../types/intel';

const STORAGE_KEY = 'beagod_bookmarks_v1';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<IntelItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load bookmarks from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to persist bookmarks to localStorage:', e);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((item) => item.id === id),
    [bookmarks]
  );

  const toggleBookmark = useCallback((item: IntelItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      } else {
        const enrichedItem: IntelItem = {
          ...item,
          saved_at: new Date().toISOString()
        };
        return [enrichedItem, ...prev];
      }
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearAllBookmarks = useCallback(() => {
    if (window.confirm('Clear all bookmarked items from local storage?')) {
      setBookmarks([]);
    }
  }, []);

  const exportBookmarksJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `beagod_bookmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [bookmarks]);

  const exportBookmarksMD = useCallback(() => {
    let md = `# BeAGod Terminal // Bookmarked Intelligence Database\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;

    bookmarks.forEach((item, index) => {
      md += `## [${index + 1}] ${item.headline}\n\n`;
      md += `- **Type**: \`${item.type}\` | **Category**: \`${item.category}\` | **Tier**: \`${item.importance_tier}\`\n`;
      if (item.opportunity_meta?.is_opportunity) {
        md += `- **Deadline**: \`${item.opportunity_meta.deadline || 'N/A'}\` | **Funding**: \`${item.opportunity_meta.funding_or_reward || 'N/A'}\`\n`;
      }
      md += `\n### // EXECUTIVE_SUMMARY\n`;
      item.summary_points.forEach((p) => {
        md += `> ${p}\n\n`;
      });
      md += `### // WHY_IT_MATTERS_TO_YOU\n${item.why_it_matters}\n\n`;
      if (item.deep_dive_analysis) {
        md += `### // DEEP_DIVE_ANALYSIS\n${item.deep_dive_analysis}\n\n`;
      }
      md += `### // SOURCE_VERIFICATION\n`;
      md += `- **Source**: ${item.side_panel.source_verification.primary_source_name} (${item.side_panel.source_verification.source_type})\n`;
      md += `- **Note**: ${item.side_panel.source_verification.credibility_note}\n`;
      md += `- **Link**: [Original Source](${item.side_panel.source_verification.original_url})\n`;
      if (item.side_panel.source_verification.discussion_or_secondary_url) {
        md += `- **Discussion**: [Secondary Thread](${item.side_panel.source_verification.discussion_or_secondary_url})\n`;
      }
      if (item.side_panel.jargon_buster?.length) {
        md += `\n### // LEXICON_DECODER\n`;
        item.side_panel.jargon_buster.forEach((j) => {
          md += `- **${j.term}**: ${j.definition}\n`;
        });
      }
      md += `\n---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `beagod_bookmarks_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [bookmarks]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    exportBookmarksJSON,
    exportBookmarksMD,
    bookmarkCount: bookmarks.length
  };
}
