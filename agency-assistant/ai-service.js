/**
 * NoirFlow Agency Assistant — AI Service
 *
 * Single entry point for all AI generation used by the app:
 *   AIService.analyzeLead(lead)
 *   AIService.generateEmail(lead, analysis)
 *   AIService.generateLinkedInDM(lead, analysis)
 *
 * V1 ships with a local, heuristic "mock" generator so the product works
 * with zero API keys/config. To connect a real model later, replace the
 * body of each function below with a fetch() call to your backend or
 * directly to a Claude API endpoint — the calling code in app.js does not
 * need to change, since it only depends on this module's return shapes.
 */

const AIService = (() => {

  // Simulates network/model latency so loading states are exercised.
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- Industry knowledge base used to make mock output feel tailored ---
  const INDUSTRY_PROFILES = {
    default: {
      problems: [
        "Manual, repetitive admin work is eating up staff time",
        "Leads and inquiries are not followed up on consistently",
        "Customer communication is scattered across channels",
      ],
      automation: [
        "Automated lead capture and follow-up sequences",
        "Workflow automation for repetitive back-office tasks",
        "Centralized inbox / CRM syncing across channels",
      ],
      ai: [
        "An AI chatbot to answer common questions instantly, 24/7",
        "AI-assisted drafting for client communication and reports",
        "AI-powered data entry and document processing",
      ],
    },
    healthcare: {
      problems: [
        "Missed calls and no-shows are costing revenue",
        "Appointment scheduling is manual and error-prone",
        "Patient follow-up and reminders are inconsistent",
      ],
      automation: [
        "Automated appointment booking, reminders and confirmations",
        "Intake form automation that syncs directly to records",
        "No-show reduction via SMS/email reminder sequences",
      ],
      ai: [
        "An AI voice/chat receptionist to handle bookings after hours",
        "AI triage assistant to pre-screen patient inquiries",
        "AI-generated visit summaries to reduce admin time",
      ],
    },
    "real estate": {
      problems: [
        "Slow response time to new inquiries is losing deals",
        "Manual lead qualification wastes agent time",
        "Follow-up on cold leads rarely happens",
      ],
      automation: [
        "Instant lead response and qualification workflows",
        "Automated drip campaigns for nurturing buyers/sellers",
        "Listing syndication and status updates automation",
      ],
      ai: [
        "An AI chatbot to qualify leads and book viewings instantly",
        "AI-generated property descriptions and marketing copy",
        "AI lead scoring to prioritize the hottest prospects",
      ],
    },
    ecommerce: {
      problems: [
        "Customer support volume is outpacing the team's capacity",
        "Cart abandonment isn't being recovered systematically",
        "Order and inventory updates require manual work",
      ],
      automation: [
        "Automated abandoned-cart recovery flows",
        "Order status and shipping update automation",
        "Inventory sync automation across sales channels",
      ],
      ai: [
        "An AI support chatbot to resolve common tickets instantly",
        "AI product description and ad copy generation",
        "AI-driven personalized product recommendations",
      ],
    },
    "e-commerce": null, // alias, resolved below
    "professional services": {
      problems: [
        "Client onboarding takes too long and feels inconsistent",
        "Proposal and quote generation is a manual bottleneck",
        "Inbound leads aren't qualified before a call is booked",
      ],
      automation: [
        "Automated client onboarding and document collection",
        "Proposal/quote generation workflows",
        "Automated scheduling with pre-call qualification",
      ],
      ai: [
        "An AI assistant to draft proposals and client emails",
        "AI-powered lead qualification chatbot",
        "AI meeting notes and follow-up summaries",
      ],
    },
    restaurant: {
      problems: [
        "Phone lines are busy during peak hours, losing orders/bookings",
        "Reservation management is manual and inconsistent",
        "Customer feedback and reviews aren't systematically followed up",
      ],
      automation: [
        "Automated reservation and waitlist management",
        "Order confirmation and reminder automation",
        "Review request automation after each visit",
      ],
      ai: [
        "An AI phone/chat agent to take orders and reservations",
        "AI-generated social media and promo content",
        "AI-based demand forecasting for staffing and inventory",
      ],
    },
    education: {
      problems: [
        "Admissions inquiries go unanswered outside office hours",
        "Manual enrollment paperwork slows down conversions",
        "Student engagement and follow-up is inconsistent",
      ],
      automation: [
        "Automated inquiry response and enrollment workflows",
        "Reminder sequences for deadlines and events",
        "Automated intake and document collection",
      ],
      ai: [
        "An AI admissions chatbot available around the clock",
        "AI-assisted content creation for courses/marketing",
        "AI-powered student support and FAQ assistant",
      ],
    },
    finance: {
      problems: [
        "Client intake and document collection is manual and slow",
        "Follow-up on prospects stalls after the first meeting",
        "Reporting and compliance documentation takes significant time",
      ],
      automation: [
        "Automated client intake and document workflows",
        "Scheduled follow-up and nurture sequences",
        "Report generation and data aggregation automation",
      ],
      ai: [
        "An AI assistant for drafting client communications",
        "AI-powered document summarization and data extraction",
        "AI chatbot for common client questions",
      ],
    },
  };
  INDUSTRY_PROFILES["e-commerce"] = INDUSTRY_PROFILES.ecommerce;

  function resolveProfile(industry) {
    if (!industry) return INDUSTRY_PROFILES.default;
    const key = industry.trim().toLowerCase();
    for (const k of Object.keys(INDUSTRY_PROFILES)) {
      if (key.includes(k) && INDUSTRY_PROFILES[k]) return INDUSTRY_PROFILES[k];
    }
    return INDUSTRY_PROFILES.default;
  }

  function cleanCompanyName(lead) {
    return (lead.companyName || "this business").trim();
  }

  function firstName(fullName) {
    if (!fullName) return null;
    return fullName.trim().split(/\s+/)[0];
  }

  function estimateValue(lead) {
    // Simple, transparent heuristic — not a real financial model.
    const text = `${lead.mainProblem || ""} ${lead.industry || ""}`.toLowerCase();
    let base = 1500;
    if (/(call|phone|lead|booking|appointment|sales)/.test(text)) base += 1500;
    if (/(support|ticket|volume|customer service)/.test(text)) base += 1000;
    if (/(manual|admin|paperwork|data entry)/.test(text)) base += 800;
    const low = base;
    const high = Math.round(base * 2.4);
    return `$${low.toLocaleString()}–$${high.toLocaleString()} / month in recovered revenue or saved labor`;
  }

  async function analyzeLead(lead) {
    await delay(1100);

    const profile = resolveProfile(lead.industry);
    const company = cleanCompanyName(lead);
    const industryLabel = lead.industry ? lead.industry.trim() : "their industry";
    const hasProblem = !!(lead.mainProblem && lead.mainProblem.trim());

    const summary = hasProblem
      ? `${company} operates in ${industryLabel} and is currently dealing with: "${lead.mainProblem.trim()}". Based on this and typical patterns in ${industryLabel}, there is a clear opening for automation and AI-assisted workflows to reduce manual effort and recover lost revenue.`
      : `${company} operates in ${industryLabel}. No specific problem was provided yet, so this analysis is based on common friction points for businesses of this type — worth confirming directly with ${lead.contactPerson || "the contact"} on a discovery call.`;

    const recommendedSolution = hasProblem
      ? `A focused automation + AI workflow addressing "${lead.mainProblem.trim()}" — starting with the highest-impact opportunity (${profile.automation[0].toLowerCase()}), then layering in an AI assistant for ongoing efficiency.`
      : `Start with a short discovery call to confirm priorities, then propose ${profile.automation[0].toLowerCase()} as a quick, high-impact first project.`;

    const nextStep = hasProblem
      ? `Send a personalized outreach message referencing "${lead.mainProblem.trim()}" and offer a free 15-minute audit call.`
      : `Reach out to ${lead.contactPerson || "the contact"} with a short, relevant note and offer a free 15-minute discovery call.`;

    return {
      summary,
      problems: profile.problems,
      automationOpportunities: profile.automation,
      aiOpportunities: profile.ai,
      recommendedSolution,
      estimatedValue: estimateValue(lead),
      nextStep,
      generatedAt: new Date().toISOString(),
    };
  }

  async function generateEmail(lead, analysis) {
    await delay(900);

    const company = cleanCompanyName(lead);
    const name = firstName(lead.contactPerson) || "there";
    const problem = lead.mainProblem && lead.mainProblem.trim();
    const solution = analysis && analysis.recommendedSolution
      ? analysis.recommendedSolution
      : "a focused automation workflow tailored to your team";

    const subject = problem
      ? `Quick idea for ${company} on ${truncate(problem, 40)}`
      : `A quick idea for ${company}`;

    const body =
`Hi ${name},

I came across ${company} and noticed ${problem ? `you might be dealing with: "${truncate(problem, 120)}."` : `you're growing in the ${lead.industry || "your"} space.`}

I work with businesses like yours at NoirFlow, helping automate the repetitive parts of the day-to-day so the team can focus on higher-value work. Based on what I've seen with similar businesses, ${lowerFirst(solution)}

I'm not looking to pitch anything heavy — just wanted to share a specific idea and see if it's relevant. Open to a quick 15-minute call this week to walk through it?

Best,
NoirFlow`;

    return { subject, body: body.trim() };
  }

  async function generateLinkedInDM(lead, analysis) {
    await delay(800);

    const company = cleanCompanyName(lead);
    const name = firstName(lead.contactPerson) || "there";
    const problem = lead.mainProblem && lead.mainProblem.trim();
    const opportunity = analysis && analysis.automationOpportunities && analysis.automationOpportunities[0];

    const body = problem
      ? `Hi ${name} — saw ${company} and your work in ${lead.industry || "the space"}. Quick thought: ${lowerFirst(truncate(opportunity || "there might be a quick automation win here", 140))} could help with "${truncate(problem, 90)}". Happy to share how if useful — no pressure either way.`
      : `Hi ${name} — came across ${company} and wanted to connect. I help businesses in ${lead.industry || "your space"} automate repetitive work with AI. If that's ever relevant, happy to share a quick idea — no pressure either way.`;

    return { body: body.trim() };
  }

  function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max - 1).trim() + "…" : str;
  }

  function lowerFirst(str) {
    if (!str) return "";
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  return { analyzeLead, generateEmail, generateLinkedInDM };
})();
