import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { SOURCES, REDDIT_SUBREDDITS } from './sources.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archive');
const LEDGER_FILE = path.join(DATA_DIR, 'seen_ledger.json');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const LATEST_FILE = path.join(DATA_DIR, 'latest.json');

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'BeAGodTerminal/1.0 (academic intelligence ingest; MIST Dhaka)'
  }
});

// Helper for fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Normalized URL for deduplication
function normalizeUrl(urlStr) {
  if (!urlStr) return '';
  try {
    const u = new URL(urlStr);
    return (u.origin + u.pathname).replace(/\/+$/, '').toLowerCase();
  } catch {
    return urlStr.trim().toLowerCase();
  }
}

// Simple title similarity check
function isTitleSimilar(t1, t2) {
  if (!t1 || !t2) return false;
  const clean1 = t1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const clean2 = t2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  if (clean1.length === 0 || clean2.length === 0) return false;
  const set1 = new Set(clean1);
  const overlap = clean2.filter(w => set1.has(w)).length;
  const similarity = (2 * overlap) / (clean1.length + clean2.length);
  return similarity > 0.75;
}

// Fetch all RSS sources safely
async function fetchRssSources() {
  console.log(`[INGEST] Fetching ${SOURCES.length} RSS endpoints...`);
  const results = await Promise.allSettled(
    SOURCES.map(async (src) => {
      try {
        const feed = await rssParser.parseURL(src.url);
        return (feed.items || []).slice(0, 10).map((item) => ({
          title: item.title?.trim() || '',
          url: item.link?.trim() || '',
          contentSnippet: item.contentSnippet || item.summary || item.content || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source_name: src.name,
          source_type: src.source_type,
          category: src.category,
          credibility_note: src.credibility
        }));
      } catch (err) {
        console.warn(`[WARN] Failed to fetch RSS: ${src.name} (${err.message})`);
        return [];
      }
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((item) => item.title && item.url);
}

// Fetch Hacker News Top Stories
async function fetchHackerNews() {
  console.log('[INGEST] Fetching Hacker News Top Stories...');
  try {
    const res = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!res.ok) throw new Error(`HN status ${res.status}`);
    const storyIds = (await res.json()).slice(0, 25);

    const stories = await Promise.allSettled(
      storyIds.map(async (id) => {
        const sRes = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return sRes.json();
      })
    );

    return stories
      .filter((r) => r.status === 'fulfilled' && r.value && r.value.score >= 100)
      .map((r) => ({
        title: r.value.title,
        url: r.value.url || `https://news.ycombinator.com/item?id=${r.value.id}`,
        contentSnippet: `HN Score: ${r.value.score} points, ${r.value.descendants || 0} comments`,
        pubDate: new Date(r.value.time * 1000).toISOString(),
        source_name: 'Hacker News (Y Combinator)',
        source_type: 'SOCIAL_SIGNAL',
        category: 'TECH_ENGINEERING',
        credibility_note: `High-signal technical community discussion with ${r.value.score}+ points`,
        discussion_url: `https://news.ycombinator.com/item?id=${r.value.id}`
      }));
  } catch (err) {
    console.warn(`[WARN] Failed to fetch Hacker News: ${err.message}`);
    return [];
  }
}

// Fetch Reddit Curated Communities
async function fetchRedditFeeds() {
  console.log('[INGEST] Fetching curated Reddit feeds...');
  const results = await Promise.allSettled(
    REDDIT_SUBREDDITS.map(async ({ sub, category }) => {
      try {
        const url = `https://www.reddit.com/r/${sub}/top/.json?t=day&limit=10`;
        const res = await fetchWithTimeout(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BeAGodTerminal/1.0'
          }
        });
        if (!res.ok) throw new Error(`Reddit r/${sub} HTTP ${res.status}`);
        const data = await res.json();
        const posts = data?.data?.children || [];

        return posts
          .filter((p) => !p.data.stickied && p.data.score >= 50)
          .map((p) => ({
            title: p.data.title,
            url: p.data.url?.startsWith('http') ? p.data.url : `https://reddit.com${p.data.permalink}`,
            contentSnippet: (p.data.selftext || '').slice(0, 300),
            pubDate: new Date(p.data.created_utc * 1000).toISOString(),
            source_name: `r/${sub}`,
            source_type: 'SOCIAL_SIGNAL',
            category: category,
            credibility_note: `Curated community signal with ${p.data.score} upvotes and active discussion`,
            discussion_url: `https://reddit.com${p.data.permalink}`
          }));
      } catch (err) {
        console.warn(`[WARN] Failed to fetch Reddit r/${sub}: ${err.message}`);
        return [];
      }
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

// Fetch GitHub trending or notable developer tools
async function fetchGitHubTrends() {
  console.log('[INGEST] Fetching GitHub trending highlights...');
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://api.github.com/search/repositories?q=created:>${yesterday}&sort=stars&order=desc&per_page=10`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'BeAGodTerminal-MIST'
      }
    });
    if (!res.ok) throw new Error(`GitHub search HTTP ${res.status}`);
    const data = await res.json();
    return (data.items || []).slice(0, 5).map((repo) => ({
      title: `${repo.full_name}: ${repo.description || 'Open source breakthrough tool'}`,
      url: repo.html_url,
      contentSnippet: `Language: ${repo.language || 'Any'} | Stars: ${repo.stargazers_count}`,
      pubDate: repo.created_at,
      source_name: 'GitHub Trending',
      source_type: 'SOCIAL_SIGNAL',
      category: 'TECH_ENGINEERING',
      credibility_note: `High-growth open source repository starred by developers worldwide`,
      discussion_url: repo.html_url
    }));
  } catch (err) {
    console.warn(`[WARN] Failed to fetch GitHub trends: ${err.message}`);
    return [];
  }
}

