/**
 * Data Sourcing Matrix for BeAGod Ingestion Engine
 * Categorized RSS and JSON endpoints covering Global Geopolitics,
 * Bangladesh Context, Deep Tech / Engineering, Social Signals, and Opportunities.
 */

export const SOURCES = [
  // 1. Global Geopolitics & Macro Economy
  {
    name: 'BBC World News',
    category: 'GEOPOLITICS',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    credibility: 'Official BBC World broadcast wire with global diplomatic coverage'
  },
  {
    name: 'BBC Business & Finance',
    category: 'ECONOMY_FINANCE',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    credibility: 'Global macroeconomic and central banking market reports'
  },
  {
    name: 'Al Jazeera English',
    category: 'GEOPOLITICS',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    credibility: 'In-depth international affairs with strong Global South & Middle East perspectives'
  },
  {
    name: 'Google News World Wire',
    category: 'GEOPOLITICS',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
    credibility: 'Aggregated top wire reports across Reuters, AP, and major international bureaus'
  },

  // 2. Bangladesh Context (Specifically for a MIST Student in Dhaka)
  {
    name: 'The Daily Star (Front Page)',
    category: 'GEOPOLITICS',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'https://www.thedailystar.net/frontpage/rss.xml',
    credibility: 'Leading English daily in Bangladesh covering national policy and strategic infrastructure'
  },
  {
    name: 'The Daily Star (Business & Tech)',
    category: 'ECONOMY_FINANCE',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'https://www.thedailystar.net/business/rss.xml',
    credibility: 'Bangladesh macro-fiscal updates, exports, forex reserves, and corporate developments'
  },
  {
    name: 'The Business Standard (TBS)',
    category: 'ECONOMY_FINANCE',
    type: 'rss',
    source_type: 'MAJOR_OUTLET',
    url: 'https://www.tbsnews.net/rss.xml',
    credibility: 'High-signal business, industry, and fiscal reporting in Bangladesh'
  },

  // 3. High-Credibility Niche, Engineering & Deep-Tech Platforms
  {
    name: 'Ars Technica',
    category: 'TECH_ENGINEERING',
    type: 'rss',
    source_type: 'NICHE_CREDIBLE',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    credibility: 'Rigorous technical journalism covering semiconductors, cybersecurity, and space systems'
  },
  {
    name: 'MIT Technology Review',
    category: 'TECH_ENGINEERING',
    type: 'rss',
    source_type: 'NICHE_CREDIBLE',
    url: 'https://www.technologyreview.com/feed/',
    credibility: 'MIT premier publication analyzing breakthrough emerging technologies'
  },
  {
    name: 'IEEE Spectrum',
    category: 'TECH_ENGINEERING',
    type: 'rss',
    source_type: 'NICHE_CREDIBLE',
    url: 'https://spectrum.ieee.org/feeds/feed.rss',
    credibility: 'Flagship engineering journal for electrical, compute, robotics, and applied science'
  },
  {
    name: 'Quanta Magazine',
    category: 'TECH_ENGINEERING',
    type: 'rss',
    source_type: 'NICHE_CREDIBLE',
    url: 'https://api.quantamagazine.org/feed/',
    credibility: 'In-depth mathematics, theoretical physics, and computational biology research'
  },
  {
    name: 'Farnam Street',
    category: 'ADULTING_MENTAL_MODELS',
    type: 'rss',
    source_type: 'NICHE_CREDIBLE',
    url: 'https://fs.blog/feed/',
    credibility: 'Mental models, high-leverage decision frameworks, and cognitive discipline'
  },

  // 4. Global Opportunities Sources (Strict 30% Allocation)
  {
    name: 'Opportunity Desk',
    category: 'OPPORTUNITIES',
    type: 'rss',
    source_type: 'OPPORTUNITY_PORTAL',
    url: 'https://opportunitydesk.org/feed/',
    credibility: 'Global portal for fully funded scholarships, fellowships, conferences, and grants'
  },
  {
    name: 'Youth Opportunities',
    category: 'OPPORTUNITIES',
    type: 'rss',
    source_type: 'OPPORTUNITY_PORTAL',
    url: 'https://www.youthop.com/feed',
    credibility: 'Worldwide youth opportunity discovery platform originated in Bangladesh'
  },
  {
    name: 'Scholars4Dev',
    category: 'OPPORTUNITIES',
    type: 'rss',
    source_type: 'OPPORTUNITY_PORTAL',
    url: 'https://www.scholars4dev.com/feed/',
    credibility: 'Curated international scholarships for developing country students'
  }
];

export const REDDIT_SUBREDDITS = [
  { sub: 'geopolitics', category: 'GEOPOLITICS' },
  { sub: 'Economics', category: 'ECONOMY_FINANCE' },
  { sub: 'engineering', category: 'TECH_ENGINEERING' },
  { sub: 'MachineLearning', category: 'TECH_ENGINEERING' },
  { sub: 'PersonalFinance', category: 'ADULTING_MENTAL_MODELS' }
];
