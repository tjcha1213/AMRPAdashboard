const sliders = {
  specialistShare: document.querySelector("#specialistShare"),
  complexityMix: document.querySelector("#complexityMix"),
  demandPressure: document.querySelector("#demandPressure")
};

const outputs = {
  specialistShare: document.querySelector("#specialistShareOut"),
  complexityMix: document.querySelector("#complexityMixOut"),
  demandPressure: document.querySelector("#demandPressureOut")
};

const metrics = {
  profit: document.querySelector("#profit"),
  recoveryRate: document.querySelector("#recoveryRate"),
  bedOccupancy: document.querySelector("#bedOccupancy"),
  medicalCapacity: document.querySelector("#medicalCapacity")
};

const tradeoffPoint = document.querySelector("#tradeoffPoint");
const tradeoffPointLabel = document.querySelector("#tradeoffPointLabel");
const graphProfit = document.querySelector("#graphProfit");
const graphSatisfaction = document.querySelector("#graphSatisfaction");
const tradeoffNarrative = document.querySelector("#tradeoffNarrative");

let basePerformance = {
  profit: 0,
  recovery: 0,
  occupancy: 0,
  capacity: 0,
  satisfaction: 0
};

let explorerTotals = {
  profit: 0,
  recovery: 0,
  occupancy: 0,
  capacity: 0,
  throughput: 0,
  satisfaction: 0
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function refreshPerformance() {
  const adjustedProfit = clamp(basePerformance.profit + explorerTotals.profit * 0.035, 0.2, 7);
  const adjustedRecovery = clamp(basePerformance.recovery + explorerTotals.recovery * 0.35, 45, 98);
  const adjustedOccupancy = clamp(basePerformance.occupancy + explorerTotals.occupancy * 0.35, 40, 99);
  const adjustedCapacity = clamp(basePerformance.capacity + explorerTotals.capacity * 0.35, 35, 99);
  const adjustedSatisfaction = clamp(basePerformance.satisfaction + explorerTotals.satisfaction * 0.45, 45, 99);

  metrics.profit.textContent = `$${adjustedProfit.toFixed(1)}M`;
  metrics.recoveryRate.textContent = `${Math.round(adjustedRecovery)}%`;
  metrics.bedOccupancy.textContent = `${Math.round(adjustedOccupancy)}%`;
  metrics.medicalCapacity.textContent = `${Math.round(adjustedCapacity)}%`;

  const pointX = 62 + (adjustedProfit / 7) * 458;
  const pointY = 284 - ((adjustedSatisfaction - 50) / 50) * 242;
  const x = clamp(pointX, 62, 520);
  const y = clamp(pointY, 42, 284);

  tradeoffPoint.setAttribute("cx", x.toFixed(1));
  tradeoffPoint.setAttribute("cy", y.toFixed(1));
  tradeoffPointLabel.setAttribute("x", (x + 16).toFixed(1));
  tradeoffPointLabel.setAttribute("y", (y - 8).toFixed(1));
  tradeoffPointLabel.textContent = `$${adjustedProfit.toFixed(1)}M / ${Math.round(adjustedSatisfaction)}`;
  graphProfit.textContent = `$${adjustedProfit.toFixed(1)}M`;
  graphSatisfaction.textContent = `${Math.round(adjustedSatisfaction)}`;

  if (adjustedProfit >= 4.5 && adjustedSatisfaction >= 85) {
    tradeoffNarrative.textContent = "High-value zone: the current configuration supports both financial performance and patient experience.";
  } else if (adjustedProfit >= 4.5) {
    tradeoffNarrative.textContent = "Financially strong, but patient satisfaction may need protection through quality, staffing, or discharge coordination.";
  } else if (adjustedSatisfaction >= 85) {
    tradeoffNarrative.textContent = "Patient experience is strong, but the operating model may need higher throughput, occupancy discipline, or reimbursement strength.";
  } else {
    tradeoffNarrative.textContent = "Watch zone: this scenario needs improvement in both financial performance and patient experience.";
  }
}

function updateDashboard() {
  const specialistShare = Number(sliders.specialistShare.value);
  const complexityMix = Number(sliders.complexityMix.value);
  const demandPressure = Number(sliders.demandPressure.value);

  outputs.specialistShare.value = `${specialistShare}%`;
  outputs.complexityMix.value = `${complexityMix}%`;
  outputs.demandPressure.value = `${demandPressure}%`;

  const matchQuality = 100 - Math.abs(specialistShare - complexityMix);
  const demandPenalty = Math.max(0, demandPressure - 100) * 0.12;
  const underSpecializedPenalty = Math.max(0, complexityMix - specialistShare) * 0.08;

  const recoveryRate = clamp(66 + matchQuality * 0.2 - underSpecializedPenalty - demandPenalty * 0.35, 48, 94);
  const bedOccupancy = clamp(58 + demandPressure * 0.22 + complexityMix * 0.15 - specialistShare * 0.04, 45, 98);
  const medicalCapacity = clamp(88 - Math.max(0, demandPressure - 100) * 0.18 - complexityMix * 0.12 + specialistShare * 0.1, 45, 96);
  const profit = clamp(1.1 + recoveryRate * 0.035 + bedOccupancy * 0.018 - Math.max(0, bedOccupancy - 90) * 0.09 - demandPenalty * 0.018, 0.2, 6.8);
  const satisfaction = clamp(48 + recoveryRate * 0.42 + medicalCapacity * 0.12 - Math.max(0, bedOccupancy - 90) * 0.85 - demandPenalty * 0.45, 45, 98);

  basePerformance = {
    profit,
    recovery: recoveryRate,
    occupancy: bedOccupancy,
    capacity: medicalCapacity,
    satisfaction
  };

  refreshPerformance();
}

Object.values(sliders).forEach((slider) => {
  slider.addEventListener("input", updateDashboard);
});

updateDashboard();

const diagramInsights = {
  "acute-care": {
    title: "Acute care discharge -> Patient In",
    text: "More acute care discharges create more potential rehab admissions. If discharge planners identify AMRPA as an appropriate next setting, patient-in volume rises."
  },
  proximity: {
    title: "Proximity -> Patient In",
    text: "Patients closer to the AMRPA rehab hospital face fewer access barriers, which can increase admission likelihood and family support during the stay."
  },
  insurance: {
    title: "Insurance coverage -> Patient In",
    text: "Coverage and network fit determine whether patients can enter the rehab hospital. Poor fit delays or blocks patient-in even when clinical need is present."
  },
  referrals: {
    title: "Referrals -> Patient In",
    text: "Referral relationships from physicians and acute care hospitals feed demand into AMRPA. Strong outcomes and communication can reinforce this loop."
  },
  "external-events": {
    title: "External events -> Demand shock",
    text: "Events such as seasonal illness, accidents, policy changes, or regional disruptions can raise or lower rehab demand and stress bed and staffing capacity."
  },
  "staff-capacity": {
    title: "Staff capacity -> Throughput",
    text: "More available clinical staff improves therapy delivery and discharge readiness. Capacity constraints can increase length of stay and reduce patient-out flow."
  },
  severity: {
    title: "Severity -> Resource intensity",
    text: "Higher patient severity requires more staff time, coordination, and bed days. If capacity does not rise with severity, patient flow slows."
  },
  quality: {
    title: "Quality -> Outcomes and referrals",
    text: "Higher quality improves functional recovery, discharge reliability, and referral strength, which can improve profit and patient-in demand."
  },
  beds: {
    title: "Beds -> Admission capacity",
    text: "Available beds determine how many patients AMRPA can accept. Full beds block patient-in and delay acute care discharge transitions."
  },
  "insurance-approval": {
    title: "Insurance approval -> Flow speed",
    text: "Faster authorization supports smoother admission and discharge planning. Delayed approval creates queues before and during the rehab stay."
  },
  "length-of-stay": {
    title: "Length of stay -> Stock size",
    text: "Longer stays increase the number of patients inside the rehab hospital at any time, tying up beds and staff capacity."
  },
  "capacity-loop": {
    title: "Capacity loop",
    text: "Patient-in volume raises occupancy. Higher occupancy strains staff and beds, which can extend length of stay and slow patient-out, feeding back into admission limits."
  },
  "quality-loop": {
    title: "Quality loop",
    text: "Quality improves recovery outcomes. Better outcomes support referrals, which raises patient-in demand and makes quality a growth lever."
  },
  "insurance-loop": {
    title: "Insurance loop",
    text: "Insurance coverage and approval shape whether patients enter and how quickly they move through the system. Faster approvals reduce flow friction."
  },
  "severity-loop": {
    title: "Severity loop",
    text: "Higher severity raises care intensity and length of stay. Without added capacity, AMRPA has fewer available beds for new patient-in demand."
  }
};

const diagramNodes = Array.from(document.querySelectorAll(".diagram-node"));
const diagramTargets = Array.from(document.querySelectorAll("[data-node]"));
const causalLinks = Array.from(document.querySelectorAll(".causal-link"));
const insightTitle = document.querySelector("#diagramInsightTitle");
const insightText = document.querySelector("#diagramInsightText");
const factorToggles = Array.from(document.querySelectorAll(".factor-toggle"));
const systemScores = {
  profit: document.querySelector("#scoreProfit"),
  recovery: document.querySelector("#scoreRecovery"),
  occupancy: document.querySelector("#scoreOccupancy"),
  capacity: document.querySelector("#scoreCapacity"),
  throughput: document.querySelector("#scoreThroughput")
};
const systemMeters = {
  profit: document.querySelector("#meterProfit"),
  recovery: document.querySelector("#meterRecovery"),
  occupancy: document.querySelector("#meterOccupancy"),
  capacity: document.querySelector("#meterCapacity"),
  throughput: document.querySelector("#meterThroughput")
};
const scenarioTitle = document.querySelector("#scenarioTitle");
const scenarioText = document.querySelector("#scenarioText");

const factorEffects = {
  "acute-care": {
    label: "Acute care discharge",
    targets: ["patient-in"],
    scores: { profit: 5, recovery: -1, occupancy: 16, capacity: -6, throughput: 5, satisfaction: -4 },
    summary: "raises patient volume, increasing occupancy and revenue opportunity while stressing medical capacity"
  },
  proximity: {
    label: "Proximity",
    targets: ["patient-in"],
    scores: { profit: 3, recovery: 4, occupancy: 6, capacity: 1, throughput: 3, satisfaction: 7 },
    summary: "improves access and support, modestly improving recovery and throughput"
  },
  insurance: {
    label: "Insurance coverage",
    targets: ["patient-in", "insurance-approval"],
    scores: { profit: 10, recovery: 2, occupancy: 7, capacity: 2, throughput: 4, satisfaction: 4 },
    summary: "improves reimbursement feasibility and eligibility for admission"
  },
  referrals: {
    label: "Referrals",
    targets: ["patient-in", "quality"],
    scores: { profit: 8, recovery: 3, occupancy: 12, capacity: -3, throughput: 5, satisfaction: 2 },
    summary: "expands patient volume and reinforces the quality-referral loop"
  },
  "external-events": {
    label: "External events",
    targets: ["patient-in", "beds", "staff-capacity"],
    scores: { profit: -4, recovery: -6, occupancy: 18, capacity: -14, throughput: -5, satisfaction: -10 },
    summary: "creates demand shocks that raise bed occupancy and reduce available medical capacity"
  },
  "staff-capacity": {
    label: "Staff capacity",
    targets: ["amrpa-hospital", "patient-out", "length-of-stay"],
    scores: { profit: 6, recovery: 9, occupancy: -4, capacity: 18, throughput: 16, satisfaction: 10 },
    summary: "raises medical capacity by improving staff availability, therapy delivery, and throughput"
  },
  severity: {
    label: "Severity",
    targets: ["amrpa-hospital", "length-of-stay", "staff-capacity"],
    scores: { profit: -6, recovery: -8, occupancy: 10, capacity: -12, throughput: -9, satisfaction: -9 },
    summary: "increases resource intensity, lowering throughput and recovery unless capacity rises"
  },
  quality: {
    label: "Quality",
    targets: ["amrpa-hospital", "referrals", "patient-out"],
    scores: { profit: 9, recovery: 16, occupancy: -3, capacity: 4, throughput: 8, satisfaction: 16 },
    summary: "improves recovery rate, reputation, referrals, and discharge reliability"
  },
  beds: {
    label: "Beds",
    targets: ["amrpa-hospital", "patient-in", "length-of-stay"],
    scores: { profit: 5, recovery: 2, occupancy: -10, capacity: 10, throughput: 6, satisfaction: 3 },
    summary: "adds physical capacity, reducing bed gridlock and supporting more throughput"
  },
  "insurance-approval": {
    label: "Insurance approval",
    targets: ["patient-in", "amrpa-hospital", "patient-out"],
    scores: { profit: 7, recovery: 3, occupancy: -2, capacity: 6, throughput: 10, satisfaction: 6 },
    summary: "reduces authorization delays, improving patient throughput and financial predictability"
  },
  "length-of-stay": {
    label: "Length of stay",
    targets: ["amrpa-hospital", "beds", "patient-out"],
    scores: { profit: -8, recovery: 1, occupancy: 15, capacity: -12, throughput: -14, satisfaction: -6 },
    summary: "keeps patients in beds longer, increasing occupancy while lowering medical capacity and throughput"
  }
};

function activateDiagramNode(node) {
  const nodeId = node.dataset.node;
  const relatedIds = new Set((node.dataset.targets || "").split(" ").filter(Boolean));
  relatedIds.add(nodeId);

  renderDiagramHighlights(relatedIds, node);

  const insight = diagramInsights[nodeId];
  if (insight) {
    insightTitle.textContent = insight.title;
    insightText.textContent = insight.text;
  }
}

diagramNodes.forEach((node) => {
  node.addEventListener("click", () => activateDiagramNode(node));
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateDiagramNode(node);
    }
  });
});

