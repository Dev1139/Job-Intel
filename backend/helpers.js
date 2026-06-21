// Parsing, job detection, and metadata extraction utilities

export function isExcluded(title) {
  if (!title) return true;
  const t = title.toLowerCase();
  const exclusions = [
    'senior', 'sr.', 'sr ', 'lead', 'principal', 'staff', 'manager', 
    'director', 'vp', 'head', 'architect', 'expert', 'specialist', 
    'fellow', 'lead ', ' sr'
  ];
  return exclusions.some(word => t.includes(word));
}

export function detectExperience(title, text) {
  const t = (title || '').toLowerCase();
  const txt = (text || '').toLowerCase();
  
  if (t.includes('junior') || t.includes('jr') || t.includes('entry') || 
      t.includes('associate') || t.includes('fresher') || t.includes('graduate') || 
      t.includes('intern') || t.includes('co-op') || t.includes('fresh grad')) {
    return 0;
  }
  
  const match = txt.match(/\b([0-3])\+?\s*years?\b/);
  if (match) return parseInt(match[1]);
  
  const rangeMatch = txt.match(/\b([0-3])\s*-\s*([1-3])\s*years?\b/);
  if (rangeMatch) return parseInt(rangeMatch[1]);
  
  if (t.includes(' ii') || t.includes(' 2')) return 2;
  if (t.includes(' iii') || t.includes(' 3')) return 3;
  
  return 1; // default to 1 year
}

export function isTechJob(title, text) {
  const t = (title || '').toLowerCase();
  
  // Explicitly check for non-tech job titles
  const nonTechKeywords = [
    'sales', 'marketing', 'human resources', 'recruiter', 'recruiting', 'hr specialist', 'hr manager', 
    'accountant', 'finance', 'financial', 'legal counsel', 'attorney', 'office manager', 'receptionist', 
    'facilities', 'growth hacker', 'copywriter', 'content creator', 'sales development', 'account executive', 
    'customer success', 'customer support agent', 'medical', 'nurse', 'doctor', 'therapist', 'sales representative',
    'payroll', 'billing', 'administrative assistant', 'executive assistant', 'operations manager', 'operations associate',
    'b2b sales', 'bdr', 'sdr', 'hr generalist', 'talent acquisition'
  ];
  if (nonTechKeywords.some(keyword => t.includes(keyword))) {
    return false;
  }

  // Check for tech keywords in title or text
  const techKeywords = [
    'developer', 'engineer', 'programmer', 'architect', 'analyst', 'scientist', 'designer', 
    'product manager', 'product owner', 'qa', 'sdet', 'scrum master', 'technical', 'tech', 
    'coder', 'member of technical staff', 'mts', 'sre', 'devops', 'cloud', 'sysadmin', 
    'system administrator', 'ux', 'ui', 'frontend', 'backend', 'fullstack', 'full-stack', 
    'mobile', 'ios', 'android', 'data', 'security', 'information technology', 'support specialist',
    'systems administrator', 'network admin', 'database admin', 'dba', 'it specialist', 'scrum', 'networks'
  ];
  if (techKeywords.some(keyword => t.includes(keyword))) {
    return true;
  }
  
  return false;
}

export function detectRoleCategory(title, text) {
  const t = (title || '').toLowerCase();
  
  if (t.includes('frontend') || t.includes('front-end') || t.includes('ui developer') || t.includes('react developer')) {
    return 'Frontend';
  }
  if (t.includes('backend') || t.includes('back-end') || t.includes('node developer') || t.includes('python developer') || t.includes('java developer') || t.includes('go developer')) {
    return 'Backend';
  }
  if (t.includes('fullstack') || t.includes('full-stack') || t.includes('mern') || t.includes('full stack')) {
    return 'Full Stack';
  }
  if (t.includes('mobile') || t.includes('ios') || t.includes('android') || t.includes('swift') || t.includes('kotlin') || t.includes('flutter')) {
    return 'Mobile';
  }
  if (t.includes('devops') || t.includes('sre') || t.includes('infrastructure') || t.includes('cloud') || t.includes('platform engineer') || t.includes('sysadmin') || t.includes('network')) {
    return 'DevOps';
  }
  if (t.includes('qa') || t.includes('testing') || t.includes('sdet') || t.includes('quality assurance') || t.includes('test engineer') || t.includes('automation engineer')) {
    return 'QA';
  }
  if (t.includes('data engineer') || t.includes('data engineering') || t.includes('etl') || t.includes('spark')) {
    return 'Data Engineering';
  }
  if (t.includes('data scientist') || t.includes('data science') || t.includes('data analyst') || t.includes('analytics')) {
    return 'Data Science / Analytics';
  }
  if (t.includes('ai') || t.includes('ml') || t.includes('machine learning') || t.includes('deep learning') || t.includes('computer vision') || t.includes('nlp') || t.includes('genai') || t.includes('generative ai') || t.includes('llm') || t.includes('openai')) {
    return 'AI / ML';
  }
  if (t.includes('designer') || t.includes('ui/ux') || t.includes('ux designer') || t.includes('product designer') || t.includes('figma')) {
    return 'UI/UX Design';
  }
  if (t.includes('product manager') || t.includes('product owner') || t.includes('pm') || t.includes('technical product manager')) {
    return 'Product Management';
  }
  
  // Generic Software Engineer Fallback
  if (t.includes('software') || t.includes('engineer') || t.includes('developer') || t.includes('coder') || t.includes('mts') || t.includes('member of technical staff') || t.includes('programmer')) {
    return 'Software Engineering';
  }
  
  return 'Tech Role';
}

