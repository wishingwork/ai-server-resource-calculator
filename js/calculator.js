/**
 * Enterprise AI Server Resource & Cost Calculator Engine
 * Handles mathematical modeling of LLM token throughput, GPU VRAM sizing,
 * CapEx amortization, electricity, cloud hosting rates, and commercial LLM API costs.
 */

class AICostCalculator {
  constructor(metadata) {
    this.hardwareData = metadata.hardware || {};
    this.modelsData = metadata.models || {};
    this.cloudDeployData = metadata.cloudDeploy || {};
    this.cloudLLMData = metadata.cloudLLMs || {};
    this.tiersData = metadata.tiers || {};
  }

  /**
   * Calculates detailed workload parameters from user inputs
   */
  calculateWorkload(inputs) {
    const activeUsers = Math.max(1, parseInt(inputs.activeUsers) || 50);
    const queriesPerUserDay = Math.max(1, parseFloat(inputs.queriesPerUserDay) || 25);
    const avgPromptTokens = Math.max(50, parseInt(inputs.avgPromptTokens) || 800);
    const avgCompletionTokens = Math.max(20, parseInt(inputs.avgCompletionTokens) || 500);
    const concurrencyFactor = Math.min(1.0, Math.max(0.05, parseFloat(inputs.concurrencyFactor) || 0.25));
    const workDaysPerMonth = parseInt(inputs.workDaysPerMonth) || 22;
    const electricityKwhRate = parseFloat(inputs.electricityKwhRate) || 0.15;

    // Daily & Monthly Token Demands
    const totalDailyQueries = activeUsers * queriesPerUserDay;
    const totalMonthlyQueries = totalDailyQueries * workDaysPerMonth;

    const dailyPromptTokens = totalDailyQueries * avgPromptTokens;
    const dailyCompletionTokens = totalDailyQueries * avgCompletionTokens;
    const dailyTotalTokens = dailyPromptTokens + dailyCompletionTokens;

    const monthlyPromptTokens = dailyPromptTokens * workDaysPerMonth;
    const monthlyCompletionTokens = dailyCompletionTokens * workDaysPerMonth;
    const monthlyTotalTokens = dailyTotalTokens * workDaysPerMonth;

    // Peak Concurrency & Throughput calculations (8-hour core business day)
    const peakHours = 8;
    const peakMultiplier = 2.5; // Business day peak spike factor
    const avgQpsDuringPeak = (totalDailyQueries / (peakHours * 3600));
    const peakQps = Math.max(0.1, avgQpsDuringPeak * peakMultiplier);
    const concurrentActiveStreams = Math.max(1, Math.ceil(activeUsers * concurrencyFactor * 0.15));
    const peakRequiredOutputTokensPerSec = peakQps * avgCompletionTokens;

    return {
      activeUsers,
      queriesPerUserDay,
      avgPromptTokens,
      avgCompletionTokens,
      concurrencyFactor,
      workDaysPerMonth,
      electricityKwhRate,
      totalDailyQueries,
      totalMonthlyQueries,
      dailyPromptTokens,
      dailyCompletionTokens,
      dailyTotalTokens,
      monthlyPromptTokens,
      monthlyCompletionTokens,
      monthlyTotalTokens,
      peakQps,
      concurrentActiveStreams,
      peakRequiredOutputTokensPerSec
    };
  }

