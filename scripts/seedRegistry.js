// Seeding script to generate a 500+ company registry
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly configured active verified boards
const verifiedCompanies = [
  // Greenhouse active
  { name: "Figma", careersUrl: "https://boards.greenhouse.io/figma", companyType: "Product", atsType: "Greenhouse", atsSlug: "figma" },
  { name: "Stripe", careersUrl: "https://boards.greenhouse.io/stripe", companyType: "Product", atsType: "Greenhouse", atsSlug: "stripe" },
  { name: "GitLab", careersUrl: "https://boards.greenhouse.io/gitlab", companyType: "Remote-First", atsType: "Greenhouse", atsSlug: "gitlab" },
  { name: "MongoDB", careersUrl: "https://boards.greenhouse.io/mongodb", companyType: "Product", atsType: "Greenhouse", atsSlug: "mongodb" },
  { name: "Elastic", careersUrl: "https://boards.greenhouse.io/elastic", companyType: "Remote-First", atsType: "Greenhouse", atsSlug: "elastic" },
  { name: "Datadog", careersUrl: "https://boards.greenhouse.io/datadog", companyType: "Product", atsType: "Greenhouse", atsSlug: "datadog" },
  { name: "Reddit", careersUrl: "https://boards.greenhouse.io/reddit", companyType: "Product", atsType: "Greenhouse", atsSlug: "reddit" },
  { name: "Gusto", careersUrl: "https://boards.greenhouse.io/gusto", companyType: "Product", atsType: "Greenhouse", atsSlug: "gusto" },
  { name: "Instacart", careersUrl: "https://boards.greenhouse.io/instacart", companyType: "Product", atsType: "Greenhouse", atsSlug: "instacart" },
  { name: "Coinbase", careersUrl: "https://boards.greenhouse.io/coinbase", companyType: "Remote-First", atsType: "Greenhouse", atsSlug: "coinbase" },
  { name: "Roblox", careersUrl: "https://boards.greenhouse.io/roblox", companyType: "Product", atsType: "Greenhouse", atsSlug: "roblox" },
  { name: "Coursera", careersUrl: "https://boards.greenhouse.io/coursera", companyType: "Product", atsType: "Greenhouse", atsSlug: "coursera" },
  { name: "Affirm", careersUrl: "https://boards.greenhouse.io/affirm", companyType: "Product", atsType: "Greenhouse", atsSlug: "affirm" },
  { name: "Amplitude", careersUrl: "https://boards.greenhouse.io/amplitude", companyType: "Product", atsType: "Greenhouse", atsSlug: "amplitude" },
  { name: "Asana", careersUrl: "https://boards.greenhouse.io/asana", companyType: "Product", atsType: "Greenhouse", atsSlug: "asana" },
  
  // Lever active
  { name: "Lever Inc.", careersUrl: "https://jobs.lever.co/lever", companyType: "Product", atsType: "Lever", atsSlug: "lever" },
  { name: "Netflix", careersUrl: "https://jobs.lever.co/netflix", companyType: "Product", atsType: "Lever", atsSlug: "netflix" },
  { name: "Medium", careersUrl: "https://jobs.lever.co/medium", companyType: "Product", atsType: "Lever", atsSlug: "medium" },
  { name: "Palantir", careersUrl: "https://jobs.lever.co/palantir", companyType: "Product", atsType: "Lever", atsSlug: "palantir" },
  { name: "Lever Demo", careersUrl: "https://jobs.lever.co/leverdemo", companyType: "Product", atsType: "Lever", atsSlug: "leverdemo" },

  // Ashby active
  { name: "Renterra", careersUrl: "https://jobs.ashbyhq.com/renterra", companyType: "Startup", atsType: "Ashby", atsSlug: "renterra" },
  { name: "Canals", careersUrl: "https://jobs.ashbyhq.com/canals", companyType: "Startup", atsType: "Ashby", atsSlug: "canals" },
  { name: "Mechanize", careersUrl: "https://jobs.ashbyhq.com/mechanize", companyType: "Startup", atsType: "Ashby", atsSlug: "mechanize" },
  { name: "Linear", careersUrl: "https://jobs.ashbyhq.com/linear", companyType: "Remote-First", atsType: "Ashby", atsSlug: "linear" },
  { name: "Vercel", careersUrl: "https://jobs.ashbyhq.com/vercel", companyType: "Remote-First", atsType: "Ashby", atsSlug: "vercel" },
  { name: "Cursor AI", careersUrl: "https://jobs.ashbyhq.com/cursor", companyType: "AI-Startup", atsType: "Ashby", atsSlug: "cursor" },
  { name: "Warp Terminal", careersUrl: "https://jobs.ashbyhq.com/warp", companyType: "Startup", atsType: "Ashby", atsSlug: "warp" },
  { name: "Modal Labs", careersUrl: "https://jobs.ashbyhq.com/modal", companyType: "AI-Startup", atsType: "Ashby", atsSlug: "modal" }
];

