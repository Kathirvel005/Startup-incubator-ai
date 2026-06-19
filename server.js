require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Google Gemini API if key is present
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Using gemini-1.5-flash as default, it is fast and supports JSON output
    geminiModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Gemini AI API successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini AI SDK:", error.message);
  }
} else {
  console.log("No Gemini API key found. Using local mock analysis engine instead.");
}

// ----------------------------------------------------
// LOCAL MOCK ANALYZER DICTIONARY
// ----------------------------------------------------
const SECTORS = {
  ai: {
    name: "Artificial Intelligence & SaaS",
    successRange: [65, 85],
    riskRange: [30, 50],
    innovationRange: [80, 95],
    costPerPlatform: { "Web App": 35000, "Mobile App": 45000, "SaaS Portal": 40000, "Desktop App": 30000, "Hardware/IoT": 75000 },
    recommendations: [
      "Implement a clear privacy policy for user data and AI training data transparency.",
      "Add a multi-tenant subscription pricing model (Freemium, Pro, Enterprise).",
      "Incorporate human-in-the-loop validation to ensure quality outputs and avoid hallucinations.",
      "Develop API endpoints early so other developers can build on top of your engine."
    ],
    milestones: [
      { phase: "Phase 1: Foundation", title: "Model Selection & Core R&D", description: "Select foundational models, design the data pipeline, and establish database schema.", duration: "1-2 Months" },
      { phase: "Phase 2: MVP Development", title: "API Integrations & UI Design", description: "Build the Express/NextJS backend, integrate AI models, and create a sleek glassmorphic UI.", duration: "2-3 Months" },
      { phase: "Phase 3: Beta Launch", title: "User Testing & Feedback Loops", description: "Launch to a closed group of 100 beta testers, monitor model performance, and refine prompt designs.", duration: "1 Month" },
      { phase: "Phase 4: Scaling & Marketing", title: "Production Deployment", description: "Host on scalable cloud infrastructure (AWS/Vercel), launch marketing campaigns, and start monetizing.", duration: "Ongoing" }
    ],
    competitors: [
      { name: "OpenAI / Anthropic", type: "Direct (Foundation)", strength: "Infinite funding, massive research power", weakness: "Generalized tools, lacks custom domain focus", usp: "We focus on highly specialized, niche vertical automation." },
      { name: "Copy.ai / Jasper", type: "Indirect (SaaS)", strength: "First-mover advantage, strong marketing", weakness: "Expensive pricing tiers, high user churn", usp: "Deeper integration with workflow tools and custom company datasets." }
    ],
    similarStartups: [
      { name: "Jasper AI", description: "AI copywriting assistant that grew rapidly by targeting marketing workflows.", keyTakeaway: "Niche specialization beats general-purpose search wrappers." },
      { name: "Hugging Face", description: "Platform for sharing open-source AI models and datasets.", keyTakeaway: "Fostering a developer community creates an irreplaceable moat." }
    ]
  },
  health: {
    name: "HealthTech & Digital Medicine",
    successRange: [50, 70],
    riskRange: [50, 75],
    innovationRange: [75, 90],
    costPerPlatform: { "Web App": 45000, "Mobile App": 55000, "SaaS Portal": 50000, "Desktop App": 40000, "Hardware/IoT": 90000 },
    recommendations: [
      "Prioritize HIPAA/GDPR regulatory compliance and end-to-end data encryption.",
      "Partner with certified doctors and medical boards early to gain clinical validity.",
      "Design a highly accessible, simplified UI for elderly or impaired users.",
      "Incorporate emergency backup alerts or telemetry protocols."
    ],
    milestones: [
      { phase: "Phase 1: Regulatory & Compliance", title: "Compliance Audit & HIPAA Setup", description: "Perform security threat modeling, ensure secure hosting, and obtain necessary certifications.", duration: "2-3 Months" },
      { phase: "Phase 2: Product Development", title: "Secure Database & Patient Portal", description: "Develop encrypted chat/video portal, patient EHR sync, and health dashboard.", duration: "3-4 Months" },
      { phase: "Phase 3: Pilot Test", title: "Clinical Pilot Program", description: "Partner with a local clinic to run a controlled test with 50 patients under doctor supervision.", duration: "2 Months" },
      { phase: "Phase 4: Scaling", title: "Insurance Integrations & Public Launch", description: "Integrate with medical insurance providers for direct billing and launch to app stores.", duration: "Ongoing" }
    ],
    competitors: [
      { name: "Teladoc Health", type: "Direct (Telehealth)", strength: "Massive market share, global doctor network", weakness: "Impersonal service, long virtual waiting lines", usp: "We offer personalized AI monitoring in between clinical checkups." },
      { name: "MyFitnessPal", type: "Indirect (Health Tracker)", strength: "Massive food database, millions of active users", weakness: "No real-time medical professional integration", usp: "Direct bridging of consumer data with active healthcare consultations." }
    ],
    similarStartups: [
      { name: "Zocdoc", description: "Allows patients to find nearby doctors and book appointments online.", keyTakeaway: "Solving scheduling friction is an easy entry point." },
      { name: "Babylon Health", description: "Digital healthcare provider using AI triage and virtual consultations.", keyTakeaway: "AI triaging saves clinical time and significantly cuts overhead." }
    ]
  },
  finance: {
    name: "FinTech & Financial Services",
    successRange: [55, 75],
    riskRange: [45, 70],
    innovationRange: [70, 88],
    costPerPlatform: { "Web App": 50000, "Mobile App": 60000, "SaaS Portal": 55000, "Desktop App": 45000, "Hardware/IoT": 85000 },
    recommendations: [
      "Apply strict fraud prevention mechanisms, including 2FA, biometrics, and AML tracking.",
      "Partner with established banking-as-a-service (BaaS) platforms like Plaid or Stripe.",
      "Create high-value visual charts and real-time expense breakdowns.",
      "Include offline budgeting and local-first storage options for speed."
    ],
    milestones: [
      { phase: "Phase 1: Legalities & Sandbox", title: "Financial Licensing & API Sandbox", description: "Obtain SEC/FCA registrations, secure bank sponsorships, and sandbox test Plaid integration.", duration: "3 Months" },
      { phase: "Phase 2: Core Ledger", title: "Double-Entry Ledger & UI Design", description: "Build bank-grade ledger system, transaction parsers, and sleek dark-mode dashboards.", duration: "2-3 Months" },
      { phase: "Phase 3: Security Audits", title: "Penetration Testing & SOC 2", description: "Hire external security firms to stress-test APIs and achieve SOC 2 compliance certifications.", duration: "1 Month" },
      { phase: "Phase 4: Launch", title: "Public Launch & Direct Card Issuance", description: "Launch digital wallet cards, start marketing referral programs, and initiate premium plans.", duration: "Ongoing" }
    ],
    competitors: [
      { name: "Revolut / Chime", type: "Direct (Neo-bank)", strength: "Millions of users, multi-currency features", weakness: "Customer support is mostly automated, rigid accounts", usp: "Hyper-focused AI financial planning based on behavioral psychology." },
      { name: "Mint / Copilot", type: "Indirect (Budgeting)", strength: "Beautiful dashboards, automatic sync", weakness: "Primarily read-only, limited actionable items", usp: "Direct execution of budget adjustments and automated subscription cancellation." }
    ],
    similarStartups: [
      { name: "Robinhood", description: "Pioneered commission-free stock trading with a gaming-like mobile UI.", keyTakeaway: "Simplifying complex operations attracts untapped retail markets." },
      { name: "Brex", description: "Corporate cards and cash management tailored for high-growth startups.", keyTakeaway: "Unlocking corporate expense pipelines bypasses consumer acquisition costs." }
    ]
  },
  delivery: {
    name: "Logistics & On-Demand Delivery",
    successRange: [45, 65],
    riskRange: [55, 80],
    innovationRange: [60, 80],
    costPerPlatform: { "Web App": 30000, "Mobile App": 50000, "SaaS Portal": 40000, "Desktop App": 25000, "Hardware/IoT": 95000 },
    recommendations: [
      "Design advanced route optimization algorithms to minimize driver fuel consumption.",
      "Utilize dynamic surge pricing during high-demand or bad-weather periods.",
      "Provide real-time map tracking with low-latency WebSocket connection.",
      "Build a dual-app model: separate interfaces for customer and delivery partner."
    ],
    milestones: [
      { phase: "Phase 1: Routing Architecture", title: "GPS Tracking & Map API Setup", description: "Integrate Mapbox/Google Maps, configure real-time location sockets, and design routing engine.", duration: "1-2 Months" },
      { phase: "Phase 2: App Suite Build", title: "Customer, Driver & Admin Panels", description: "Develop and deploy the consumer mobile app, rider app, and dispatch manager dashboard.", duration: "3-4 Months" },
      { phase: "Phase 3: Hyperlocal Test", title: "Single-Neighborhood Launch", description: "Limit operations to a 2km radius with 5 local vendors and 3 dedicated drivers to fix bugs.", duration: "1-2 Months" },
      { phase: "Phase 4: Expansion", title: "City-Wide Scaling", description: "Onboard major restaurants/chains, implement referral networks, and expand operational zones.", duration: "Ongoing" }
    ],
    competitors: [
      { name: "Uber Eats / DoorDash", type: "Direct (Delivery Giants)", strength: "Massive brand presence, deep merchant networks", weakness: "High commission rates for vendors (up to 30%), driver churn", usp: "Zero-commission subscription models for local micro-vendors." },
      { name: "Lalamove / Dunzo", type: "Indirect (Courier)", strength: "Flexible vehicle options, corporate delivery", weakness: "Fragmented focus, slow customer support resolution", usp: "AI bulk-routing that aggregates small parcel deliveries into unified driver batches." }
    ],
    similarStartups: [
      { name: "Rappi", description: "Super-app for delivery, banking, and micro-services in Latin America.", keyTakeaway: "Adding secondary services onto a logistics base boosts retention." },
      { name: "Gorillas / Getir", description: "10-minute grocery delivery using micro-fulfillment dark stores.", keyTakeaway: "Optimized warehousing operations are the true bottlenecks, not just delivery speed." }
    ]
  },
  general: {
    name: "General Tech & Web Platform",
    successRange: [60, 80],
    riskRange: [40, 60],
    innovationRange: [70, 85],
    costPerPlatform: { "Web App": 25000, "Mobile App": 35000, "SaaS Portal": 30000, "Desktop App": 25000, "Hardware/IoT": 60000 },
    recommendations: [
      "Build a landing page first to capture email signups and gauge interest.",
      "Launch an early MVP on Product Hunt and Reddit to acquire organic users.",
      "Leverage open-source tools to keep initial development overhead low.",
      "Define clear key performance indicators (KPIs) like customer acquisition cost (CAC) and lifetime value (LTV)."
    ],
    milestones: [
      { phase: "Phase 1: Exploration", title: "User Interviews & Wireframing", description: "Talk to 20 potential customers, mock up Figma wireframes, and design landing page.", duration: "1 Month" },
      { phase: "Phase 2: MVP Build", title: "Core Features & Database Setup", description: "Develop responsive frontend, setup MongoDB/Postgres database, and launch simple auth.", duration: "2 Months" },
      { phase: "Phase 3: Launch & Iterate", title: "Soft Launch & Bug Tracking", description: "Launch MVP publicly on directories, capture feedback using hotjar, and roll out weekly patches.", duration: "1 Month" },
      { phase: "Phase 4: Optimization", title: "SEO, Ads & Scaling", description: "Optimize page speed, setup SEO pipelines, run Google/Meta ads, and scale server infrastructure.", duration: "Ongoing" }
    ],
    competitors: [
      { name: "Generic Inc.", type: "Direct", strength: "Well-established name, larger marketing budget", weakness: "Slow iteration cycle, legacy codebase", usp: "We are agile, ship weekly, and possess an ultra-modern user interface." }
    ],
    similarStartups: [
      { name: "Buffer", description: "Social media scheduling app that shared its metrics and startup journey openly.", keyTakeaway: "Building in public creates high brand loyalty." },
      { name: "Zapier", description: "Workflow automation tool connecting web applications.", keyTakeaway: "Enabling interoperability between existing tools is a massive value-add." }
    ]
  }
};