// Load and manage deduplication ledger
async function loadLedger() {
  try {
    const content = await fs.readFile(LEDGER_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveLedger(ledger) {
  // Prune entries older than 14 days (14 * 24 * 60 * 60 * 1000 ms)
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const filtered = ledger.filter((entry) => new Date(entry.timestamp).getTime() > cutoff);
  await fs.writeFile(LEDGER_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
}

// Main curation routine
async function main() {
  console.log('=====================================================');
  console.log('⚡ BeAGod Terminal // Autonomous Ingestion Pipeline ⚡');
  console.log('=====================================================');

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] GEMINI_API_KEY is not defined in environment variables.');
    console.error('Please configure GEMINI_API_KEY as a repository secret or in your local .env.');
    process.exit(1);
  }

  // Determine current edition timing
  const now = new Date();
  // Bangladesh Standard Time is UTC+6
  const bstHour = (now.getUTCHours() + 6) % 24;
  const isMorning = bstHour < 12;
  const shiftStr = isMorning ? 'AM' : 'PM';
  const shiftLabel = isMorning ? 'MORNING_0600_BST' : 'EVENING_1800_BST';

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const editionId = `${year}-${month}-${day}-${shiftStr}`;

  console.log(`[INFO] Building Edition: ${editionId} [${shiftLabel}]`);

  // Step 1: Ingest raw data from matrix
  const [rssItems, hnItems, redditItems, githubItems] = await Promise.all([
    fetchRssSources(),
    fetchHackerNews(),
    fetchRedditFeeds(),
    fetchGitHubTrends()
  ]);

  const allRawItems = [...rssItems, ...hnItems, ...redditItems, ...githubItems];
  console.log(`[INGEST] Successfully pulled ${allRawItems.length} raw signals across all sources.`);

  // Step 2: Deduplicate against rolling 14-day ledger
  const seenLedger = await loadLedger();
  const recentSlugs = Array.from(new Set(seenLedger.slice(-40).map((s) => s.topic_slug).filter(Boolean)));

  const uniqueCandidates = [];
  for (const item of allRawItems) {
    const norm = normalizeUrl(item.url);
    const isUrlSeen = seenLedger.some((entry) => normalizeUrl(entry.url) === norm);
    const isTitleSeen = seenLedger.some((entry) => isTitleSimilar(entry.title, item.title));

    if (!isUrlSeen && !isTitleSeen) {
      uniqueCandidates.push(item);
    }
  }

  console.log(`[DEDUP] Filtered out ${allRawItems.length - uniqueCandidates.length} duplicates. Unique candidates: ${uniqueCandidates.length}`);

  // Step 3: Run AI synthesis using Google Gemini API (gemini-2.5-flash)
  console.log('[AI] Initializing Gemini 2.5 Flash model with Structured Output...');
  const ai = new GoogleGenAI({ apiKey });

  const aiPrompt = `
You are the autonomous chief intelligence officer for "BeAGod", a high-signal, zero-fluff intelligence terminal for an engineering/science undergraduate at MIST and an informed citizen of Bangladesh.
Your goal is to build an exceptionally knowledgeable, globally aware adult and empower them to capitalize on high-leverage global and local opportunities.

TARGET EDITION:
- edition_id: "${editionId}"
- edition_shift: "${shiftLabel}"
- timestamp_utc: "${now.toISOString()}"
- timestamp_bst: "${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} BST"

CRITICAL RULES & RATIOS:
1. STRICT CONTENT RATIO: Exactly 70% World/National/Tech/Economy Intelligence AND 30% Actionable Global & Local Opportunities (e.g. 7 news / 3 opps, or 9 news / 3 opps).
2. DYNAMIC VOLUME: Select as many stories as the day genuinely warrants based on signal quality (typically 8 to 16 total items). Do NOT pad with filler.
3. ADAPTIVE DEPTH:
   - "CRITICAL_DEEP_DIVE": For major geopolitical shifts, major central bank moves, breakthroughs in AI/quantum/semiconductors, or flagship global fellowships (e.g., Rhodes/Schwarzman). Must write a detailed 2-3 paragraph "deep_dive_analysis" covering background, mechanisms, and second-order effects.
   - "STANDARD_BRIEF": For important daily awareness. "deep_dive_analysis" should be null.
   - "QUICK_SIGNAL": For concise tactical updates or quick reminders. "deep_dive_analysis" should be null.
4. NATIONAL CIVIC & CITIZEN POLICY MANDATE:
   - Always include 2-3 high-impact national stories affecting ALL citizens of Bangladesh (not solely engineers), such as:
     * Bangladesh Bank forex reserves, interbank currency rates, banking sector forensic audits.
     * Government policies, gazettes, institutional reforms, and public university/judiciary directives.
     * National energy tariffs, fuel pricing mechanisms, and NBR income tax/digital e-Return mandates.
5. RECENT TOPIC SLUGS TO STRICTLY AVOID (Anti-repetition):
   ${JSON.stringify(recentSlugs.slice(-25))}
   Do NOT cover these events unless there is a massive, game-changing new development!
6. TARGET RELEVANCE:
   - In "why_it_matters", write a direct, zero-fluff explanation of how this affects a young adult / engineer / citizen in Bangladesh, their wallet, career trajectory, or worldview.
7. SIDE PANEL REQUIREMENT:
   Every item MUST include:
   - "jargon_buster": Array of 1-3 complex technical/economic/geopolitical terms with plain-English definitions.
   - "source_verification": primary_source_name, source_type, credibility_note, original_url, discussion_or_secondary_url.

CANDIDATE SIGNALS SAMPLED:
${JSON.stringify(uniqueCandidates.slice(0, 60), null, 1)}

RETURN STRICT VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "edition_id": "${editionId}",
  "generated_at_utc": "${now.toISOString()}",
  "generated_at_bst": "${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} BST",
  "edition_shift": "${shiftLabel}",
  "executive_pulse": "A crisp, high-signal 2-sentence terminal status summary of the world today.",
  "stats": {
    "total_items": 10,
    "news_count": 7,
    "opportunities_count": 3,
    "sources_scanned": ${allRawItems.length}
  },
  "items": [
    {
      "id": "hash-or-slug-id",
      "topic_slug": "semantic-slug",
      "type": "NEWS or OPPORTUNITY",
      "category": "GEOPOLITICS | ECONOMY_FINANCE | TECH_ENGINEERING | ADULTING_MENTAL_MODELS | OPPORTUNITIES",
      "importance_tier": "CRITICAL_DEEP_DIVE | STANDARD_BRIEF | QUICK_SIGNAL",
      "headline": "...",
      "summary_points": [
        "Point 1...",
        "Point 2...",
        "Point 3..."
      ],
      "why_it_matters": "...",
      "deep_dive_analysis": "Multi-paragraph deep dive if CRITICAL_DEEP_DIVE, else null",
      "opportunity_meta": {
        "is_opportunity": true_or_false,
        "deadline": "YYYY-MM-DD or Rolling or null",
        "funding_or_reward": "Fully Funded / $10,000 / N/A",
        "eligibility": "Undergraduate / Global / Engineering / etc."
      },
      "side_panel": {
        "jargon_buster": [
          { "term": "...", "definition": "..." }
        ],
        "source_verification": {
          "primary_source_name": "...",
          "source_type": "MAJOR_OUTLET | NICHE_CREDIBLE | SOCIAL_SIGNAL | OPPORTUNITY_PORTAL",
          "credibility_note": "...",
          "original_url": "...",
          "discussion_or_secondary_url": "..."
        }
      }
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: aiPrompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const responseText = response.text?.trim() || '';
  let curatedEdition;
  try {
    curatedEdition = JSON.parse(responseText);
  } catch (err) {
    console.error('[ERROR] Failed to parse JSON response from Gemini:', err);
    console.error('Raw response excerpt:', responseText.slice(0, 500));
    process.exit(1);
  }

  // Ensure stats integrity
  const total = curatedEdition.items.length;
  const oppCount = curatedEdition.items.filter((i) => i.type === 'OPPORTUNITY' || i.category === 'OPPORTUNITIES').length;
  const newsCount = total - oppCount;

  curatedEdition.stats = {
    total_items: total,
    news_count: newsCount,
    opportunities_count: oppCount,
    sources_scanned: allRawItems.length
  };

  // Step 4: Write output to latest.json and archive
  console.log(`[STORAGE] Writing edition ${editionId} (${total} items: ${newsCount} news, ${oppCount} opps)...`);
  await fs.writeFile(LATEST_FILE, JSON.stringify(curatedEdition, null, 2), 'utf-8');

  const archivePath = path.join(ARCHIVE_DIR, `${editionId}.json`);
  await fs.writeFile(archivePath, JSON.stringify(curatedEdition, null, 2), 'utf-8');

  // Step 5: Update index manifest
  let indexData = { latest_edition_id: editionId, editions: [] };
  try {
    const rawIndex = await fs.readFile(INDEX_FILE, 'utf-8');
    indexData = JSON.parse(rawIndex);
  } catch {
    // initialize new
  }

  indexData.latest_edition_id = editionId;
  const newEntry = {
    edition_id: editionId,
    shift: shiftStr,
    date: `${year}-${month}-${day}`,
    label: `${year}-${month}-${day} [${shiftStr}]`,
    filename: `${editionId}.json`
  };

  // Prepend if not already in index
  if (!indexData.editions.some((e) => e.edition_id === editionId)) {
    indexData.editions = [newEntry, ...indexData.editions.slice(0, 30)];
  }
  await fs.writeFile(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf-8');

  // Step 6: Update seen ledger
  const newEntries = curatedEdition.items.map((i) => ({
    url: i.side_panel?.source_verification?.original_url || '',
    title: i.headline,
    topic_slug: i.topic_slug,
    timestamp: now.toISOString()
  }));

  const updatedLedger = [...seenLedger, ...newEntries];
  await saveLedger(updatedLedger);

  console.log('✅ Ingestion, curation, and flat-file deployment complete!');
}

main().catch((err) => {
  console.error('[FATAL] Pipeline failed:', err);
  process.exit(1);
});