// Base Lists to generate 500+ companies
const aiNames = [
  "OpenAI", "Anthropic", "Hugging Face", "Perplexity AI", "Cohere", "Midjourney", "ElevenLabs", "Runway", 
  "Jasper", "Character.ai", "Mistral AI", "Phind", "Harvey", "Adept", "Inflection", "Synthesia", "Scale AI", 
  "DeepL", "Writer", "AssemblyAI", "Deepgram", "Pinecone", "Weaviate", "Chroma", "Qdrant", "LangChain", 
  "LlamaIndex", "Weights & Biases", "Anyscale", "Together AI", "CoreWeave", "Lambda Labs", "RunPod", "Groq", 
  "Cerebras", "SambaNova", "Graphcore", "Tenstorrent", "D-Matrix", "Modular", "Lightning AI", "Stability AI",
  "Pika Labs", "HeyGen", "Synthesia", "Defog", "Replika", "Shield AI", "Cognition AI", "Phind", "Glean", "Perplexity",
  "Sana Labs", "Typeface", "Kognitos", "Harvey AI", "Regie.ai", "Coda", "Mem.ai", "Rewind AI", "Tabnine"
];

const unicornNames = [
  "Meesho", "CRED", "Zepto", "Groww", "Delhivery", "BharatPe", "ShareChat", "PhonePe", "Razorpay", "Swiggy", 
  "Zomato", "Cars24", "Spinny", "Licious", "Dream11", "Upstox", "Zerodha", "INDmoney", "Scripbox", "Smallcase",
  "Nykaa", "Paytm", "Pine Labs", "InMobi", "Postman", "Ola Cabs", "Ola Electric", "Unacademy", "Eruditus", 
  "Lead School", "PhysicsWallah", "Byju's", "Vedantu", "UpGrad", "PharmEasy", "1mg", "Cure.fit", "Groww", 
  "Polygon", "CoinDCX", "CoinSwitch", "Mobile Premier League", "Acko", "Digit Insurance", "PolicyBazaar",
  "FirstCry", "Mamaearth", "Sugar Cosmetics", "Purplle", "Nykaa", "Myntra", "Ajio", "Snapdeal", "Flipkart"
];

const ycNames = [
  "Airbnb", "Dropbox", "Reddit", "Stripe", "Segment", "PagerDuty", "Webflow", "Retool", "Amplitude", "Mixpanel", 
  "Heap", "Optimizely", "Gusto", "Rappi", "Faire", "Brex", "Carta", "Flexport", "Instacart", "DoorDash", 
  "Zapier", "Docker", "Cruise", "Boom Supersonic", "Helion", "Algolia", "Clever", "Benchling", "Deel", "Rippling", 
  "Papaya", "Checkr", "Scribd", "Weebly", "Heroku", "Webflow", "Gusto", "Rippling", "Kovai", "Orange", "Standard"
];

const remoteNames = [
  "Automattic", "Buffer", "Ghost", "Hotjar", "Doist", "Zapier", "InVision", "Basecamp", "DuckDuckGo", "10up", 
  "Aha!", "Articulate", "Close", "Collage", "ConvertKit", "Expensify", "Gitbook", "Help Scout", "Knack", 
  "Lullabot", "Modern Tribe", "Netlify", "Olark", "Omnisend", "OpenProject", "ScraperAPI", "Shogun", 
  "SimpleTexting", "SitePen", "Sourcegraph", "TaxJar", "Toptal", "Toggl", "Vercel", "X-Team", "YouNeedABudget",
  "TailwindLabs", "Laravel", "Basecamp", "Shogun", "Prisma", "Supabase", "PlanetScale", "Fly.io", "Render"
];

const productNames = [
  "Figma", "Google", "Apple", "Microsoft", "Amazon", "Meta", "Adobe", "Salesforce", "Oracle", "Cisco", 
  "Intel", "AMD", "NVIDIA", "IBM", "HP", "Dell", "Lenovo", "Samsung", "LG", "Sony", "Panasonic", "Tesla", 
  "SpaceX", "Boeing", "Siemens", "GE", "Philips", "Bosch", "ABB", "Schneider Electric", "Eaton", "Honeywell", 
  "Zoom", "Slack", "Atlassian", "Jira", "Trello", "Confluence", "GitHub", "GitLab", "Bitbucket", "Box", 
  "Dropbox", "Notion", "Coda", "Airtable", "Asana", "Monday", "Smartsheet", "Wrike", "Trello", "Asana"
];

const serviceNames = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini", "Tech Mahindra", "LTIMindtree", "HCL", "DXC", 
  "Genpact", "IBM Services", "Deloitte", "PwC", "EY", "KPMG", "McKinsey", "BCG", "Bain", "Booz Allen", 
  "SAIC", "Leidos", "CACI", "ManTech", "Unisys", "Conduent", "Concentrix", "Teleperformance", "Webhelp", 
  "Majorel", "TaskUs", "VXI", "Alorica", "Sitel", "Sykes", "UST Global", "EPAM", "Endava", "Grid Dynamics", 
  "Luxoft", "Globant", "Nagarro", "Perficient", "Sogeti", "Virtusa", "Zensar", "Mindtree", "Hexaware"
];