  /**
   * Calculate On-Premise GPU Build Cost & Sizing for a specific Model & GPU type
   */
  calculateOnPremOption(modelId, gpuId, workload) {
    const model = (this.modelsData.models || []).find(m => m.id === modelId) || (this.modelsData.models || [])[0];
    const gpu = (this.hardwareData.gpus || []).find(g => g.id === gpuId) || (this.hardwareData.gpus || [])[0];
    const platforms = this.hardwareData.server_platforms || {};

    if (!model || !gpu) return null;

    // 1. VRAM Requirement Calculation
    // Base model weights + KV cache for concurrent streams + CUDA runtime overhead
    const kvCachePerStreamGb = ((workload.avgPromptTokens + workload.avgCompletionTokens) / 1000) * (model.vram_kv_cache_per_1k_tokens_gb || 0.15);
    const totalKvCacheGb = kvCachePerStreamGb * workload.concurrentActiveStreams;
    const runtimeOverheadGb = 2.0;
    const totalVramNeededGb = (model.vram_required_weights_gb || 20) + totalKvCacheGb + runtimeOverheadGb;

    // 2. GPU Count required for VRAM & Throughput
    const gpusForVram = Math.ceil(totalVramNeededGb / gpu.vram_gb);
    const gpusForThroughput = Math.ceil(workload.peakRequiredOutputTokensPerSec / (gpu.throughput_tokens_per_sec || 50));
    let requiredGpuCount = Math.max(gpusForVram, gpusForThroughput, 1);

    // Limit to chassis maximum or normalize to standard builds (1, 2, 4, 8)
    let platformKey = 'single_gpu_base';
    if (requiredGpuCount <= 1) {
      requiredGpuCount = 1;
      platformKey = 'single_gpu_base';
    } else if (requiredGpuCount <= 2) {
      requiredGpuCount = 2;
      platformKey = 'dual_gpu_base';
    } else if (requiredGpuCount <= 4) {
      requiredGpuCount = 4;
      platformKey = 'quad_gpu_base';
    } else {
      requiredGpuCount = 8;
      platformKey = 'octa_gpu_base';
    }

    const platform = platforms[platformKey] || platforms['dual_gpu_base'];

    // 3. Financial CapEx
    const gpuHardwareCost = (gpu.server_fitted_cost_usd || gpu.msrp_usd) * requiredGpuCount;
    const totalCapEx = gpuHardwareCost + platform.base_hardware_cost_usd;
    const monthlyAmortization36Mo = totalCapEx / 36;
    const monthlyAmortization12Mo = totalCapEx / 12;

    // 4. Financial OpEx (Electricity & Maintenance)
    // GPU power under typical enterprise load + Chassis Base idle power
    const loadFactor = 0.65;
    const activeWatts = (gpu.tdp_watts * requiredGpuCount * loadFactor) + platform.base_idle_power_watts;
    const idleWatts = (gpu.tdp_watts * requiredGpuCount * 0.15) + platform.base_idle_power_watts;
    
    // 8 hours business load, 16 hours idle
    const dailyKwh = ((activeWatts * 8) + (idleWatts * 16)) / 1000;
    const monthlyKwh = dailyKwh * 30.5; // calendar days
    const monthlyElectricityCost = monthlyKwh * workload.electricityKwhRate;
    const monthlyMaintenanceCost = (this.hardwareData.it_engineer_monthly_overhead_per_server || 250);

    const totalMonthlyOpEx = monthlyElectricityCost + monthlyMaintenanceCost;
    const totalMonthlyCostTCO36 = monthlyAmortization36Mo + totalMonthlyOpEx;
    const totalMonthlyCostTCO12 = monthlyAmortization12Mo + totalMonthlyOpEx;

    const oneYearTCO = totalCapEx + (totalMonthlyOpEx * 12);
    const threeYearTCO = totalCapEx + (totalMonthlyOpEx * 36);
    const costPer1kQueries = workload.totalMonthlyQueries > 0 ? (totalMonthlyCostTCO36 / (workload.totalMonthlyQueries / 1000)) : 0;

    return {
      type: 'on_prem',
      model,
      gpu,
      platform,
      requiredGpuCount,
      totalVramProvidedGb: requiredGpuCount * gpu.vram_gb,
      totalVramNeededGb: Math.round(totalVramNeededGb * 10) / 10,
      systemThroughputTokensSec: gpu.throughput_tokens_per_sec * requiredGpuCount,
      capEx: {
        gpuHardwareCost,
        platformCost: platform.base_hardware_cost_usd,
        totalCapEx
      },
      opEx: {
        monthlyKwh: Math.round(monthlyKwh),
        monthlyElectricityCost: Math.round(monthlyElectricityCost * 100) / 100,
        monthlyMaintenanceCost: Math.round(monthlyMaintenanceCost),
        totalMonthlyOpEx: Math.round(totalMonthlyOpEx * 100) / 100
      },
      monthlyCost: Math.round(totalMonthlyCostTCO36 * 100) / 100,
      monthlyAmortization: Math.round(monthlyAmortization36Mo * 100) / 100,
      oneYearTCO: Math.round(oneYearTCO),
      threeYearTCO: Math.round(threeYearTCO),
      costPer1kQueries: Math.round(costPer1kQueries * 1000) / 1000,
      privacyScore: 100,
      latencyMs: Math.round(250 + (1000 / (gpu.throughput_tokens_per_sec * 0.8)))
    };
  }