function activeFactorIds() {
  return factorToggles
    .filter((toggle) => toggle.getAttribute("aria-pressed") === "true")
    .map((toggle) => toggle.dataset.factor);
}

function renderDiagramHighlights(relatedIds, selectedNode = null) {
  diagramTargets.forEach((target) => {
    const isRelated = relatedIds.has(target.dataset.node);
    target.classList.toggle("is-active", isRelated);
    target.classList.toggle("is-selected", target === selectedNode);
  });

  causalLinks.forEach((link) => {
    const linkIds = (link.dataset.link || "").split(" ").filter(Boolean);
    const isRelated = linkIds.some((id) => relatedIds.has(id));
    link.classList.toggle("is-active", isRelated);
  });
}

function updateMeter(key, value) {
  const score = clamp(value, -40, 40);
  const width = 50 + score * 1.25;
  systemScores[key].textContent = score > 0 ? `+${score}` : String(score);
  systemMeters[key].style.width = `${clamp(width, 5, 100)}%`;
  systemMeters[key].classList.toggle("positive", score > 0);
  systemMeters[key].classList.toggle("negative", score < 0);
}

function updateExplorer() {
  const active = activeFactorIds();
  const totals = { profit: 0, recovery: 0, occupancy: 0, capacity: 0, throughput: 0, satisfaction: 0 };
  const relatedIds = new Set();
  const summaries = [];

  factorToggles.forEach((toggle) => {
    const isActive = active.includes(toggle.dataset.factor);
    toggle.classList.toggle("is-active", isActive);
  });

  active.forEach((factorId) => {
    const effect = factorEffects[factorId];
    if (!effect) return;
    Object.entries(effect.scores).forEach(([key, value]) => {
      totals[key] += value;
    });
    relatedIds.add(factorId);
    effect.targets.forEach((target) => relatedIds.add(target));
    summaries.push(`${effect.label} ${effect.summary}`);
  });

  explorerTotals = totals;
  Object.entries(totals).forEach(([key, value]) => {
    if (systemScores[key] && systemMeters[key]) {
      updateMeter(key, value);
    }
  });
  refreshPerformance();

  if (active.length > 0) {
    renderDiagramHighlights(relatedIds);
    scenarioTitle.textContent = `${active.length} factor${active.length === 1 ? "" : "s"} active`;
    scenarioText.textContent = summaries.join("; ") + ".";
  } else {
    renderDiagramHighlights(new Set());
    scenarioTitle.textContent = "No factors active";
    scenarioText.textContent = "Turn on one or more factors to explore how they push or relieve the AMRPA rehab hospital system.";
  }
}

factorToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isPressed = toggle.getAttribute("aria-pressed") === "true";
    toggle.setAttribute("aria-pressed", String(!isPressed));
    updateExplorer();
  });
});

updateExplorer();