const indianStartups = [
  "Jupiter", "Fi Money", "Slice", "Khatabook", "OneCard", "Rupeek", "Niyo", "Uni Cards", "Jar", "Fi", 
  "KreditBee", "Navi", "MoneyView", "Avail Finance", "EarlySalary", "LazyPay", "Simple", "Bullet", "Freo",
  "Dunzo", "Shadowfax", "Porter", "Blowhorn", "Letstransport", "Shiprocket", "Pickrr", "NimbusPost", "LogiNext",
  "Phable", "HealthifyMe", "Fittr", "Cult.fit", "HealthKart", "Tatacliq", "Limeroad", "Koovs", "Zivame"
];

const registries = new Map();

// Add verified ones first
verifiedCompanies.forEach(c => registries.set(c.name.toLowerCase(), c));

// Helper to generate ATS details dynamically for fake/seed registries
function generateATSDetails(name, type) {
  const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Assign realistic ATS hosting options for testing discovery
  if (type === "AI-Startup" || type === "Startup") {
    // 40% Ashby, 30% Greenhouse, 30% Lever
    const rand = Math.random();
    if (rand < 0.4) {
      return { atsType: "Ashby", careersUrl: `https://jobs.ashbyhq.com/${nameClean}`, atsSlug: nameClean };
    } else if (rand < 0.7) {
      return { atsType: "Greenhouse", careersUrl: `https://boards.greenhouse.io/${nameClean}`, atsSlug: nameClean };
    } else {
      return { atsType: "Lever", careersUrl: `https://jobs.lever.co/${nameClean}`, atsSlug: nameClean };
    }
  } else if (type === "Product" || type === "Unicorn") {
    // 50% Greenhouse, 30% Lever, 20% Workday
    const rand = Math.random();
    if (rand < 0.5) {
      return { atsType: "Greenhouse", careersUrl: `https://boards.greenhouse.io/${nameClean}`, atsSlug: nameClean };
    } else if (rand < 0.8) {
      return { atsType: "Lever", careersUrl: `https://jobs.lever.co/${nameClean}`, atsSlug: nameClean };
    } else {
      return { atsType: "Workday", careersUrl: `https://${nameClean}.myworkdayjobs.com/Careers`, atsSlug: nameClean };
    }
  } else if (type === "Service") {
    // 40% SmartRecruiters, 30% BambooHR, 30% Teamtailor
    const rand = Math.random();
    if (rand < 0.4) {
      return { atsType: "SmartRecruiters", careersUrl: `https://careers.smartrecruiters.com/${nameClean}`, atsSlug: nameClean };
    } else if (rand < 0.7) {
      return { atsType: "BambooHR", careersUrl: `https://${nameClean}.bamboohr.com/jobs/`, atsSlug: nameClean };
    } else {
      return { atsType: "Teamtailor", careersUrl: `https://${nameClean}.teamtailor.com/jobs`, atsSlug: nameClean };
    }
  }
  
  return { atsType: null, careersUrl: `https://${nameClean}.com/careers`, atsSlug: null };
}

// Add lists to ensure we hit 500+ unique entries
function addFromList(list, type) {
  list.forEach(name => {
    const key = name.toLowerCase();
    if (!registries.has(key)) {
      const atsDetails = generateATSDetails(name, type);
      registries.set(key, {
        name,
        careersUrl: atsDetails.careersUrl,
        companyType: type,
        atsType: atsDetails.atsType,
        atsSlug: atsDetails.atsSlug,
        hiringStatus: "Passive",
        lastCrawlTime: null
      });
    }
  });
}

addFromList(aiNames, "AI-Startup");
addFromList(unicornNames, "Unicorn");
addFromList(ycNames, "YC-Startup");
addFromList(remoteNames, "Remote-First");
addFromList(productNames, "Product");
addFromList(serviceNames, "Service");
addFromList(indianStartups, "Indian-Startup");

// Fill up with generated names if we are below 510
let count = registries.size;
const sectors = ["Product", "Service", "Unicorn", "YC-Startup", "Remote-First", "AI-Startup", "Indian-Startup"];
while (registries.size < 510) {
  const i = registries.size;
  const name = `TechCorp-${i}`;
  const type = sectors[i % sectors.length];
  const atsDetails = generateATSDetails(name, type);
  registries.set(name.toLowerCase(), {
    name,
    careersUrl: atsDetails.careersUrl,
    companyType: type,
    atsType: atsDetails.atsType,
    atsSlug: atsDetails.atsSlug,
    hiringStatus: "Passive",
    lastCrawlTime: null
  });
}

const finalRegistry = Array.from(registries.values());

const dir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(
  path.join(dir, 'companies_registry.json'),
  JSON.stringify(finalRegistry, null, 2),
  'utf8'
);

console.log(`Successfully generated registry with ${finalRegistry.length} companies!`);
console.log(`Saved to src/data/companies_registry.json`);