// Simple helper to match user's idea description to a startup sector
function matchSector(idea) {
  const text = idea.toLowerCase();
  if (text.includes("ai") || text.includes("intelligence") || text.includes("gpt") || text.includes("bot") || text.includes("schedules") || text.includes("ml") || text.includes("machine learning")) {
    return SECTORS.ai;
  }
  if (text.includes("health") || text.includes("fitness") || text.includes("medical") || text.includes("doctor") || text.includes("hospital") || text.includes("care") || text.includes("diet")) {
    return SECTORS.health;
  }
  if (text.includes("finance") || text.includes("money") || text.includes("bank") || text.includes("crypto") || text.includes("invest") || text.includes("wallet") || text.includes("pay") || text.includes("transaction")) {
    return SECTORS.finance;
  }
  if (text.includes("delivery") || text.includes("food") || text.includes("restaurant") || text.includes("grocery") || text.includes("cargo") || text.includes("courier") || text.includes("route")) {
    return SECTORS.delivery;
  }
  return SECTORS.general;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Analyze Idea API
app.post('/api/analyze', async (req, res) => {
  const { idea, amount, platform } = req.body;

  if (!idea || !amount || !platform) {
    return res.status(400).json({ error: "Missing required inputs: idea, amount, or platform." });
  }

  const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, '')) || 10000;

  // Try to use Gemini model if available
  if (geminiModel) {
    try {
      const prompt = `
        You are an elite AI Startup Incubator advisor. Analyze the following startup idea comprehensively.
        
        Startup Idea: "${idea}"
        User's Available Funding: $${parsedAmount}
        Target Platform: "${platform}"

        You MUST respond ONLY with a valid JSON object matching this exact schema:
        {
          "successRate": 72, // Number, estimated success percentage from 0 to 100
          "riskRate": 45, // Number, estimated risk percentage from 0 to 100
          "innovationScore": 85, // Number, innovation percentage from 0 to 100
          "requiredAmount": 45000, // Number, realistic amount in USD required to launch MVP
          "budgetStatus": "Deficit", // Either "Sufficient", "Deficit", or "Surplus"
          "budgetStatusExplanation": "Explain clearly how the available funding of $${parsedAmount} compares with the required $45,000, detailing where the budget falls short or excels, and how they should allocate it.",
          "recommendations": [
            "Recommendation 1: Detail specific feature or strategy...",
            "Recommendation 2...",
            "Recommendation 3..."
          ],
          "milestones": [
            { "phase": "Phase 1: Foundation", "title": "Establish core system", "description": "Specific action items...", "duration": "1 Month" },
            { "phase": "Phase 2: MVP Development", "title": "Build the prototype", "description": "Specific tech stacks or interface...", "duration": "2 Months" },
            { "phase": "Phase 3: Public Beta", "title": "Initial testing", "description": "Marketing and optimization details...", "duration": "1 Month" },
            { "phase": "Phase 4: Growth", "title": "Scalability & expansion", "description": "Scaling details...", "duration": "Ongoing" }
          ],
          "competitors": [
            { "name": "Competitor A", "type": "Direct Competitor", "strength": "Established market presence", "weakness": "High costs or slow updates", "usp": "How this startup idea solves it uniquely..." },
            { "name": "Competitor B", "type": "Indirect Competitor", "strength": "Strong user base", "weakness": "Generalist features", "usp": "Niche focus targeting..." }
          ],
          "similarStartups": [
            { "name": "Successful Startup X", "description": "What they did...", "keyTakeaway": "Valuable lesson learned..." },
            { "name": "Successful Startup Y", "description": "What they did...", "keyTakeaway": "Valuable lesson learned..." }
          ]
        }

        Make the analysis highly specialized, analytical, logical, and fully customized to the user's input. Do not include markdown code block syntax (like \`\`\`json) or any extra conversational text outside the JSON object.
      `;

      const response = await geminiModel.generateContent(prompt);
      const text = response.response.text().trim();
      
      // Attempt to strip potential markdown codeblocks just in case
      let jsonString = text;
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '');
      }
      
      const analysisResult = JSON.parse(jsonString);
      return res.json(analysisResult);
    } catch (apiError) {
      console.error("Gemini API call failed, falling back to local analyzer:", apiError.message);
      // Fall through to mock analyzer
    }
  }

  // Local Mock AI Analyzer Engine
  const sector = matchSector(idea);
  const successRate = Math.floor(Math.random() * (sector.successRange[1] - sector.successRange[0] + 1)) + sector.successRange[0];
  const riskRate = Math.floor(Math.random() * (sector.riskRange[1] - sector.riskRange[0] + 1)) + sector.riskRange[0];
  const innovationScore = Math.floor(Math.random() * (sector.innovationRange[1] - sector.innovationRange[0] + 1)) + sector.innovationRange[0];
  
  // Calculate cost
  const requiredAmount = sector.costPerPlatform[platform] || 35000;
  let budgetStatus = "Sufficient";
  let diff = parsedAmount - requiredAmount;
  let budgetStatusExplanation = "";

  if (diff < -5000) {
    budgetStatus = "Deficit";
    budgetStatusExplanation = `Your funding of $${parsedAmount.toLocaleString()} is short of the required $${requiredAmount.toLocaleString()} by $${Math.abs(diff).toLocaleString()}. We recommend focusing on a lean MVP (Minimum Viable Product), leveraging open-source components, and looking for early pre-seed or angel investments to cover core server and licensing fees.`;
  } else if (diff > 5000) {
    budgetStatus = "Surplus";
    budgetStatusExplanation = `Excellent! Your available budget of $${parsedAmount.toLocaleString()} exceeds the basic required amount of $${requiredAmount.toLocaleString()} by $${diff.toLocaleString()}. You have a safe runway. You should allocate this surplus towards marketing campaigns, hiring expert UI/UX designers, and scaling database backups early.`;
  } else {
    budgetStatus = "Sufficient";
    budgetStatusExplanation = `Your budget of $${parsedAmount.toLocaleString()} is sufficient to launch the core product on ${platform} ($${requiredAmount.toLocaleString()} estimated). Monitor server hosting charges and third-party APIs closely to maintain a healthy 3-month operational runway.`;
  }

  const analysisResult = {
    successRate,
    riskRate,
    innovationScore,
    requiredAmount,
    budgetStatus,
    budgetStatusExplanation,
    recommendations: sector.recommendations,
    milestones: sector.milestones,
    competitors: sector.competitors,
    similarStartups: sector.similarStartups
  };

  // Simulate server thinking delay to make it feel premium
  setTimeout(() => {
    return res.json(analysisResult);
  }, 1800);
});

