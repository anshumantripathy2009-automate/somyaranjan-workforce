/**
 * NoirFlow Agency Assistant — App
 * State management, rendering and event wiring. Persists leads to
 * localStorage so V1 works with zero backend.
 */

(() => {
  const STORAGE_KEY = "noirflow_leads_v1";
  const STATUSES = ["New", "Analyzed", "Contacted", "Follow-up", "Interested", "Converted", "Not Interested"];

  let leads = loadLeads();
  let activeFilter = "All";
  let selectedLeadId = null;

  // ---------- Storage ----------
  function loadLeads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load leads", e);
      return [];
    }
  }

  function saveLeads() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error("Failed to save leads", e);
      showToast("Couldn't save — storage may be full.");
    }
  }

  function uid() {
    return "lead_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- DOM refs ----------
  const el = (id) => document.getElementById(id);

  const statTotal = el("statTotal");
  const statNew = el("statNew");
  const statContacted = el("statContacted");
  const statInterested = el("statInterested");
  const statConverted = el("statConverted");

  const leadsTableBody = el("leadsTableBody");
  const leadsTable = el("leadsTable");
  const emptyState = el("emptyState");
  const filterRow = el("filterRow");

  const addLeadOverlay = el("addLeadOverlay");
  const leadForm = el("leadForm");
  const detailOverlay = el("detailOverlay");

  const analyzeBtn = el("analyzeBtn");
  const analysisEmpty = el("analysisEmpty");
  const analysisLoading = el("analysisLoading");
  const analysisContent = el("analysisContent");

  const generateEmailBtn = el("generateEmailBtn");
  const generateDMBtn = el("generateDMBtn");
  const outreachHint = el("outreachHint");
  const emailOutput = el("emailOutput");
  const dmOutput = el("dmOutput");

  const statusSelect = el("statusSelect");
  const toast = el("toast");

  // ---------- Rendering ----------
  function render() {
    renderStats();
    renderTable();
  }

  function renderStats() {
    const count = (status) => leads.filter((l) => l.status === status).length;
    statTotal.textContent = leads.length;
    statNew.textContent = count("New");
    statContacted.textContent = count("Contacted");
    statInterested.textContent = count("Interested");
    statConverted.textContent = count("Converted");
  }

  function renderTable() {
    const filtered = activeFilter === "All" ? leads : leads.filter((l) => l.status === activeFilter);
    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

    leadsTableBody.innerHTML = "";

    if (sorted.length === 0) {
      leadsTable.classList.add("hidden");
      emptyState.classList.add("show");
      return;
    }
    leadsTable.classList.remove("hidden");
    emptyState.classList.remove("show");

    for (const lead of sorted) {
      const tr = document.createElement("tr");
      tr.dataset.id = lead.id;
      tr.innerHTML = `
        <td>
          <div class="cell-company">${escapeHtml(lead.companyName)}</div>
          ${lead.website ? `<div class="cell-sub">${escapeHtml(lead.website)}</div>` : ""}
        </td>
        <td class="cell-muted">${escapeHtml(lead.industry) || "—"}</td>
        <td class="cell-muted">${escapeHtml(lead.contactPerson) || "—"}</td>
        <td>${statusBadge(lead.status)}</td>
        <td class="cell-muted">${formatDate(lead.createdAt)}</td>
        <td><span class="view-link">View →</span></td>
      `;
      tr.addEventListener("click", () => openDetail(lead.id));
      leadsTableBody.appendChild(tr);
    }
  }

  function statusBadge(status) {
    const cls = "status-" + status.replace(/\s+/g, "-");
    return `<span class="status-badge ${cls}">${status}</span>`;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // ---------- Add Lead ----------
  el("openAddLead").addEventListener("click", () => {
    leadForm.reset();
    addLeadOverlay.classList.add("open");
  });
  el("closeAddLead").addEventListener("click", closeAddLead);
  el("cancelAddLead").addEventListener("click", closeAddLead);
  addLeadOverlay.addEventListener("click", (e) => { if (e.target === addLeadOverlay) closeAddLead(); });

  function closeAddLead() {
    addLeadOverlay.classList.remove("open");
  }

  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const companyName = el("companyName").value.trim();
    if (!companyName) return;

    const lead = {
      id: uid(),
      companyName,
      website: el("website").value.trim(),
      industry: el("industry").value.trim(),
      contactPerson: el("contactPerson").value.trim(),
      contactRole: el("contactRole").value.trim(),
      mainProblem: el("mainProblem").value.trim(),
      notes: el("notes").value.trim(),
      status: "New",
      createdAt: Date.now(),
      analysis: null,
      email: null,
      linkedinDM: null,
    };

    leads.push(lead);
    saveLeads();
    render();
    closeAddLead();
    showToast(`${companyName} added`);
    openDetail(lead.id);
  });

  // ---------- Filters ----------
  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    [...filterRow.children].forEach((c) => c.classList.toggle("active", c === btn));
    renderTable();
  });

  // ---------- Detail modal ----------
  function getLead(id) {
    return leads.find((l) => l.id === id);
  }

  function openDetail(id) {
    selectedLeadId = id;
    const lead = getLead(id);
    if (!lead) return;

    el("detailCompanyName").textContent = lead.companyName;
    el("detailIndustry").textContent = lead.industry || "Industry not set";
    el("metaWebsite").textContent = lead.website || "—";
    el("metaContact").textContent = lead.contactPerson || "—";
    el("metaRole").textContent = lead.contactRole || "—";
    el("metaProblem").textContent = lead.mainProblem || "No problem/requirement noted yet.";
    el("metaNotes").textContent = lead.notes || "No notes.";
    statusSelect.value = lead.status;

    renderAnalysis(lead);
    renderOutreach(lead);

    detailOverlay.classList.add("open");
  }

  el("closeDetail").addEventListener("click", closeDetail);
  detailOverlay.addEventListener("click", (e) => { if (e.target === detailOverlay) closeDetail(); });
  function closeDetail() {
    detailOverlay.classList.remove("open");
    selectedLeadId = null;
  }

  statusSelect.addEventListener("change", () => {
    const lead = getLead(selectedLeadId);
    if (!lead) return;
    lead.status = statusSelect.value;
    saveLeads();
    render();
  });

  // ---------- Analysis ----------
  function renderAnalysis(lead) {
    analysisLoading.classList.add("hidden");
    if (lead.analysis) {
      analysisEmpty.classList.add("hidden");
      analysisContent.classList.remove("hidden");
      fillAnalysis(lead.analysis);
      analyzeBtn.querySelector(".btn-label").textContent = "Re-analyze";
    } else {
      analysisContent.classList.add("hidden");
      analysisEmpty.classList.remove("hidden");
      analyzeBtn.querySelector(".btn-label").textContent = "Analyze Lead";
    }
  }

  function fillAnalysis(a) {
    el("aSummary").textContent = a.summary;
    fillList("aProblems", a.problems);
    fillList("aAutomation", a.automationOpportunities);
    fillList("aAI", a.aiOpportunities);
    el("aSolution").textContent = a.recommendedSolution;
    el("aValue").textContent = a.estimatedValue;
    el("aNextStep").textContent = a.nextStep;
  }

  function fillList(id, items) {
    const ul = el(id);
    ul.innerHTML = "";
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
  }

  analyzeBtn.addEventListener("click", async () => {
    const lead = getLead(selectedLeadId);
    if (!lead) return;

    analysisEmpty.classList.add("hidden");
    analysisContent.classList.add("hidden");
    analysisLoading.classList.remove("hidden");
    analyzeBtn.disabled = true;

    try {
      const analysis = await AIService.analyzeLead(lead);
      lead.analysis = analysis;
      if (lead.status === "New") lead.status = "Analyzed";
      saveLeads();
      render();
      statusSelect.value = lead.status;
      renderAnalysis(lead);
      renderOutreach(lead);
      showToast("Analysis generated");
    } catch (err) {
      console.error(err);
      analysisLoading.classList.add("hidden");
      analysisEmpty.classList.remove("hidden");
      showToast("Analysis failed — please try again.");
    } finally {
      analyzeBtn.disabled = false;
    }
  });

  // ---------- Outreach ----------
  function renderOutreach(lead) {
    const hasAnalysis = !!lead.analysis;
    generateEmailBtn.disabled = !hasAnalysis;
    generateDMBtn.disabled = !hasAnalysis;
    outreachHint.textContent = hasAnalysis
      ? "Generate a tailored email or LinkedIn DM using this lead's analysis."
      : "Run analysis first to unlock personalized outreach.";

    if (lead.email) {
      el("emailSubject").textContent = lead.email.subject;
      el("emailBody").textContent = lead.email.body;
      emailOutput.classList.remove("hidden");
    } else {
      emailOutput.classList.add("hidden");
    }

    if (lead.linkedinDM) {
      el("dmBody").textContent = lead.linkedinDM.body;
      dmOutput.classList.remove("hidden");
    } else {
      dmOutput.classList.add("hidden");
    }
  }

  generateEmailBtn.addEventListener("click", async () => {
    const lead = getLead(selectedLeadId);
    if (!lead || !lead.analysis) return;
    generateEmailBtn.disabled = true;
    generateEmailBtn.textContent = "Generating…";
    try {
      const emailResult = await AIService.generateEmail(lead, lead.analysis);
      lead.email = emailResult;
      if (lead.status === "Analyzed") lead.status = "Contacted";
      saveLeads();
      render();
      statusSelect.value = lead.status;
      renderOutreach(lead);
      showToast("Email draft generated");
    } catch (err) {
      console.error(err);
      showToast("Couldn't generate email — please try again.");
    } finally {
      generateEmailBtn.disabled = false;
      generateEmailBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.6"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.6"/></svg> Generate Email`;
    }
  });

  generateDMBtn.addEventListener("click", async () => {
    const lead = getLead(selectedLeadId);
    if (!lead || !lead.analysis) return;
    generateDMBtn.disabled = true;
    generateDMBtn.textContent = "Generating…";
    try {
      const dmResult = await AIService.generateLinkedInDM(lead, lead.analysis);
      lead.linkedinDM = dmResult;
      if (lead.status === "Analyzed") lead.status = "Contacted";
      saveLeads();
      render();
      statusSelect.value = lead.status;
      renderOutreach(lead);
      showToast("LinkedIn DM generated");
    } catch (err) {
      console.error(err);
      showToast("Couldn't generate DM — please try again.");
    } finally {
      generateDMBtn.disabled = false;
      generateDMBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.6"/></svg> Generate LinkedIn DM`;
    }
  });

  // ---------- Copy buttons ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const targetId = btn.dataset.copyTarget;
    const text = el(targetId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1500);
    }).catch(() => showToast("Couldn't copy to clipboard"));
  });

  // ---------- Keyboard ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddLead();
      closeDetail();
    }
  });

  // ---------- Init ----------
  render();
})();
