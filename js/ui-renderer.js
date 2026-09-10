/**
 * UI Renderer for Enterprise AI Server Resource Analysis (Tailwind CSS v3 Edition)
 * Handles DOM generation, component updates, itemized BOM costs, service rate cards, and calculation formulas.
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

    if (elDailyQueries) elDailyQueries.textContent = Math.round(workload.totalDailyQueries).toLocaleString();
    if (elDailyTokens) elDailyTokens.textContent = (workload.dailyTotalTokens / 1000000).toFixed(2) + 'M';
    if (elPeakQps) elPeakQps.textContent = workload.peakQps.toFixed(2) + ' req/s';
    if (elConcurrentStreams) elConcurrentStreams.textContent = workload.concurrentActiveStreams.toString();
    if (elMonthlyTokens) elMonthlyTokens.textContent = (workload.monthlyTotalTokens / 1000000).toFixed(1) + 'M';
  }

  /**
   * Render 3-Way Side-by-Side Comparison Matrix with Tailwind CSS
   */
  renderComparisonMatrix(onPrem, cloudDeploy, cloudLlm, workload) {
    const container = document.getElementById('comparison-matrix-container');
    if (!container) return;

    if (!onPrem || !cloudDeploy || !cloudLlm) return;

    const html = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 1. ON-PREMISE CARD -->
        <div class="bg-slate-900/75 backdrop-blur-xl border border-slate-800 border-t-4 border-t-sky-400 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">🖥️</span>
              <div>
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Option 1: Self-Hosted Server</span>
                <h4 class="text-base font-bold text-white">${onPrem.gpu.name} (${onPrem.requiredGpuCount}x)</h4>
              </div>
            </div>

            <!-- Price Hero -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center mb-5">
              <div class="font-mono text-3xl font-black text-white">
                ${this.formatMoney(onPrem.monthlyCost)} <span class="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <div class="text-xs text-slate-400 mt-1">Initial CapEx: <strong class="text-slate-200">${this.formatMoney(onPrem.capEx.totalCapEx)}</strong></div>
            </div>

            <!-- Spec Details -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Target Model:</span>
                <span class="font-bold text-sky-400">${onPrem.model.name}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">VRAM Capacity:</span>
                <span class="font-semibold text-slate-200">${onPrem.totalVramProvidedGb}GB (${onPrem.gpu.memory_type})</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">VRAM Required:</span>
                <span class="font-semibold text-slate-200">${onPrem.totalVramNeededGb}GB (Weights + KV)</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Monthly Power:</span>
                <span class="font-semibold text-slate-200">${onPrem.opEx.monthlyKwh} kWh (${this.formatMoney(onPrem.opEx.monthlyElectricityCost)})</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">IT Maintenance:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(onPrem.opEx.monthlyMaintenanceCost)} / mo</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Cost / 1k Queries:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(onPrem.costPer1kQueries, 3)}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">1-Year TCO:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(onPrem.oneYearTCO)}</span>
              </div>
              <div class="flex justify-between items-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span class="text-slate-300 font-medium">3-Year Total TCO:</span>
                <span class="font-mono text-sm font-bold text-sky-400">${this.formatMoney(onPrem.threeYearTCO)}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Data Privacy:</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🔒 100% Air-Gapped Local
            </span>
          </div>
        </div>

        <!-- 2. CLOUD GPU DEDICATED CARD -->
        <div class="bg-slate-900/75 backdrop-blur-xl border border-slate-800 border-t-4 border-t-purple-400 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">☁️</span>
              <div>
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Option 2: Cloud Hosted GPU</span>
                <h4 class="text-base font-bold text-white">${cloudDeploy.provider.name}</h4>
              </div>
            </div>

            <!-- Price Hero -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center mb-5">
              <div class="font-mono text-3xl font-black text-white">
                ${this.formatMoney(cloudDeploy.monthlyCost)} <span class="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <div class="text-xs text-slate-400 mt-1">Initial CapEx: <strong class="text-slate-200">$0 (Pay OpEx)</strong></div>
            </div>

            <!-- Spec Details -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Instance Type:</span>
                <span class="font-bold text-purple-400">${cloudDeploy.instance.name}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Instance Count:</span>
                <span class="font-semibold text-slate-200">${cloudDeploy.requiredInstances}x Instance Nodes</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Monthly Compute:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(cloudDeploy.monthlyComputeCost)}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Storage & Egress:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(cloudDeploy.storageCost + cloudDeploy.egressCost)}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">DevOps Overhead:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(cloudDeploy.devopsCost)} / mo</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Cost / 1k Queries:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(cloudDeploy.costPer1kQueries, 3)}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">1-Year TCO:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(cloudDeploy.oneYearTCO)}</span>
              </div>
              <div class="flex justify-between items-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span class="text-slate-300 font-medium">3-Year Total TCO:</span>
                <span class="font-mono text-sm font-bold text-purple-400">${this.formatMoney(cloudDeploy.threeYearTCO)}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Data Privacy:</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              🛡️ Dedicated Cloud VPC
            </span>
          </div>
        </div>

        <!-- 3. COMMERCIAL CLOUD LLM API CARD -->
        <div class="bg-slate-900/75 backdrop-blur-xl border border-slate-800 border-t-4 border-t-emerald-400 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">🌐</span>
              <div>
                <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Option 3: Commercial LLM API</span>
                <h4 class="text-base font-bold text-white">${cloudLlm.provider.provider_name}</h4>
              </div>
            </div>

            <!-- Price Hero -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center mb-5">
              <div class="font-mono text-3xl font-black text-white">
                ${this.formatMoney(cloudLlm.monthlyCost)} <span class="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <div class="text-xs text-slate-400 mt-1">Initial CapEx: <strong class="text-slate-200">$0 (Token Sizing)</strong></div>
            </div>

            <!-- Spec Details -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Model Engine:</span>
                <span class="font-bold text-emerald-400">${cloudLlm.model.name}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Prompt Token Cost:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(cloudLlm.promptCost)} / mo</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Output Token Cost:</span>
                <span class="font-semibold text-slate-200">${this.formatMoney(cloudLlm.completionCost)} / mo</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Context Window:</span>
                <span class="font-semibold text-slate-200">${cloudLlm.model.context_window.toLocaleString()} tokens</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Server Maintenance:</span>
                <span class="font-semibold text-slate-200">$0 (Pure API Integration)</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">Cost / 1k Queries:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(cloudLlm.costPer1kQueries, 3)}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-slate-800">
                <span class="text-slate-400">1-Year TCO:</span>
                <span class="font-mono font-semibold text-slate-200">${this.formatMoney(cloudLlm.oneYearTCO)}</span>
              </div>
              <div class="flex justify-between items-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span class="text-slate-300 font-medium">3-Year Total TCO:</span>
                <span class="font-mono text-sm font-bold text-emerald-400">${this.formatMoney(cloudLlm.threeYearTCO)}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Data Privacy:</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/40 text-slate-300 border border-slate-600/40">
              📑 Zero-Retention SLA
            </span>
          </div>
        </div>

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
