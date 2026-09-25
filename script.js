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
