# ⚡ BeAGod — Autonomous Intelligence & Opportunity Terminal

> **High-Signal, Zero-Fluff Intelligence & Global Opportunity Terminal for an Engineering/Science Undergraduate at the Military Institute of Science and Technology (MIST), Dhaka.**

---

## 1. Overview & Core Philosophy

**BeAGod** is a 100% free, fully autonomous, zero-maintenance static web application and automated AI intelligence pipeline.

Twice daily, the system aggregates raw signals across major world wire services, Bangladesh business and geopolitical outlets, elite technical and engineering journals, and high-credibility developer communities (Hacker News, Reddit, GitHub). A state-of-the-art Google Gemini AI engine (`gemini-2.5-flash`) deduplicates the coverage against a rolling 14-day ledger, scales explanation depth based on story significance, and outputs a static terminal-style briefing.

### Key Metrics & Commitments
* **Update Schedule:** Exactly twice daily at **06:00 AM BST (00:00 UTC)** and **06:00 PM BST (12:00 UTC)**.
* **Content Ratio:** **70% World / Tech / Economy / Adulting Intelligence** | **30% Actionable Global & Local Opportunities** (Fellowships, Hackathons, GSoC, Research Grants, Free Elite Courses).
* **Cost Constraint:** **$0.00/month forever.** Runs entirely on GitHub Actions cron (free tier), Google Gemini API (`gemini-2.5-flash` free tier), flat-file JSON storage in Git, and GitHub Pages static hosting.
* **Aesthetic:** Dark Neovim / VS Code Tokyo Night / Bloomberg Terminal IDE interface. Monospace typography (`JetBrains Mono`), high contrast `#050505` canvas, and sharp syntax-highlighted borders.

---

## 2. System Architecture

```text
               +-------------------------------------------------------------+
               |                  DATA SOURCING MATRIX                       |
               | BBC, Reuters, TBS, The Daily Star, IEEE Spectrum,           |
               | Ars Technica, MIT Tech Review, Quanta, Farnam Street,       |
               | Hacker News (Score > 100), Reddit Top, OppDesk, Scholars4Dev|
               +------------------------------+------------------------------+
                                              |
                                              v
               +-------------------------------------------------------------+
               |              PRE-FILTER & DEDUPLICATION LEDGER               |
               |         (seen_ledger.json: 14-day URL & title hashes)       |
               +------------------------------+------------------------------+
                                              |
                                              v
               +-------------------------------------------------------------+
               |               AI SYNTHESIS & ADAPTIVE DEPTH                 |
               |       Google Gemini 2.5 Flash with Structured Output        |
               |   (CRITICAL_DEEP_DIVE / STANDARD_BRIEF / QUICK_SIGNAL)      |
               +------------------------------+------------------------------+
                                              |
                                              v
               +-------------------------------------------------------------+
               |               FLAT-FILE JSON DATABASE IN GIT                |
               | public/data/latest.json                                     |
               | public/data/archive/YYYY-MM-DD-AM.json                      |
               | public/data/index.json                                      |
               +------------------------------+------------------------------+
                                              |
                                              v
               +-------------------------------------------------------------+
               |                 TERMINAL FRONTEND (Vite+React)              |
               |   Split 8-col Intel + 4-col Jargon & Verification Panel     |
               |   localStorage Bookmarking System (beagod_bookmarks_v1)     |
               +-------------------------------------------------------------+
```

---

## 3. Data Sourcing Matrix

| Category | High-Credibility Endpoints |
|---|---|
| **Global Geopolitics & Economy** | BBC World & Business, Al Jazeera English, Reuters / Google News World Wire |
| **Bangladesh Context (MIST)** | The Daily Star (Front Page & Business), The Business Standard (TBS) |
| **Deep-Tech & Engineering** | IEEE Spectrum, MIT Technology Review, Ars Technica, Quanta Magazine |
| **Adulting & Mental Models** | Farnam Street (Mental models, OODA loop, high-leverage decision making) |
| **Social Signals (APIs)** | Hacker News (Score > 100 via Firebase API), Reddit (`r/geopolitics`, `r/Economics`, `r/engineering`, `r/MachineLearning`, `r/PersonalFinance`), GitHub Trending |
| **Global Opportunities (30%)** | Opportunity Desk, Youth Opportunities, Scholars4Dev, Google Summer of Code, IEEE Competitions |

---

## 4. UI Anatomy & Features

* **Top Command Bar:** System prompt `[root@BeAGod ~]$ ./feed --live`, edition indicator, 70/30 ratio meter, edition archive switcher, and instant grep search.
* **IDE Tab Strip:**
  - `[ALL_items.sh]`
  - `[01_geopolitics.md]`
  - `[02_economy_finance.py]`
  - `[03_tech_engineering.rs]`
  - `[04_adulting_models.txt]`
  - `[05_opportunities.json] (30%)`
  - `[★ saved_bookmarks.db (count)]`
* **Card Structure (Split 12-Column Grid):**
  - **Left (8 Cols):** Line number `#01`, category badge, importance badge, `[+ BOOKMARK]`, bold headline, `// EXECUTIVE_SUMMARY` with `>` chevrons, `// WHY_IT_MATTERS_TO_YOU` (highlighted in `#00FF66`), and conditional `// DEEP_DIVE_ANALYSIS` for critical stories.
  - **Right (4 Cols):** Surface `#12141C` containing:
    1. `// SOURCE_VERIFICATION`: Origin name, source type badge, credibility note, and `[-> VERIFY_ORIGINAL_SOURCE]` / `[-> DISCUSSION_THREAD]` clickable links.
    2. `// LEXICON_DECODER`: Jargon buster dictionary explaining complex technical or economic terms in plain English.
* **Bookmarks Database (`localStorage`):**
  - Stored under `beagod_bookmarks_v1`
  - Persists locally forever across new daily editions
  - Sub-filter by Category
  - 1-Click Export to `.json` or `.md` (`[EXPORT_JSON]` / `[EXPORT_MD]`)

---

## 5. Local Development Setup

### Prerequisites
* Node.js v20+
* (Optional for running the ingestion script locally) A free Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation
```bash
git clone https://github.com/your-username/beagod.git
cd beagod
npm install
```

### Run the Frontend Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to view the live terminal.

### Run the Curation Pipeline Locally
```bash
export GEMINI_API_KEY="your-gemini-api-key"
npm run curate
```
This fetches raw feeds, applies deduplication, calls `gemini-2.5-flash`, and writes the newly compiled edition to `public/data/latest.json`.

---

## 6. GitHub Actions Automated Deployment Setup

1. Fork or push this repository to GitHub.
2. In your repository, navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Create a **New repository secret**:
   * Name: `GEMINI_API_KEY`
   * Value: *Your free Google Gemini API key from Google AI Studio*
4. Go to **Settings** > **Pages**:
   * Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. The workflow (`.github/workflows/bi-daily-curation.yml`) will automatically trigger:
   * Everyday at **06:00 AM BST** (00:00 UTC)
   * Everyday at **06:00 PM BST** (12:00 UTC)
   * Or manually via **Actions** > **Run workflow** anytime.