// 2. Downloadable PDF Report API
app.post('/api/download-pdf', (req, res) => {
  const { idea, amount, platform, analysis } = req.body;

  if (!idea || !analysis) {
    return res.status(400).json({ error: "Missing idea or analysis results to generate PDF." });
  }

  const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, '')) || 0;

  // Create PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  // Stream PDF back to client
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Incubator-AI-Report.pdf`);
  doc.pipe(res);

  // Background and Header styling
  doc.rect(0, 0, 595.28, 841.89).fill('#0b0e17'); // Dark theme background
  doc.fill('#00f2fe'); // Cyan color

  // Draw Title Header
  doc.fontSize(24).font('Helvetica-Bold').text('AI STARTUP INCUBATOR', 50, 50);
  doc.fill('#ffffff').fontSize(10).font('Helvetica').text('POWERED BY ADVANCED AI PREDICTIONS', 50, 80);
  
  // Decorative line
  doc.moveTo(50, 95).lineTo(545, 95).lineWidth(2).stroke('#ff007f');

  // Input Data Block
  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('ANALYZED STARTUP CONCEPT', 50, 120);
  doc.fontSize(11).font('Helvetica-Oblique').fill('#b0b5c1').text(`"${idea}"`, 50, 140, { width: 495 });
  
  // Input Details Row
  const startY = doc.y + 20;
  doc.rect(50, startY, 495, 40).fill('#171e30');
  doc.fill('#ffffff').fontSize(10).font('Helvetica-Bold').text('TARGET PLATFORM:', 60, startY + 15);
  doc.fill('#00f2fe').font('Helvetica').text(platform, 180, startY + 15);
  doc.fill('#ffffff').font('Helvetica-Bold').text('DECLARED FUNDING:', 320, startY + 15);
  doc.fill('#00f2fe').font('Helvetica').text(`$${parsedAmount.toLocaleString()}`, 450, startY + 15);

  // Section: Core Metrics
  const metricsY = startY + 65;
  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('AI FEASIBILITY METRICS', 50, metricsY);
  
  // Metric Boxes
  const boxWidth = 150;
  const boxHeight = 70;
  const gap = 22;

  // Box 1: Success Rate
  doc.rect(50, metricsY + 20, boxWidth, boxHeight).fill('#1a1f36');
  doc.fill('#10b981').fontSize(22).font('Helvetica-Bold').text(`${analysis.successRate}%`, 65, metricsY + 32);
  doc.fill('#a0aec0').fontSize(9).font('Helvetica').text('SUCCESS RATE', 65, metricsY + 58);

  // Box 2: Risk Rate
  doc.rect(50 + boxWidth + gap, metricsY + 20, boxWidth, boxHeight).fill('#1a1f36');
  doc.fill('#ef4444').fontSize(22).font('Helvetica-Bold').text(`${analysis.riskRate}%`, 50 + boxWidth + gap + 15, metricsY + 32);
  doc.fill('#a0aec0').fontSize(9).font('Helvetica').text('RISK PROFILE', 50 + boxWidth + gap + 15, metricsY + 58);

  // Box 3: Innovation Score
  doc.rect(50 + (boxWidth + gap) * 2, metricsY + 20, boxWidth, boxHeight).fill('#1a1f36');
  doc.fill('#3b82f6').fontSize(22).font('Helvetica-Bold').text(`${analysis.innovationScore}/100`, 50 + (boxWidth + gap) * 2 + 15, metricsY + 32);
  doc.fill('#a0aec0').fontSize(9).font('Helvetica').text('INNOVATION RATING', 50 + (boxWidth + gap) * 2 + 15, metricsY + 58);

  // Section: Financial Assessment
  const finY = metricsY + boxHeight + 45;
  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('FINANCIAL ASSESSMENT & STATUS', 50, finY);
  
  let statusColor = '#10b981';
  if (analysis.budgetStatus === 'Deficit') statusColor = '#ef4444';
  if (analysis.budgetStatus === 'Sufficient') statusColor = '#f59e0b';
  
  doc.fill('#ffffff').fontSize(10).text('REQUIRED BUDGET:', 50, finY + 25);
  doc.fill('#00f2fe').font('Helvetica-Bold').text(`$${analysis.requiredAmount.toLocaleString()}`, 170, finY + 25);
  doc.fill('#ffffff').font('Helvetica').text('STATUS:', 300, finY + 25);
  doc.fill(statusColor).font('Helvetica-Bold').text(analysis.budgetStatus, 360, finY + 25);

  doc.fill('#b0b5c1').fontSize(10).font('Helvetica').text(analysis.budgetStatusExplanation, 50, finY + 45, { width: 495 });

  // Add Page for recommendations and roadmaps
  doc.addPage();
  doc.rect(0, 0, 595.28, 841.89).fill('#0b0e17');

  // Section: Recommendations
  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('STRATEGIC RECOMMENDATIONS', 50, 50);
  doc.moveTo(50, 70).lineTo(545, 70).lineWidth(1).stroke('#ff007f');

  let recY = 85;
  analysis.recommendations.forEach((rec, idx) => {
    doc.fill('#00f2fe').fontSize(12).text('•', 50, recY);
    doc.fill('#ffffff').fontSize(10).text(rec, 65, recY, { width: 480 });
    recY += doc.heightOfString(rec, { width: 480 }) + 10;
  });

  // Section: Milestones
  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('IMPLEMENTATION MILESTONES', 50, recY + 15);
  doc.moveTo(50, recY + 32).lineTo(545, recY + 32).lineWidth(1).stroke('#ff007f');

  let mileY = recY + 45;
  analysis.milestones.forEach((mile) => {
    doc.fill('#00f2fe').fontSize(10).font('Helvetica-Bold').text(`${mile.phase}: ${mile.title}`, 50, mileY);
    doc.fill('#ff007f').fontSize(10).font('Helvetica-Bold').text(`(${mile.duration})`, 480, mileY);
    doc.fill('#b0b5c1').fontSize(9).font('Helvetica').text(mile.description, 50, mileY + 15, { width: 495 });
    mileY += 40;
  });

  // Competitor Analysis & Similar Startups on Next Page
  doc.addPage();
  doc.rect(0, 0, 595.28, 841.89).fill('#0b0e17');

  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('COMPETITOR ANALYSIS', 50, 50);
  doc.moveTo(50, 70).lineTo(545, 70).lineWidth(1).stroke('#ff007f');

  let compY = 85;
  analysis.competitors.forEach((comp) => {
    doc.fill('#ffffff').fontSize(11).font('Helvetica-Bold').text(comp.name, 50, compY);
    doc.fill('#00f2fe').fontSize(9).font('Helvetica-Oblique').text(comp.type, 200, compY);
    doc.fill('#b0b5c1').fontSize(9).font('Helvetica').text(`Strength: ${comp.strength}`, 50, compY + 15);
    doc.fill('#b0b5c1').text(`Weakness: ${comp.weakness}`, 50, compY + 28);
    doc.fill('#ff007f').font('Helvetica-Bold').text(`USP / Differentiation: ${comp.usp}`, 50, compY + 41, { width: 495 });
    compY += 65;
  });

  doc.fill('#ffffff').fontSize(14).font('Helvetica-Bold').text('SIMILAR STARTUP ANALOGS', 50, compY + 15);
  doc.moveTo(50, compY + 32).lineTo(545, compY + 32).lineWidth(1).stroke('#ff007f');

  let simY = compY + 45;
  analysis.similarStartups.forEach((sim) => {
    doc.fill('#ffffff').fontSize(11).font('Helvetica-Bold').text(sim.name, 50, simY);
    doc.fill('#b0b5c1').fontSize(9).font('Helvetica').text(sim.description, 50, simY + 15, { width: 495 });
    doc.fill('#00f2fe').font('Helvetica-Oblique').text(`Key Takeaway: ${sim.keyTakeaway}`, 50, simY + 30, { width: 495 });
    simY += 55;
  });

  // Footer on all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.moveTo(50, 790).lineTo(545, 790).lineWidth(0.5).stroke('#1a1f36');
    doc.fill('#606880').fontSize(8).font('Helvetica').text(`Startup Incubator AI Report  |  Confidential and Prepared for Concept: "${idea.substring(0, 30)}..."`, 50, 800);
    doc.text(`Page ${i + 1} of ${totalPages}`, 500, 800);
  }

  doc.end();
});

// 3. AI Chatbubble Assistant API
app.post('/api/chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Context contains details about the analyzed startup (idea, metrics, platform)
  const systemContextStr = context 
    ? `You are the Startup Incubator AI Advisor. The user has pitched this startup idea: "${context.idea}" on the platform "${context.platform}" with a budget of $${context.amount}.
       The analysis is: Success Rate ${context.analysis.successRate}%, Risk Rate ${context.analysis.riskRate}%, Innovation Score ${context.analysis.innovationScore}/100, Budget status is ${context.analysis.budgetStatus}.
       Answer the user's questions logically, supportively, and creatively based on this idea.`
    : `You are the Startup Incubator AI Advisor. A startup founder is asking for guidance on how to build, launch, fund, and scale their tech product. Give crisp, highly professional advice.`;

  // Use Gemini if available
  if (geminiModel) {
    try {
      // Reformat history into Gemini API compatible chat format
      const formattedContents = [];
      
      // Inject system context instructions as the first message or prepended to the chat history
      formattedContents.push({
        role: "user",
        parts: [{ text: systemContextStr + "\nUnderstood. Please wait for my first question." }]
      });
      formattedContents.push({
        role: "model",
        parts: [{ text: "Understood. I am now acting as your dedicated Startup Incubator AI Advisor. I will provide precise, professional guidance on your idea." }]
      });

      // Add chat history
      if (history && history.length > 0) {
        history.forEach(item => {
          formattedContents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        });
      }

      // Add current message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await geminiModel.generateContent({
        contents: formattedContents
      });

      const text = response.response.text().trim();
      return res.json({ reply: text });
    } catch (chatError) {
      console.error("Gemini Chat failed, falling back to mock response:", chatError.message);
      // Fall through to mock response
    }
  }

  // Mock Chat Responses based on message keywords
  let reply = "That's a very interesting question. To make the most of this idea, I recommend focusing on a minimal viable product (MVP), validating user demand early on via surveys or pre-signups, and keeping operational costs low.";
  
  const text = message.toLowerCase();
  if (text.includes("marketing") || text.includes("user") || text.includes("acquire") || text.includes("customer")) {
    reply = "To acquire your first 100 users, I recommend 'building in public' on platforms like Twitter/X or LinkedIn, launching early on Product Hunt, and utilizing organic content marketing. Avoid heavy paid advertisements until you have achieved solid product-market fit (PMF).";
  } else if (text.includes("funding") || text.includes("money") || text.includes("invest") || text.includes("raising")) {
    reply = "Since raising funding requires showing traction, focus on launching your MVP first. Once you have active daily/weekly users and clear retention numbers, you can pitch to local Angel networks, apply to Y-Combinator, or seek seed venture capital.";
  } else if (text.includes("risk") || text.includes("failure") || text.includes("fail") || text.includes("compete")) {
    reply = "Startup risks usually stem from building something people don't actually want, or running out of cash. You can mitigate this by running weekly user feedback cycles and keeping your monthly expenditures (burn rate) extremely lean.";
  } else if (text.includes("tech") || text.includes("code") || text.includes("develop") || text.includes("stack")) {
    reply = "For your platform, I highly recommend a modern, developer-friendly tech stack like React/Vite/NextJS for the frontend and Node.js or Python for the backend. Hosting on Vercel or Render is practically free for early MVP phases.";
  } else if (context) {
    reply = `Regarding your idea for "${context.idea.substring(0, 40)}...", since your success rate is ${context.analysis.successRate}%, the key is tackling the competitors we identified (like ${context.analysis.competitors[0]?.name || 'existing tools'}). Do you have any specific plans to differentiate your product?`;
  }

  // Simulate networking delay
  setTimeout(() => {
    return res.json({ reply });
  }, 1000);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