  /**
   * Calculate Cloud Hosted GPU Deployment Cost (AWS, Azure, GCP, RunPod, Lambda, Vast.ai, Cloudflare)
   */
  calculateCloudDeployOption(providerId, instanceIndex, workload) {
    const provider = (this.cloudDeployData.providers || []).find(p => p.id === providerId) || (this.cloudDeployData.providers || [])[0];
    if (!provider) return null;

    const instance = (provider.instance_options || [])[instanceIndex || 0] || provider.instance_options[0];
    if (!instance) return null;

    let monthlyComputeCost = 0;
    let requiredInstances = 1;

    // Cloudflare Serverless / Token-based Edge compute
    if (provider.id === 'cloudflare') {
      const ratePer1k = instance.cost_per_1k_tokens_usd || 0.00015;
      monthlyComputeCost = (workload.monthlyTotalTokens / 1000) * ratePer1k;
      if (instance.monthly_reserved_usd) {
        monthlyComputeCost += instance.monthly_reserved_usd;
      }
    } else {
      // Standard Dedicated GPU Instance
      const hoursPerMonth = 730; // 24/7 dedicated availability
      const throughputPerInstance = (instance.vram_gb >= 80 ? 90 : (instance.vram_gb >= 24 ? 50 : 25));
      requiredInstances = Math.max(1, Math.ceil(workload.peakRequiredOutputTokensPerSec / (throughputPerInstance * 1.5)));

      // Use reserved monthly discount if available, or 730 * hourly
      const singleInstanceMonthly = instance.monthly_reserved_usd || (instance.hourly_rate_usd * hoursPerMonth);
      monthlyComputeCost = singleInstanceMonthly * requiredInstances;
    }

    // Network Egress Cost
    const totalOutputGb = (workload.monthlyCompletionTokens * 4) / (1024 * 1024 * 1024); // ~4 bytes per token
    const egressCost = totalOutputGb * (instance.network_egress_gb_cost || 0.05);

    // Storage & Cloud DevOps management overhead
    const storageCost = provider.id === 'cloudflare' ? 0 : (40 * requiredInstances);
    const devopsCost = provider.id === 'cloudflare' ? 50 : 250;

    const totalMonthlyCost = monthlyComputeCost + egressCost + storageCost + devopsCost;
    const oneYearTCO = totalMonthlyCost * 12;
    const threeYearTCO = totalMonthlyCost * 36;
    const costPer1kQueries = workload.totalMonthlyQueries > 0 ? (totalMonthlyCost / (workload.totalMonthlyQueries / 1000)) : 0;

    return {
      type: 'cloud_deploy',
      provider,
      instance,
      requiredInstances,
      monthlyComputeCost: Math.round(monthlyComputeCost * 100) / 100,
      egressCost: Math.round(egressCost * 100) / 100,
      storageCost,
      devopsCost,
      monthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      capEx: 0,
      oneYearTCO: Math.round(oneYearTCO),
      threeYearTCO: Math.round(threeYearTCO),
      costPer1kQueries: Math.round(costPer1kQueries * 1000) / 1000,
      privacyScore: (provider.id === 'aws' || provider.id === 'azure' || provider.id === 'gcp') ? 92 : 82,
      latencyMs: provider.id === 'cloudflare' ? 180 : 320
    };
  }

