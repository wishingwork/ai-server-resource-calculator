/**
 * UI Renderer for Enterprise AI Server Resource Analysis (Tailwind CSS v3 Edition)
 * Handles DOM generation, component updates, itemized BOM costs, service rate cards, and comparison matrix tables.
 */

class AIUIRenderer {
  constructor() {
    this.currencySymbol = '$';
    this.currencyRate = 1.0;
  }

  setCurrency(symbol, rate = 1.0) {
    this.currencySymbol = symbol;
    this.currencyRate = rate;
  }

  formatMoney(amount, decimals = 0) {
    const val = (amount || 0) * this.currencyRate;
    return `${this.currencySymbol}${val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  /**
   * Render Top 3 Recommendation Cards with Itemized BOM Pricing & Calculation Formulas
   */
  renderRecommendations(containerId, recommendations) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!recommendations || recommendations.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">No recommendations calculated.</div>`;
      return;
    }

    let html = '<div class="grid grid-cols-1 gap-8">';

    recommendations.forEach((rec) => {
      const isTopPick = rec.rank === 1;
      
      // Dynamic badge styling
      let badgeStyle = "bg-sky-500/20 text-sky-300 border-sky-500/40";
      if (rec.badgeClass.includes('gold')) {
        badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]";
      } else if (rec.badgeClass.includes('purple')) {
        badgeStyle = "bg-purple-500/20 text-purple-300 border-purple-500/40";
      }

      html += `
        <div class="relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-xl border ${
          isTopPick 
            ? 'bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/90 border-amber-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(251,191,36,0.15)] ring-1 ring-amber-500/30' 
            : 'bg-slate-900/75 border-slate-800 shadow-xl'
        }">
          
          <div>
            <!-- Header Badge & Category -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${badgeStyle}">
                  ${rec.badgeText}
                </span>
                <span class="text-xs font-semibold text-slate-400">
                  ${rec.category}
                </span>
              </div>
              <div class="text-xs text-slate-400">
                ⚡ Latency: <strong class="text-slate-200">${rec.latencyRating}</strong>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-6">
              ${rec.title}
            </h3>

            <!-- FINANCIAL COST OVERVIEW HERO BANNER -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 mb-6">
              
              <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Initial CapEx (Upfront)</span>
                <span class="font-mono text-xl sm:text-2xl font-black text-white">
                  ${this.formatMoney(rec.initialCapEx)}
                </span>
                <span class="block text-[10px] text-slate-500 mt-1">Hardware / Setup</span>
              </div>

              <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly OpEx / Maint</span>
                <span class="font-mono text-xl sm:text-2xl font-black text-sky-400">
                  ${this.formatMoney(rec.monthlyOpEx)} <span class="text-xs font-normal text-slate-400">/ mo</span>
                </span>
                <span class="block text-[10px] text-slate-500 mt-1">Power + Tokens + Maint</span>
              </div>

              <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Est. Monthly TCO</span>
                <span class="font-mono text-xl sm:text-2xl font-black ${isTopPick ? 'text-amber-400' : 'text-purple-400'}">
                  ${this.formatMoney(rec.monthlyCost)} <span class="text-xs font-normal text-slate-400">/ mo</span>
                </span>
                <span class="block text-[10px] text-slate-500 mt-1">(CapEx ÷ 36) + OpEx</span>
              </div>

              <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">3-Year Total TCO</span>
                <span class="font-mono text-xl sm:text-2xl font-black text-slate-100">
                  ${this.formatMoney(rec.threeYearTCO)}
                </span>
                <span class="block text-[10px] text-slate-500 mt-1">CapEx + (OpEx × 36)</span>
              </div>

            </div>

            <!-- SERVICE ACCOUNT RATES CARD BOX -->
            <div class="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 mb-6">
              <div class="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-1.5">
                <span>💳</span> Account & Service Unit Rates:
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                ${(rec.serviceRates || []).map(sr => `
                  <div class="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5">
                    <div class="font-bold text-slate-200 mb-0.5">${sr.service}</div>
                    <div class="font-mono text-sky-300 font-semibold">${sr.rate}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- ITEMIZED BILL OF MATERIALS (BOM) COST TABLE -->
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden mb-6">
              <div class="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>📋</span> Bill of Materials (BOM) Itemized Breakdown
                </span>
                <span class="text-[11px] font-semibold text-slate-400">Total BOM Cost Rates</span>
              </div>
              <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th class="px-4 py-2.5">Component / Item Description</th>
                      <th class="px-3 py-2.5">Cost Type</th>
                      <th class="px-3 py-2.5">Qty / Demand</th>
                      <th class="px-3 py-2.5">Unit Rate</th>
                      <th class="px-4 py-2.5 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60 font-medium">
                    ${(rec.bom || []).map(b => `
                      <tr class="hover:bg-slate-900/40 transition">
                        <td class="px-4 py-3 text-slate-100 font-bold">${b.item}</td>
                        <td class="px-3 py-3">
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.type === 'CapEx' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            (b.type === 'OpEx' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                          }">
                            ${b.type}
                          </span>
                        </td>
                        <td class="px-3 py-3 font-mono text-slate-300">${b.qty}</td>
                        <td class="px-3 py-3 font-mono text-slate-400">${b.unitCost}</td>
                        <td class="px-4 py-3 font-mono font-bold text-right ${b.type === 'CapEx' ? 'text-amber-400' : 'text-sky-400'}">
                          ${this.formatMoney(b.totalCost)}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- HOW TO CALCULATE IT (CALCULATION FORMULA BOX) -->
            <div class="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 mb-6">
              <div class="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <span>🧮</span> Step-by-Step TCO Calculation Breakdown:
              </div>
              <div class="font-mono text-xs space-y-2 text-slate-300 leading-relaxed">
                <div class="p-2 rounded bg-slate-950/60 border border-indigo-900/50">
                  <span class="text-amber-400 font-bold">1. Upfront CapEx:</span> ${rec.calculationFormula.step1}
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-indigo-900/50">
                  <span class="text-sky-400 font-bold">2. Monthly Amortization:</span> ${rec.calculationFormula.step2}
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-indigo-900/50">
                  <span class="text-purple-400 font-bold">3. Compute / Power Rate:</span> ${rec.calculationFormula.step3}
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-indigo-900/50">
                  <span class="text-emerald-400 font-bold">4. Monthly Maintenance:</span> ${rec.calculationFormula.step4}
                </div>
                <div class="p-2.5 rounded bg-slate-900/90 border border-sky-500/40 text-white font-bold">
                  <span class="text-sky-300">5. Est. Monthly TCO:</span> ${rec.calculationFormula.step5}
                </div>
                <div class="p-2.5 rounded bg-slate-900/90 border border-amber-500/40 text-white font-bold">
                  <span class="text-amber-300">6. 3-Year Total TCO:</span> ${rec.calculationFormula.step6}
                </div>
              </div>
            </div>

            <!-- Architect Rationale -->
            <div class="bg-sky-950/20 border-l-4 border-sky-400 rounded-r-2xl p-4 mb-6">
              <div class="text-xs font-bold text-sky-300 mb-1">💡 Solution Architect Rationale:</div>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${rec.architectRationale}</p>
            </div>
          </div>

          <!-- Pros & Key Highlights Footer -->
          <div class="pt-4 border-t border-slate-800/80">
            <div class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Key Strategic Advantages:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              ${rec.pros.map(p => `
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 font-bold text-sm">✓</span>
                  <span>${p}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Render Workload KPIs Bar with Tailwind CSS
   */
  renderWorkloadKPIs(workload) {
    const elDailyQueries = document.getElementById('kpi-daily-queries');
    const elDailyTokens = document.getElementById('kpi-daily-tokens');
    const elPeakQps = document.getElementById('kpi-peak-qps');
    const elConcurrentStreams = document.getElementById('kpi-concurrent-streams');
    const elMonthlyTokens = document.getElementById('kpi-monthly-tokens');

    const drawerDailyQueries = document.getElementById('drawer-kpi-daily-queries');
    const drawerDailyTokens = document.getElementById('drawer-kpi-daily-tokens');
    const drawerPeakQps = document.getElementById('drawer-kpi-peak-qps');
    const drawerConcurrentStreams = document.getElementById('drawer-kpi-concurrent-streams');
    const drawerMonthlyTokens = document.getElementById('drawer-kpi-monthly-tokens');

    const valDailyQueries = Math.round(workload.totalDailyQueries).toLocaleString();
    const valDailyTokens = (workload.dailyTotalTokens / 1000000).toFixed(2) + 'M';
    const valPeakQps = workload.peakQps.toFixed(2) + ' req/s';
    const valConcurrentStreams = workload.concurrentActiveStreams.toString() + ' Slots';
    const valMonthlyTokens = (workload.monthlyTotalTokens / 1000000).toFixed(1) + 'M';

    if (elDailyQueries) elDailyQueries.textContent = valDailyQueries;
    if (elDailyTokens) elDailyTokens.textContent = valDailyTokens;
    if (elPeakQps) elPeakQps.textContent = valPeakQps;
    if (elConcurrentStreams) elConcurrentStreams.textContent = workload.concurrentActiveStreams.toString();
    if (elMonthlyTokens) elMonthlyTokens.textContent = valMonthlyTokens;

    if (drawerDailyQueries) drawerDailyQueries.textContent = valDailyQueries;
    if (drawerDailyTokens) drawerDailyTokens.textContent = valDailyTokens;
    if (drawerPeakQps) drawerPeakQps.textContent = valPeakQps;
    if (drawerConcurrentStreams) drawerConcurrentStreams.textContent = valConcurrentStreams;
    if (drawerMonthlyTokens) drawerMonthlyTokens.textContent = valMonthlyTokens;
  }

  /**
   * Render 3-Pillar Architectural Comparison Matrix Table with Tailwind CSS
   * Matches the exact table style in ComparisonMatrix.tsx
   */
  renderComparisonMatrix(onPrem, cloudDeploy, cloudLlm, workload) {
    const container = document.getElementById('comparison-matrix-container');
    if (!container) return;

    if (!onPrem || !cloudDeploy || !cloudLlm) return;

    const onPremCostPerUser = onPrem.monthlyCost / workload.activeUsers;
    const cloudCostPerUser = cloudDeploy.monthlyCost / workload.activeUsers;
    const llmCostPerUser = cloudLlm.monthlyCost / workload.activeUsers;

    const html = `
      <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <!-- Table Header -->
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/90">
              <th class="p-4 sm:p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/4">
                Architecture Dimension
              </th>

              <!-- Column 1: On-Premise Server -->
              <th class="p-4 sm:p-5 font-bold text-white w-1/4 border-l border-slate-800/80 bg-emerald-950/20">
                <div class="flex items-center gap-2.5">
                  <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">🖥️</div>
                  <div>
                    <span class="font-extrabold text-emerald-400 block text-sm sm:text-base">On-Premise Server</span>
                    <span class="text-[11px] font-normal text-slate-400">${onPrem.gpu.name} + ${onPrem.model.family}</span>
                  </div>
                </div>
              </th>

              <!-- Column 2: Deploy to Cloud -->
              <th class="p-4 sm:p-5 font-bold text-white w-1/4 border-l border-slate-800/80 bg-blue-950/20">
                <div class="flex items-center gap-2.5">
                  <div class="p-2 rounded-xl bg-blue-500/20 text-blue-400 text-lg">☁️</div>
                  <div>
                    <span class="font-extrabold text-blue-400 block text-sm sm:text-base">Deploy to Cloud</span>
                    <span class="text-[11px] font-normal text-slate-400">${cloudDeploy.provider.name}</span>
                  </div>
                </div>
              </th>

              <!-- Column 3: Commercial LLM API -->
              <th class="p-4 sm:p-5 font-bold text-white w-1/4 border-l border-slate-800/80 bg-amber-950/20">
                <div class="flex items-center gap-2.5">
                  <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400 text-lg">🌐</div>
                  <div>
                    <span class="font-extrabold text-amber-400 block text-sm sm:text-base">Commercial Cloud API</span>
                    <span class="text-[11px] font-normal text-slate-400">${cloudLlm.provider.provider_name}</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            <!-- Row 1: Upfront Server CapEx -->
            <tr class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 font-semibold text-slate-300">
                <div class="flex items-center gap-1.5">
                  <span class="text-amber-400 font-bold">💵</span> Upfront Server CapEx
                </div>
              </td>
              <td class="p-4 font-mono font-bold text-emerald-400 border-l border-slate-800/60 bg-emerald-950/10">
                ${this.formatMoney(onPrem.capEx.totalCapEx)}
                <div class="text-[11px] font-sans font-normal text-slate-400 mt-0.5">${onPrem.requiredGpuCount}x ${onPrem.gpu.name} build</div>
              </td>
              <td class="p-4 font-mono text-slate-400 border-l border-slate-800/60">
                $0 <span class="text-xs font-sans text-slate-500">(100% OpEx)</span>
              </td>
              <td class="p-4 font-mono text-slate-400 border-l border-slate-800/60">
                $0 <span class="text-xs font-sans text-slate-500">(Pay-as-you-go)</span>
              </td>
            </tr>

            <!-- Row 2: Total Monthly Cost -->
            <tr class="hover:bg-slate-800/30 transition-colors bg-slate-900/40">
              <td class="p-4 font-semibold text-slate-300">
                <div class="flex items-center gap-1.5">
                  <span class="text-sky-400 font-bold">⏱️</span> Total Monthly Cost
                </div>
                <span class="text-[10px] text-slate-500 font-normal block">(Includes CapEx amortization, power, & maintenance)</span>
              </td>
              <td class="p-4 font-mono font-extrabold text-white border-l border-slate-800/60 bg-emerald-950/10">
                <span class="text-base text-emerald-300">${this.formatMoney(onPrem.monthlyCost)}</span>
                <span class="text-xs text-slate-400">/mo</span>
                <div class="text-[11px] font-normal text-slate-400 font-sans mt-0.5">Amortized: ${this.formatMoney(onPrem.monthlyAmortization)} + OpEx: ${this.formatMoney(onPrem.opEx.totalMonthlyOpEx)}</div>
              </td>
              <td class="p-4 font-mono font-bold text-white border-l border-slate-800/60">
                <span class="text-base text-blue-300">${this.formatMoney(cloudDeploy.monthlyCost)}</span>
                <span class="text-xs text-slate-400">/mo</span>
                <div class="text-[11px] font-normal text-slate-400 font-sans mt-0.5">Compute: ${this.formatMoney(cloudDeploy.monthlyComputeCost)} + Egress/Storage</div>
              </td>
              <td class="p-4 font-mono font-bold text-white border-l border-slate-800/60">
                <span class="text-base text-amber-300">${this.formatMoney(cloudLlm.monthlyCost)}</span>
                <span class="text-xs text-slate-400">/mo</span>
                <div class="text-[11px] font-normal text-slate-400 font-sans mt-0.5">Token consumption billing</div>
              </td>
            </tr>

            <!-- Row 3: Cost per Active User / Month -->
            <tr class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 font-semibold text-slate-300">
                Cost per User / Month
              </td>
              <td class="p-4 font-mono font-bold text-emerald-400 border-l border-slate-800/60 bg-emerald-950/10">
                ${this.formatMoney(onPremCostPerUser, 2)} / seat
              </td>
              <td class="p-4 font-mono font-bold text-blue-400 border-l border-slate-800/60">
                ${this.formatMoney(cloudCostPerUser, 2)} / seat
              </td>
              <td class="p-4 font-mono font-bold text-amber-400 border-l border-slate-800/60">
                ${this.formatMoney(llmCostPerUser, 2)} / seat
              </td>
            </tr>

            <!-- Row 4: 3-Year Cumulative TCO -->
            <tr class="hover:bg-slate-800/30 transition-colors bg-slate-900/40">
              <td class="p-4 font-semibold text-slate-300">
                3-Year Cumulative TCO
              </td>
              <td class="p-4 font-mono font-black text-emerald-400 border-l border-slate-800/60 bg-emerald-950/10 text-base">
                ${this.formatMoney(onPrem.threeYearTCO)}
              </td>
              <td class="p-4 font-mono font-bold text-blue-300 border-l border-slate-800/60 text-base">
                ${this.formatMoney(cloudDeploy.threeYearTCO)}
              </td>
              <td class="p-4 font-mono font-bold text-amber-300 border-l border-slate-800/60 text-base">
                ${this.formatMoney(cloudLlm.threeYearTCO)}
              </td>
            </tr>

            <!-- Row 5: Data Privacy & Security -->
            <tr class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 font-semibold text-slate-300">
                <div class="flex items-center gap-1.5">
                  <span>🛡️</span> Data Privacy & Sovereignty
                </div>
              </td>
              <td class="p-4 border-l border-slate-800/60 bg-emerald-950/10">
                <span class="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                  ✓ 100% Air-Gapped Local
                </span>
                <p class="text-[11px] text-slate-400 mt-0.5">Zero tokens ever leave your office / LAN</p>
              </td>
              <td class="p-4 border-l border-slate-800/60">
                <span class="inline-flex items-center gap-1 text-blue-400 font-semibold text-xs">
                  ✓ Dedicated Cloud VPC
                </span>
                <p class="text-[11px] text-slate-400 mt-0.5">Customer-managed encryption keys in cloud</p>
              </td>
              <td class="p-4 border-l border-slate-800/60">
                <span class="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs">
                  Commercial SaaS
                </span>
                <p class="text-[11px] text-slate-400 mt-0.5">Enterprise BAA / zero-data retention policy</p>
              </td>
            </tr>

            <!-- Row 6: Compute Engine Specs -->
            <tr class="hover:bg-slate-800/30 transition-colors bg-slate-900/40">
              <td class="p-4 font-semibold text-slate-300">
                Compute Engine Specs
              </td>
              <td class="p-4 border-l border-slate-800/60 bg-emerald-950/10 text-xs text-slate-300">
                <div class="font-medium text-white">${onPrem.requiredGpuCount}x ${onPrem.gpu.name} (${onPrem.totalVramProvidedGb}GB)</div>
                <div class="text-slate-400 mt-0.5">${onPrem.model.name} (${onPrem.model.recommended_quantization})</div>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs text-slate-300">
                <div class="font-medium text-white">${cloudDeploy.instance.name}</div>
                <div class="text-slate-400 mt-0.5">${cloudDeploy.requiredInstances}x ${cloudDeploy.provider.name} instance nodes</div>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs text-slate-300">
                <div class="font-medium text-white">${cloudLlm.model.name}</div>
                <div class="text-slate-400 mt-0.5">${cloudLlm.provider.provider_name} cluster</div>
              </td>
            </tr>

            <!-- Row 7: DevOps Maintenance Effort -->
            <tr class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 font-semibold text-slate-300">
                DevOps Maintenance
              </td>
              <td class="p-4 border-l border-slate-800/60 bg-emerald-950/10 text-xs">
                <span class="text-amber-400 font-semibold">Moderate</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Linux patching & Ollama/vLLM daemon (~3-5 hrs/mo)</p>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs">
                <span class="text-blue-400 font-semibold">Low-Moderate</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Cloud VM image updates & Terraform lifecycle</p>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs">
                <span class="text-emerald-400 font-semibold">Zero Infra</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Fully managed by SaaS provider (API key auth)</p>
              </td>
            </tr>

            <!-- Row 8: Unmetered Token Scaling -->
            <tr class="hover:bg-slate-800/30 transition-colors bg-slate-900/40">
              <td class="p-4 font-semibold text-slate-300">
                Unmetered Token Scaling
              </td>
              <td class="p-4 border-l border-slate-800/60 bg-emerald-950/10 text-xs">
                <span class="text-emerald-400 font-bold">100% Unmetered</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Run 10x token traffic for $0 extra billing</p>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs">
                <span class="text-blue-400 font-bold">Fixed Compute</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Unmetered within GPU capacity limit</p>
              </td>
              <td class="p-4 border-l border-slate-800/60 text-xs">
                <span class="text-amber-400 font-bold">Linearly Metered</span>
                <p class="text-[11px] text-slate-400 mt-0.5">Every additional prompt & completion token is billed</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Populate Dropdowns from JSON Metadata
   */
  populateSelects(hardwareData, modelsData, cloudDeployData, cloudLLMData) {
    // 1. Local GPU Select
    const gpuSelect = document.getElementById('select-local-gpu');
    if (gpuSelect && hardwareData.gpus) {
      gpuSelect.innerHTML = hardwareData.gpus.map(g => `
        <option value="${g.id}">[${g.generation}] ${g.name} (${g.vram_gb}GB ${g.memory_type} - $${g.server_fitted_cost_usd || g.msrp_usd})</option>
      `).join('');
    }

    // 2. On-Prem Model Select
    const modelSelect = document.getElementById('select-onprem-model');
    if (modelSelect && modelsData.models) {
      modelSelect.innerHTML = modelsData.models.map(m => `
        <option value="${m.id}">[${m.family}] ${m.name} (${m.parameters_billion}B - ${m.recommended_quantization})</option>
      `).join('');
    }

    // 3. Cloud Provider Select
    const cloudProviderSelect = document.getElementById('select-cloud-provider');
    if (cloudProviderSelect && cloudDeployData.providers) {
      cloudProviderSelect.innerHTML = cloudDeployData.providers.map(p => `
        <option value="${p.id}">${p.name} (${p.category})</option>
      `).join('');
    }

    // 4. Cloud LLM Provider & Model Select
    const llmProviderSelect = document.getElementById('select-llm-provider');
    if (llmProviderSelect && cloudLLMData.providers) {
      llmProviderSelect.innerHTML = cloudLLMData.providers.map(p => `
        <option value="${p.id}">${p.provider_name}</option>
      `).join('');
    }
  }

  /**
   * Update Cloud Instance options when Cloud Provider changes
   */
  updateCloudInstanceOptions(cloudDeployData, selectedProviderId) {
    const instanceSelect = document.getElementById('select-cloud-instance');
    if (!instanceSelect) return;

    const provider = (cloudDeployData.providers || []).find(p => p.id === selectedProviderId) || cloudDeployData.providers[0];
    if (provider && provider.instance_options) {
      instanceSelect.innerHTML = provider.instance_options.map((inst, idx) => `
        <option value="${idx}">${inst.name} - ${inst.hourly_rate_usd ? `$${inst.hourly_rate_usd}/hr` : (inst.cost_per_1k_tokens_usd ? `$${inst.cost_per_1k_tokens_usd}/1k tok` : 'Custom')}</option>
      `).join('');
    }
  }

  /**
   * Update Cloud LLM Model options when LLM Provider changes
   */
  updateCloudLLMModelOptions(cloudLLMData, selectedProviderId) {
    const modelSelect = document.getElementById('select-llm-model');
    if (!modelSelect) return;

    const provider = (cloudLLMData.providers || []).find(p => p.id === selectedProviderId) || cloudLLMData.providers[0];
    if (provider && provider.models) {
      modelSelect.innerHTML = provider.models.map(m => `
        <option value="${m.id}">${m.name} ($${m.input_cost_per_1m}/M in, $${m.output_cost_per_1m}/M out)</option>
      `).join('');
    }
  }
}

// Export for vanilla JS window environment
if (typeof window !== 'undefined') {
  window.AIUIRenderer = AIUIRenderer;
}
