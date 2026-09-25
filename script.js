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
  satisfaction: document.querySelector("#satisfaction"),
  lengthOfStay: document.querySelector("#lengthOfStay"),
  utilization: document.querySelector("#utilization"),
  readmission: document.querySelector("#readmission")
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

  const satisfaction = clamp(72 + matchQuality * 0.22 - demandPenalty, 55, 96);
  const lengthOfStay = clamp(15.8 - matchQuality * 0.045 + demandPressure * 0.012, 9.8, 18.5);
  const utilization = clamp(62 + demandPressure * 0.23 - specialistShare * 0.05, 55, 96);
  const readmission = clamp(5.2 + underSpecializedPenalty + (100 - matchQuality) * 0.045, 3.8, 13.5);

  metrics.satisfaction.textContent = Math.round(satisfaction);
  metrics.lengthOfStay.textContent = lengthOfStay.toFixed(1);
  metrics.utilization.textContent = `${Math.round(utilization)}%`;
  metrics.readmission.textContent = `${readmission.toFixed(1)}%`;
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
    text: "Higher quality improves functional outcomes, patient satisfaction, and discharge reliability, which can strengthen referrals back into patient-in."
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
    text: "Quality improves outcomes and satisfaction. Better outcomes support referrals, which raises patient-in demand and makes quality a growth lever."
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
  patientIn: document.querySelector("#scorePatientIn"),
  capacity: document.querySelector("#scoreCapacity"),
  los: document.querySelector("#scoreLos"),
  patientOut: document.querySelector("#scorePatientOut"),
  satisfaction: document.querySelector("#scoreSatisfaction")
};
const systemMeters = {
  patientIn: document.querySelector("#meterPatientIn"),
  capacity: document.querySelector("#meterCapacity"),
  los: document.querySelector("#meterLos"),
  patientOut: document.querySelector("#meterPatientOut"),
  satisfaction: document.querySelector("#meterSatisfaction")
};
const scenarioTitle = document.querySelector("#scenarioTitle");
const scenarioText = document.querySelector("#scenarioText");

const factorEffects = {
  "acute-care": {
    label: "Acute care discharge",
    targets: ["patient-in"],
    scores: { patientIn: 18, capacity: 8, los: 4, patientOut: 3, satisfaction: -2 },
    summary: "raises admission demand and can strain capacity if beds and staff are not ready"
  },
  proximity: {
    label: "Proximity",
    targets: ["patient-in"],
    scores: { patientIn: 10, capacity: 2, los: -1, patientOut: 2, satisfaction: 5 },
    summary: "improves access and family support, modestly improving flow and satisfaction"
  },
  insurance: {
    label: "Insurance coverage",
    targets: ["patient-in", "insurance-approval"],
    scores: { patientIn: 12, capacity: 3, los: -2, patientOut: 4, satisfaction: 4 },
    summary: "improves eligibility for entry and lowers financial friction"
  },
  referrals: {
    label: "Referrals",
    targets: ["patient-in", "quality"],
    scores: { patientIn: 15, capacity: 5, los: 1, patientOut: 3, satisfaction: 3 },
    summary: "expands patient-in volume and reinforces the quality-referral loop"
  },
  "external-events": {
    label: "External events",
    targets: ["patient-in", "beds", "staff-capacity"],
    scores: { patientIn: 20, capacity: 15, los: 8, patientOut: -5, satisfaction: -6 },
    summary: "creates demand shocks that raise occupancy and can slow patient-out flow"
  },
  "staff-capacity": {
    label: "Staff capacity",
    targets: ["amrpa-hospital", "patient-out", "length-of-stay"],
    scores: { patientIn: 4, capacity: -16, los: -10, patientOut: 16, satisfaction: 9 },
    summary: "relieves bottlenecks by improving therapy throughput and discharge readiness"
  },
  severity: {
    label: "Severity",
    targets: ["amrpa-hospital", "length-of-stay", "staff-capacity"],
    scores: { patientIn: 2, capacity: 14, los: 14, patientOut: -9, satisfaction: -6 },
    summary: "increases resource intensity and length of stay, slowing discharge flow"
  },
  quality: {
    label: "Quality",
    targets: ["amrpa-hospital", "referrals", "patient-out"],
    scores: { patientIn: 6, capacity: -5, los: -6, patientOut: 12, satisfaction: 16 },
    summary: "improves outcomes, referrals, patient-out reliability, and satisfaction"
  },
  beds: {
    label: "Beds",
    targets: ["amrpa-hospital", "patient-in", "length-of-stay"],
    scores: { patientIn: 8, capacity: -14, los: -4, patientOut: 6, satisfaction: 4 },
    summary: "adds physical capacity, reducing admission blocks and occupancy strain"
  },
  "insurance-approval": {
    label: "Insurance approval",
    targets: ["patient-in", "amrpa-hospital", "patient-out"],
    scores: { patientIn: 10, capacity: -4, los: -8, patientOut: 10, satisfaction: 7 },
    summary: "speeds movement into and through the rehab stay by reducing authorization delays"
  },
  "length-of-stay": {
    label: "Length of stay",
    targets: ["amrpa-hospital", "beds", "patient-out"],
    scores: { patientIn: -5, capacity: 12, los: 18, patientOut: -12, satisfaction: -5 },
    summary: "keeps patients in the stock longer, using beds and slowing patient-out"
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
  const totals = { patientIn: 0, capacity: 0, los: 0, patientOut: 0, satisfaction: 0 };
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

  Object.entries(totals).forEach(([key, value]) => updateMeter(key, value));

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