  /**
   * Calculate Commercial Cloud LLM API Cost (ChatGPT, Claude, Gemini, Grok)
   */
  calculateCloudLLMOption(providerId, modelId, workload) {
    const provider = (this.cloudLLMData.providers || []).find(p => p.id === providerId) || (this.cloudLLMData.providers || [])[0];
    if (!provider) return null;

    const model = (provider.models || []).find(m => m.id === modelId) || (provider.models || [])[0];
    if (!model) return null;

    // Prompt tokens (assuming 25% cache hit rate for system prompts)
    const uncachedPromptRatio = 0.75;
    const cachedPromptRatio = 0.25;
    const cachedPrice = model.cached_input_cost_per_1m || (model.input_cost_per_1m * 0.5);

    const promptCost = ((workload.monthlyPromptTokens * uncachedPromptRatio) / 1000000) * model.input_cost_per_1m
                     + ((workload.monthlyPromptTokens * cachedPromptRatio) / 1000000) * cachedPrice;

    const completionCost = (workload.monthlyCompletionTokens / 1000000) * model.output_cost_per_1m;

    const apiMaintenanceCost = 50; // Minimal API integration / token proxy upkeep
    const totalMonthlyCost = promptCost + completionCost + apiMaintenanceCost;

    const oneYearTCO = totalMonthlyCost * 12;
    const threeYearTCO = totalMonthlyCost * 36;
    const costPer1kQueries = workload.totalMonthlyQueries > 0 ? (totalMonthlyCost / (workload.totalMonthlyQueries / 1000)) : 0;

    return {
      type: 'cloud_llm',
      provider,
      model,
      promptCost: Math.round(promptCost * 100) / 100,
      completionCost: Math.round(completionCost * 100) / 100,
      apiMaintenanceCost,
      monthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      capEx: 0,
      oneYearTCO: Math.round(oneYearTCO),
      threeYearTCO: Math.round(threeYearTCO),
      costPer1kQueries: Math.round(costPer1kQueries * 1000) / 1000,
      privacyScore: 78,
      latencyMs: model.tier.includes('Reasoning') ? 1800 : 450
    };
  }

  /**
   * Calculate 36-month cumulative timeline data for charts
   */
  generateTcoTimeline(onPremOption, cloudDeployOption, cloudLlmOption) {
    const months = Array.from({ length: 36 }, (_, i) => i + 1);

    const onPremData = months.map(m => {
      if (!onPremOption) return 0;
      // CapEx is spent at month 0/1, OpEx increases linearly
      return onPremOption.capEx.totalCapEx + (onPremOption.opEx.totalMonthlyOpEx * m);
    });

    const cloudDeployData = months.map(m => {
      if (!cloudDeployOption) return 0;
      return cloudDeployOption.monthlyCost * m;
    });

    const cloudLlmData = months.map(m => {
      if (!cloudLlmOption) return 0;
      return cloudLlmOption.monthlyCost * m;
    });

    // Find break-even crossover month between On-Prem and Cloud LLM API
    let breakEvenMonthApi = null;
    let breakEvenMonthCloudDeploy = null;

    for (let i = 0; i < months.length; i++) {
      if (breakEvenMonthApi === null && onPremData[i] < cloudLlmData[i]) {
        breakEvenMonthApi = i + 1;
      }
      if (breakEvenMonthCloudDeploy === null && onPremData[i] < cloudDeployData[i]) {
        breakEvenMonthCloudDeploy = i + 1;
      }
    }

    return {
      labels: months.map(m => `M${m}`),
      onPremData,
      cloudDeployData,
      cloudLlmData,
      breakEvenMonthApi,
      breakEvenMonthCloudDeploy
    };
  }
}

// Export for vanilla JS window environment
if (typeof window !== 'undefined') {
  window.AICostCalculator = AICostCalculator;
}