export function detectSkills(title, text) {
  const t = (title || '').toLowerCase();
  const txt = (text || '').toLowerCase();
  const content = t + ' ' + txt;
  
  const skillsList = [
    // Languages
    { name: 'JavaScript', keywords: ['javascript', 'js', 'es6'] },
    { name: 'TypeScript', keywords: ['typescript', 'ts'] },
    { name: 'Python', keywords: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'] },
    { name: 'Java', keywords: ['java', 'spring', 'springboot', 'spring boot', 'hibernate'] },
    { name: 'Go', keywords: ['golang'], regex: /\bgo\b/ },
    { name: 'C++', keywords: ['c++', 'cpp'] },
    { name: 'C#', keywords: ['c#', 'csharp', '.net', 'dotnet'] },
    { name: 'Ruby', keywords: ['ruby', 'rails'] },
    { name: 'PHP', keywords: ['php', 'laravel', 'wordpress'] },
    { name: 'Rust', keywords: ['rust'] },
    { name: 'Swift', keywords: ['swift', 'ios'] },
    { name: 'Kotlin', keywords: ['kotlin', 'android'] },
    { name: 'SQL', keywords: ['sql', 'postgres', 'mysql', 'oracle', 'sqlite', 'sql server'] },
    { name: 'NoSQL', keywords: ['nosql', 'mongo', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'elasticsearch'] },
    
    // Web Frameworks & Frontend
    { name: 'React', keywords: ['react', 'nextjs', 'next.js', 'remix', 'gatsby'] },
    { name: 'Angular', keywords: ['angular', 'angularjs'] },
    { name: 'Vue.js', keywords: ['vue', 'vuejs'] },
    { name: 'Svelte', keywords: ['svelte'] },
    { name: 'Node.js', keywords: ['node', 'nodejs', 'nestjs'] },
    { name: 'Express', keywords: ['express'] },
    { name: 'HTML/CSS', keywords: ['html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap'] },
    
    // Cloud & DevOps
    { name: 'AWS', keywords: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
    { name: 'GCP', keywords: ['gcp', 'google cloud'] },
    { name: 'Azure', keywords: ['azure'] },
    { name: 'Docker', keywords: ['docker', 'container'] },
    { name: 'Kubernetes', keywords: ['kubernetes', 'k8s'] },
    { name: 'Terraform', keywords: ['terraform'] },
    { name: 'CI/CD', keywords: ['ci/cd', 'jenkins', 'github actions', 'gitlab ci'] },
    
    // Mobile Development
    { name: 'Flutter', keywords: ['flutter'] },
    { name: 'React Native', keywords: ['react native', 'react-native'] },
    
    // Data & AI/ML
    { name: 'AI/ML', keywords: ['ai/ml', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'keras', 'computer vision', 'nlp', 'scikit'] },
    { name: 'GenAI', keywords: ['genai', 'generative ai', 'openai', 'llm', 'llms', 'gpt', 'anthropic', 'claude', 'langchain', 'llama', 'prompt eng'] },
    { name: 'Data Engineering', keywords: ['data engineer', 'spark', 'hadoop', 'etl', 'databricks', 'snowflake', 'kafka'] },
    
    // Testing & QA
    { name: 'QA Testing', keywords: ['qa ', 'testing', 'selenium', 'cypress', 'playwright', 'junit', 'jest', 'sdet', 'manual test', 'automation test'] },
    
    // Product & Design
    { name: 'UI/UX Design', keywords: ['ui/ux', 'figma', 'sketch', 'adobe xd', 'product design'] },
    { name: 'Product Management', keywords: ['product manager', 'product management', 'agile', 'scrum', 'jira', 'product owner'] },
    
    // DSA
    { name: 'DSA', keywords: ['dsa', 'data structures', 'algorithms'] }
  ];
  
  const found = [];
  skillsList.forEach(s => {
    let matched = false;
    if (s.keywords && s.keywords.some(k => content.includes(k))) {
      matched = true;
    }
    if (!matched && s.regex && s.regex.test(content)) {
      matched = true;
    }
    if (matched) {
      found.push(s.name);
    }
  });
  
  // Custom MERN detection
  if (found.includes('React') && found.includes('Node.js') && found.includes('NoSQL') && content.includes('mongo')) {
    found.push('MERN');
  }
  
  return found;
}

export function detectWorkMode(title, location, text) {
  const t = (title || '').toLowerCase();
  const loc = (location || '').toLowerCase();
  const txt = (text || '').toLowerCase();
  const content = t + ' ' + loc + ' ' + txt;
  
  if (content.includes('remote') || content.includes('telecommute') || content.includes('distributed')) {
    return 'Remote';
  }
  if (content.includes('hybrid')) {
    return 'Hybrid';
  }
  return 'Onsite';
}

export function detectSalary(text) {
  if (!text) return { min: null, max: null, str: 'Not specified' };
  
  const txt = text.replace(/,/g, ''); // strip commas
  
  // USD ranges e.g. $80k - $120k
  const kRange = txt.match(/\$(\d{2,3})k\s*-\s*\$(\d{2,3})k/i);
  if (kRange) {
    const minLPA = Math.round(parseInt(kRange[1]) * 1000 * 0.000083);
    const maxLPA = Math.round(parseInt(kRange[2]) * 1000 * 0.000083);
    return { min: minLPA, max: maxLPA, str: `${minLPA} - ${maxLPA} LPA ($${kRange[1]}k - $${kRange[2]}k)` };
  }

  // Full USD range e.g. $80000 - $120000
  const numRange = txt.match(/\$(\d{5,6})\s*-\s*\$(\d{5,6})/);
  if (numRange) {
    const minLPA = Math.round(parseInt(numRange[1]) * 0.000083);
    const maxLPA = Math.round(parseInt(numRange[2]) * 0.000083);
    return { min: minLPA, max: maxLPA, str: `${minLPA} - ${maxLPA} LPA` };
  }

  // LPA range e.g. 12-18 LPA
  const lpaRange = txt.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*LPA/i);
  if (lpaRange) {
    const min = parseInt(lpaRange[1]);
    const max = parseInt(lpaRange[2]);
    return { min, max, str: `${min} - ${max} LPA` };
  }

  return { min: null, max: null, str: 'Not specified' };
}

export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ');
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function detectInterviewInsights(title, text) {
  const t = (title || '').toLowerCase();
  const txt = (text || '').toLowerCase();
  const content = t + ' ' + txt;
  
  let prepDifficulty = 'Medium';
  let focusAreas = ['DSA Basics', 'General Technical Round'];
  let prepTime = '1-2 weeks';
  
  if (t.includes('junior') || t.includes('entry') || t.includes('associate') || t.includes('fresher') || t.includes('graduate')) {
    prepDifficulty = 'Easy';
    focusAreas = ['Coding Patterns (Arrays/Strings)', 'Basic DSA', 'OOP Concepts', 'DBMS Basics'];
    prepTime = '1 week';
  } else if (t.includes('architect') || t.includes('principal') || t.includes('expert') || t.includes('staff')) {
    prepDifficulty = 'Hard';
    focusAreas = ['System Design (Scalability, Databases)', 'High Level Architecture', 'Concurrency & Low Level Design'];
    prepTime = '4+ weeks';
  } else {
    // Intermediate / General roles - check by category keywords
    if (t.includes('frontend') || t.includes('react') || t.includes('ui developer')) {
      focusAreas = ['JS Deep Dive (Closures, Event Loop)', 'React Hooks & State Management', 'Frontend System Design & Performance'];
      prepTime = '2 weeks';
    } else if (t.includes('backend') || t.includes('node') || t.includes('python developer') || t.includes('java developer') || t.includes('go developer')) {
      focusAreas = ['System Design (Caching, Load Balancers)', 'API Design & Security', 'Database Indexing & Query Optimisation', 'DSA Intermediate'];
      prepTime = '3 weeks';
    } else if (t.includes('fullstack') || t.includes('full-stack') || t.includes('mern') || t.includes('full stack')) {
      focusAreas = ['Full Stack Architecture', 'API Integration', 'React Performance', 'Database schema design'];
      prepTime = '2-3 weeks';
    } else if (t.includes('devops') || t.includes('sre') || t.includes('infrastructure') || t.includes('cloud')) {
      focusAreas = ['Docker & Kubernetes orchestration', 'CI/CD pipeline architecture', 'Cloud Infrastructure (AWS/GCP)', 'Linux Internals & Scripting'];
      prepTime = '3 weeks';
    } else if (t.includes('qa') || t.includes('testing') || t.includes('sdet')) {
      focusAreas = ['Automation Frameworks (Selenium/Playwright)', 'API Testing & Cypress', 'Writing clean integration tests', 'Basic Programming'];
      prepTime = '1-2 weeks';
    } else if (t.includes('data engineer') || t.includes('data engineering')) {
      focusAreas = ['Distributed systems (Spark/Hadoop)', 'ETL Pipeline Design', 'SQL Performance & Data Warehousing', 'Python scripting'];
      prepTime = '3 weeks';
    } else if (t.includes('data scientist') || t.includes('data science') || t.includes('ai') || t.includes('ml') || t.includes('machine learning') || t.includes('deep learning')) {
      focusAreas = ['Machine Learning Algorithms', 'Deep Learning framework (PyTorch/TensorFlow)', 'Statistical modeling & probability', 'Python / SQL basics'];
      prepTime = '3-4 weeks';
    }
  }
  
  return { prepDifficulty, focusAreas, prepTime };
}

export function detectBenefitsAndPerks(text) {
  if (!text) return [];
  const txt = text.toLowerCase();
  
  const perksList = [
    { name: 'Equity / Stock Options', keywords: ['equity', 'stock options', 'rsu', 'stock grant', 'shares', 'ownership'] },
    { name: 'Health Insurance', keywords: ['health insurance', 'medical insurance', 'dental', 'vision care', 'healthcare', 'medical coverage'] },
    { name: 'Unlimited PTO', keywords: ['unlimited pto', 'unlimited vacation', 'unlimited holiday', 'flexible time off', 'unlimited p.t.o.'] },
    { name: 'Learning Budget', keywords: ['learning budget', 'education budget', 'tuition reimbursement', 'conference budget', 'learning stipend', 'courses'] },
    { name: 'Wellness Stipend', keywords: ['wellness stipend', 'gym membership', 'mental health benefit', 'fitness allowance', 'wellness allowance'] },
    { name: 'Home Office Allowance', keywords: ['home office allowance', 'home office stipend', 'wfh stipend', 'workspace setup', 'hardware allowance'] },
    { name: 'Parental Leave', keywords: ['parental leave', 'maternity leave', 'paternity leave', 'family leave'] },
    { name: 'Flexible Hours', keywords: ['flexible working hours', 'flexible hours', 'core hours', 'flex hours', 'choose your hours'] }
  ];
  
  const found = [];
  perksList.forEach(p => {
    if (p.keywords.some(k => txt.includes(k))) {
      found.push(p.name);
    }
  });
  
  return found;
}

export function detectVisaRelocation(text) {
  if (!text) return { visaSponsorship: 'Not mentioned', relocation: 'Not mentioned' };
  const txt = text.toLowerCase();
  
  let visaSponsorship = 'Not mentioned';
  if (txt.includes('visa sponsorship') || txt.includes('sponsor visa') || txt.includes('sponsorship available') || txt.includes('h1b support')) {
    visaSponsorship = 'Available';
  } else if (txt.includes('no visa sponsorship') || txt.includes('cannot sponsor') || txt.includes('unable to sponsor') || txt.includes('not offer sponsorship')) {
    visaSponsorship = 'Not available';
  }
  
  let relocation = 'Not mentioned';
  if (txt.includes('relocation assistance') || txt.includes('relocation support') || txt.includes('help with relocation') || txt.includes('relocation package')) {
    relocation = 'Available';
  } else if (txt.includes('no relocation') || txt.includes('cannot offer relocation')) {
    relocation = 'Not available';
  }
  
  return { visaSponsorship, relocation };
}

export function detectInterviewPrepDetails(roleCategory, title) {
  const cat = (roleCategory || '').trim();
  const t = (title || '').toLowerCase();
  
  let steps = [];
  let prepRoadmap = '';
  let resources = [];
  let frequentQuestions = [];

  switch (cat) {
    case 'Frontend':
      steps = [
        "Initial Recruiter Screening (CV check & culture alignment)",
        "Technical Screening (Basic JavaScript/TypeScript, CSS layouts, and live coding)",
        "Frontend System Design Round (Component architecture, state management, and web performance)",
        "Final Interview Loop (Behavioral, hiring manager, and coding challenges)"
      ];
      prepRoadmap = "Deepen your knowledge of raw JavaScript/TypeScript internals (closures, event loop, promises, prototypes). Study modern web performance metrics (Core Web Vitals), state management strategies, and frontend routing architecture. Practice building mock responsive interfaces or utility widgets without external libraries.";
      resources = [
        { name: "You Don't Know JS by Kyle Simpson", type: "Book", desc: "Best resource for mastering core JavaScript engine concepts." },
        { name: "MDN Web Docs - Client-side Web APIs & Security", type: "Documentation", desc: "The definitive reference for browser APIs, DOM tree, and CORS." },
        { name: "Frontend Masters - Advanced Web Performance & Architecture", type: "Course", desc: "High-level web architecture, build step optimization, and rendering pipelines." }
      ];
      frequentQuestions = [
        "How does the JavaScript Event Loop work? Describe task vs microtask queues.",
        "Explain React reconciliation, fiber architecture, and key attributes in lists.",
        "How would you optimize Largest Contentful Paint (LCP) and Interaction to Next Paint (INP)?",
        "Design a custom autocomplete search dropdown widget with debouncing and keyboard navigation."
      ];
      break;

    case 'Backend':
      steps = [
        "Recruiter Assessment Call",
        "Online Coding Challenge / DSA Screen (LeetCode medium complexity)",
        "System Design & Scalability Round (Microservices, database selection, messaging queues)",
        "Final Integration & Fit (Behavioral questions and technical leadership alignment)"
      ];
      prepRoadmap = "Master core backend system design: SQL vs NoSQL trade-offs, indexing strategies, caching patterns (Redis/Memcached), message brokers (Kafka/RabbitMQ), and API protocols (REST, GraphQL, gRPC). Understand concurrency patterns (goroutines, async/await event-loop, threads) of your preferred stack.";
      resources = [
        { name: "Designing Data-Intensive Applications by Martin Kleppmann", type: "Book", desc: "The gold standard book on databases, storage, and distributed systems." },
        { name: "System Design Primer by Donne Martin (GitHub)", type: "Open Source Guide", desc: "Comprehensive syllabus covering scalable architectures and protocols." },
        { name: "ByteByteGo by Alex Xu", type: "Course", desc: "Visual breakdowns of large-scale system design patterns and real-world case studies." }
      ];
      frequentQuestions = [
        "How do database indexes (B-Trees vs Hash indexes) improve read speed, and what is the write penalty?",
        "Explain ACID transactions vs BASE consistency models in distributed databases.",
        "How would you implement a distributed rate-limiting system across thousands of containers?",
        "Design a system like TinyURL or Pastebin (API layout, database schema, and scaling plan)."
      ];
      break;

    case 'Full Stack':
      steps = [
        "Initial Interview (Resume walkthrough and stack preview)",
        "Full-Stack Live Coding (Building a dynamic front-to-back widget)",
        "System Architecture & API Integration (Auth flows, SQL modeling, state sync)",
        "Hiring Manager Review & Culture Fit"
      ];
      prepRoadmap = "Ensure you are competent in both client-side rendering/state-sync and backend REST/GraphQL API construction. Learn web security basics (JWT, OAuth2, Session cookies, CORS, XSS, CSRF). Focus on designing end-to-end schemas for transactional database features.";
      resources = [
        { name: "Full Stack Open (University of Helsinki)", type: "Course", desc: "Excellent deep dive into React, Node.js, Express, databases, and CI/CD." },
        { name: "The Odin Project - Full Stack JavaScript Path", type: "Course", desc: "Hands-on projects covering full development lifecycles." },
        { name: "Web Security Academy by PortSwigger", type: "Tutorials", desc: "Learn to identify and protect against common web vulnerabilities." }
      ];
      frequentQuestions = [
        "Explain the flow of JWT authentication. Where should tokens be stored securely?",
        "What is CORS? How does a browser handle preflight requests, and how do you configure it in server middleware?",
        "Compare Server-Side Rendering (SSR) with Client-Side Rendering (CSR) regarding SEO, TTFB, and LCP.",
        "Design a relational database schema for a multi-tenant project manager app with projects, tasks, and members."
      ];
      break;

    case 'Mobile':
      steps = [
        "Initial Recruiter Screening",
        "Mobile Coding Screen (Custom view rendering, list display with network fetch)",
        "App Architecture & Engineering (Memory optimization, local storage, background processing)",
        "Final Interview Loop (Behavioral and team collaboration)"
      ];
      prepRoadmap = "Understand mobile application lifecycles, memory optimization, profiling tools (Xcode Instruments / Android Profiler), local databases (SQLite/CoreData/Room), and asynchronous networking. Be prepared to implement custom reactive UI elements in Swift/Kotlin or Flutter/React Native.";
      resources = [
        { name: "Kodeco (formerly Ray Wenderlich) Mobile Guides", type: "Platform", desc: "Top tutorials for iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose)." },
        { name: "Clean Architecture for Mobile Apps", type: "Guide", desc: "Adapting architecture patterns like MVVM, VIPER, and MVI for mobile devices." },
        { name: "Apple & Android Developer Documentation", type: "Official Docs", desc: "Primary manuals covering UI lifecycles, background tasks, and OS APIs." }
      ];
      frequentQuestions = [
        "What is a retain cycle (memory leak) in mobile code, and how do weak/unowned references fix it?",
        "How do you execute network requests off the main (UI) thread, and how do you marshal results back?",
        "Explain mobile app state transitions. What happens when an app is sent to the background?",
        "Design an offline-first mobile app dashboard that syncs with a server when connectivity returns."
      ];
      break;

    case 'DevOps':
      steps = [
        "Recruiter Screening Call",
        "Scripting & System Internals Test (Python/Go/Bash, Linux diagnostics)",
        "Infrastructure Architecture Round (Kubernetes, AWS/GCP config, IaC)",
        "Incident Review & Behavioral Loop"
      ];
      prepRoadmap = "Focus on modern infrastructure automation (Terraform, Ansible), container scheduling (Kubernetes concepts like Pods, Services, Deployments, ingress, and PVs), CI/CD pipelines (GitHub Actions, GitLab CI), Linux server administration, networking models, and logging/monitoring systems (Prometheus, ELK).";
      resources = [
        { name: "DevOps Roadmap (roadmap.sh)", type: "Interactive Path", desc: "Visual guide mapping out technologies required for DevOps engineers." },
        { name: "Kubernetes Up & Running by Kelsey Hightower", type: "Book", desc: "Practical hands-on guide to container runtime orchestration." },
        { name: "Terraform Up & Running by Yevgeniy Brikman", type: "Book", desc: "Great guide to managing infrastructure as code reliably." }
      ];
      frequentQuestions = [
        "How does a Kubernetes scheduling loop work? What happens when a container fails its readiness probe?",
        "Explain Canary deployment vs Blue/Green deployment, and how would you configure them using a load balancer?",
        "How do you secure secrets management (e.g. HashiCorp Vault) inside automated build environments?",
        "What is drift detection in Terraform, and how do you safely reconcile state files with actual cloud resources?"
      ];
      break;

    case 'QA':
      steps = [
        "Screening HR Interview",
        "Technical Automation Challenge (Writing assertions, locating selectors, handling async loads)",
        "Test Strategy & QA Process Discussion (Regression, regression suites, edge cases)",
        "Final Team Interview"
      ];
      prepRoadmap = "Master test automation frameworks (Playwright, Cypress, Selenium). Learn programming basics (JavaScript, Python, Java) to write robust automation tests. Understand API testing (Postman, SuperTest) and continuous deployment integration.";
      resources = [
        { name: "Test Automation University", type: "Free Learning Platform", desc: "Superb courses on Selenium, Playwright, Cypress, and Mobile testing." },
        { name: "Cypress & Playwright Official Docs", type: "Documentation", desc: "Best practices, syntax references, and testing cookbooks." },
        { name: "ISTQB Foundation Level Syllabus", type: "Reference Guideline", desc: "Covers formal QA terminology, black-box/white-box test methodologies." }
      ];
      frequentQuestions = [
        "What is the test automation pyramid? How do you balance unit, integration, and E2E tests?",
        "Explain test flakiness. What causes it (e.g. race conditions, dynamic IDs) and how do you resolve it?",
        "How do you test REST APIs? Walk through the assertions you would write for a user signup endpoint.",
        "What is the Page Object Model (POM) pattern in UI automation, and why is it recommended?"
      ];
      break;

    case 'Data Engineering':
      steps = [
        "Initial Technical screening",
        "Coding & SQL Challenge (Window functions, joins, analytical queries)",
        "Data Pipelines & Infrastructure Design (Spark, Hadoop, DBT, Airflow)",
        "Hiring Manager & System Architecture Assessment"
      ];
      prepRoadmap = "Review analytical SQL (window functions, subqueries, partitions), distributed compute (Apache Spark, Databricks), database engines (columnar stores like Snowflake/Redshift vs transactional databases), ETL pipeline tools (DBT, Airflow, Prefect), and schema modeling concepts (Star schema, Snowflake schema).";
      resources = [
        { name: "Data Engineering Zoomcamp (DataTalksClub)", type: "Course", desc: "Awesome free boot camp on docker, orchestration, dbt, Spark, and data warehouses." },
        { name: "Designing Data-Intensive Applications", type: "Book", desc: "Essential reading for distributed databases, partition layouts, and queues." },
        { name: "SQL for Data Analysis by Cathy Tanimura", type: "Book", desc: "Practical strategies for complex querying and data preparation." }
      ];
      frequentQuestions = [
        "What is the difference between OLTP and OLAP systems? When would you use a columnar storage engine?",
        "Explain Star Schema vs Snowflake Schema. What are dimension tables and fact tables?",
        "How does partition pruning and database indexing optimize large-scale analytical queries?",
        "Design a streaming data pipeline to process millions of IoT sensor messages per minute and load them into a data lake."
      ];
      break;

    case 'Data Science / Analytics':
      steps = [
        "Initial Recruiter Screen",
        "SQL & Quantitative Case Screening",
        "Business Case Study / Statistical Analysis Round (A/B testing, modeling)",
        "Hiring Manager Review"
      ];
      prepRoadmap = "Brush up on statistics (probability distributions, hypothesis testing, regression), SQL (aggregations, CTEs, subqueries), data visualization tools (Tableau, PowerBI, seaborn), and business metric formulations (churn rate, retention, LTV). Practice communicating numerical findings clearly.";
      resources = [
        { name: "Practical Statistics for Data Scientists by Bruce & Bruce", type: "Book", desc: "Covers data analysis, A/B testing, and exploratory modeling clearly." },
        { name: "Kaggle Competitions & Tutorials", type: "Platform", desc: "Practical hands-on notebooks working with real analytical datasets." },
        { name: "SQLZoo & LeetCode SQL Tracks", type: "Practice Tools", desc: "Great interactive resources for perfecting multi-table joins and data filtering." }
      ];
      frequentQuestions = [
        "How do you design and evaluate an A/B test? What factors determine sample size and statistical power?",
        "Write a SQL query using window functions to find the month-over-month percentage change in active users.",
        "How do you address missing values, outliers, and highly correlated variables in a raw dataset?",
        "Explain the difference between precision, recall, and F1-score. When is recall more important than precision?"
      ];
      break;

    case 'AI / ML':
      steps = [
        "HR Screening Call",
        "ML Engineering & Algorithms Test (Mathematics, NumPy, PyTorch/TensorFlow)",
        "ML Systems Design Round (Data ingestion, training feedback, real-time inference)",
        "Research Presentation / Behavioral Panel"
      ];
      prepRoadmap = "Master machine learning foundations (loss functions, optimization algorithms, regularization). Focus on deep learning architectures (CNNs, RNNs, Transformers, Self-Attention). Learn ML system architecture: serving models with low latency, model monitoring, vector search databases (Pinecone/Milvus), and retrieval-augmented generation (RAG).";
      resources = [
        { name: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", type: "Book", desc: "Covers classical and deep learning pipelines practically." },
        { name: "Designing Machine Learning Systems by Chip Huyen", type: "Book", desc: "Best resource on deploying, updating, and monitoring ML systems." },
        { name: "Fast.ai Practical Deep Learning for Coders", type: "Course", desc: "Top-down approach to coding state-of-the-art models immediately." }
      ];
      frequentQuestions = [
        "What is data leakage in machine learning, and how do you prevent it during split validations?",
        "Explain self-attention mechanics in Transformer models. What are Key, Query, and Value matrices?",
        "How would you design a real-time recommendation feed for millions of active users? Detail the architecture.",
        "What is gradient descent? Explain vanishing and exploding gradients and how layers like Batch Normalization mitigate them."
      ];
      break;

    case 'UI/UX Design':
      steps = [
        "Recruiter Screening Call",
        "Portfolio Review Round (Detailed walk-through of past case studies)",
        "Design whiteboard Challenge (Interactive problem solving in real-time)",
        "Cross-functional Fit (Collaborating with PMs and Devs)"
      ];
      prepRoadmap = "Practice describing your design process from research to implementation. Master typography, grid frameworks, hierarchy, design system governance, and Figma interactions. Understand digital accessibility guidelines (WCAG) and UX analytics (hotjar, user surveys).";
      resources = [
        { name: "The Design of Everyday Things by Don Norman", type: "Book", desc: "Fundamental reading on human-centered product usability." },
        { name: "Don't Make Me Think by Steve Krug", type: "Book", desc: "The bible of intuitive web usability and UX design." },
        { name: "Laws of UX (lawsofux.com)", type: "Reference Directory", desc: "Collection of visual design laws and cognitive psychology principles." }
      ];
      frequentQuestions = [
        "Walk us through a design case study. What user research did you conduct, and how did user feedback change the final mockups?",
        "How do you collaborate with engineering teams to ensure your responsive UI designs are implemented accurately?",
        "How do you approach designing forms and navigation for AA or AAA web accessibility compliance (WCAG)?",
        "Explain your system of component design in Figma. How do you construct reusable libraries and auto-layouts?"
      ];
      break;

    case 'Product Management':
      steps = [
        "Screening Chat",
        "Product Sense Case Study (Designing a new feature or strategy for a consumer base)",
        "Technical & Analytical Round (API structures, query logic, metrics execution)",
        "Leadership, Culture Fit & Final Review"
      ];
      prepRoadmap = "Master product strategy frameworks (RICE for prioritization, SWOT analysis, User Personas). Understand analytical tools, product lifecycles, and agile release management. Focus on defining crisp metrics (North Star, retention, conversion funnels).";
      resources = [
        { name: "Cracking the PM Interview by Gayle McDowell & Jackie Bavaro", type: "Book", desc: "Detailed guide covering PM roles, mock interviews, and sample questions." },
        { name: "Decode and Conquer by Lewis C. Lin", type: "Book", desc: "Great visual framework tool for answering product design case studies." },
        { name: "Product School Blog & Webinars", type: "Platform", desc: "Excellent insights from active PMs at top Silicon Valley enterprises." }
      ];
      frequentQuestions = [
        "What is your favorite mobile application and how would you redesign it to increase active engagement?",
        "How do you determine feature priority when your lead engineer wants stability but marketing wants a new release?",
        "How would you measure the success of a newly launched user onboarding walkthrough feature?",
        "Describe a product launch that failed. What did you learn, and what data did you use to pivot?"
      ];
      break;

    default: // Software Engineering or generic Tech Role
      steps = [
        "Recruiter Screening call",
        "Technical Screening (Online coding challenge, basic DSA)",
        "System Architecture & Live Design Round",
        "Behavioral & Alignment Round"
      ];
      prepRoadmap = "Solidify core Computer Science fundamentals: time/space complexities (Big O), data structures (arrays, hash maps, binary trees, graphs), sorting/searching patterns, object-oriented design principles, and basic web architecture concepts (DNS, HTTP cache, load balancers).";
      resources = [
        { name: "Cracking the Coding Interview by Gayle McDowell", type: "Book", desc: "Standard text for preparing coding, algorithms, and behavioral questions." },
        { name: "Grokking the System Design Interview", type: "Course", desc: "Visual introduction to scalability, caching, CDNs, and database layers." },
        { name: "LeetCode Blind 75 / Grind 75 Patterns", type: "Practice List", desc: "Curated lists of algorithmic topics grouped by pattern taxonomy." }
      ];
      frequentQuestions = [
        "Write a function to detect cycle loops in a directed graph structure.",
        "Explain key Object-Oriented design patterns (Singleton, Factory, Observer) and when to apply them.",
        "What happens when you type a URL into a browser address bar and press Enter? Explain end-to-end.",
        "Design a simple Pastebin or paste-sharing service. Detail the API schemas and write scaling calculations."
      ];
  }

  return { steps, prepRoadmap, resources, frequentQuestions };
}

