/**
 * Enterprise AI Solution Architect Recommendation Engine
 * Evaluates company scale, active users, data sensitivity, latency, and TCO
 * to generate and rank the Top 3 Recommended Architectures.
 * Provides detailed BOM itemized costs, rate cards, and step-by-step TCO calculation formulas.
 */

class AIArchitectureRecommender {
  constructor(calculator) {
    this.calc = calculator;
  }

  /**
   * Generates the Top 3 recommended enterprise architectures with full BOM pricing & formulas
   */
  getTop3Recommendations(workload, constraints = {}) {
    const users = workload.activeUsers;
    const privacy = constraints.privacyLevel || 'strict';

    let rec1, rec2, rec3;

    // =========================================================================
    // RECOMMENDATION #1: TOP OVERALL STRATEGIC VALUE & BALANCED TCO
    // =========================================================================
    if (users <= 25) {
      // Small Teams (<25 users): Cloudflare Workers AI + OpenAI GPT-4o-mini
      const cloudflareOption = this.calc.calculateCloudDeployOption('cloudflare', 0, workload);
      const apiOption = this.calc.calculateCloudLLMOption('chatgpt_openai', 'gpt_4o_mini', workload);
      
      const initialCapEx = 0;
      const monthlyCompute = cloudflareOption.monthlyCost;
      const monthlyApiTokens = apiOption.monthlyCost * 0.4;
      const monthlyMaintenance = 50; // Minimal API integration maintenance
      const monthlyOpEx = monthlyCompute + monthlyApiTokens + monthlyMaintenance;
      const monthlyCost = monthlyOpEx;
      const threeYearTCO = monthlyCost * 36;
      const oneYearTCO = monthlyCost * 12;

      rec1 = {
        rank: 1,
        title: "Hybrid Serverless & Smart API Gateway",
        category: "Cloud Serverless & API",
        badgeText: "🏆 #1 Best ROI for Small Teams",
        badgeClass: "badge-gold",
        initialCapEx,
        initialCapExRefUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
        monthlyOpEx,
        monthlyCost,
        oneYearTCO,
        threeYearTCO,
        latencyRating: "< 350ms",
        throughputTokensSec: 150,
        privacyRating: "Standard Business Isolation (Zero Data Retention)",
        devopsEffort: "Near Zero (No Hardware Maintenance)",

        // Per-Account / Service Rates
        serviceRates: [
          { service: "Cloudflare Workers AI (Routine Queries)", rate: `$0.00015 per 1,000 tokens`, refUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/" },
          { service: "OpenAI GPT-4o-mini (Complex Reasoning)", rate: `$0.15 / 1M input, $0.60 / 1M output tokens`, refUrl: "https://openai.com/api/pricing/" },
          { service: "Cloudflare Vectorize + Redis Cache", rate: `$5.00 / month flat storage rate`, refUrl: "https://developers.cloudflare.com/vectorize/platform/pricing/" }
        ],

        // Itemized Bill of Materials (BOM)
        bom: [
          { item: "Primary Inference Engine (Cloudflare Workers AI)", type: "OpEx", qty: `${(workload.monthlyTotalTokens * 0.8 / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}k tokens`, unitCost: "$0.00015 / 1k", totalCost: monthlyCompute, refUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/" },
          { item: "Reasoning Gateway (OpenAI GPT-4o-mini)", type: "OpEx", qty: `${(workload.monthlyTotalTokens * 0.2 / 1000000).toFixed(1)}M tokens`, unitCost: "$0.15-$0.60 / 1M", totalCost: monthlyApiTokens, refUrl: "https://openai.com/api/pricing/" },
          { item: "Vector Cache & API Proxy Upkeep", type: "OpEx", qty: "1 Gateway", unitCost: "$50.00 / mo", totalCost: monthlyMaintenance, refUrl: "https://developers.cloudflare.com/vectorize/platform/pricing/" }
        ],

        // Step-by-Step Calculation Formula
        calculationFormula: {
          step1: `Initial Upfront CapEx = $0 (Zero Hardware Purchase)`,
          step2: `Monthly Compute = (${(workload.monthlyTotalTokens * 0.8 / 1000).toLocaleString(undefined, {maximumFractionDigits:0})}k tokens × $0.00015/1k) = $${monthlyCompute.toFixed(2)} / mo`,
          step3: `Monthly API Tokens = (${(workload.monthlyTotalTokens * 0.2 / 1000000).toFixed(1)}M tokens × GPT-4o-mini rate) = $${monthlyApiTokens.toFixed(2)} / mo`,
          step4: `Monthly Maintenance = $${monthlyMaintenance.toFixed(2)} / mo`,
          step5: `Est. Monthly TCO = ($0 CapEx ÷ 36) + $${monthlyCompute.toFixed(2)} + $${monthlyApiTokens.toFixed(2)} + $${monthlyMaintenance.toFixed(2)} = $${Math.round(monthlyCost).toLocaleString()} / mo`,
          step6: `3-Year Total TCO = $0 CapEx + ($${Math.round(monthlyCost).toLocaleString()} / mo × 36 Months) = $${Math.round(threeYearTCO).toLocaleString()}`
        },

        components: [
          { name: "Primary Inference Engine", detail: "Cloudflare Workers AI (Qwen 2.5 / Gemma 2 9B) for 80% routine queries" },
          { name: "Complex Reasoning Gateway", detail: "OpenAI GPT-4o-mini / Gemini 2.0 Flash for heavy reasoning routing" },
          { name: "Vector Search / Cache", detail: "Cloudflare Vectorize + Redis Prompt Cache" }
        ],
        pros: [
          "Zero upfront CapEx ($0 initial investment)",
          "Pay strictly per active token query with zero idle server waste",
          "Sub-300ms response time at 300+ global edge locations",
          "Zero DevOps infrastructure overhead"
        ],
        cons: [
          "Requires reliable internet connection",
          "Not air-gapped from external cloud networks"
        ],
        architectRationale: `With ${users} active users generating ~${workload.totalDailyQueries.toLocaleString()} daily queries, dedicated 24/7 on-premise hardware has high idle waste. A hybrid serverless approach provides immediate enterprise agility at just $${Math.round(monthlyCost)}/mo.`
      };

    } else if (users <= 300) {
      // Mid-Market Teams (25-300 users): Dual RTX 5090 On-Premise Rig
      const onPremOption = this.calc.calculateOnPremOption('qwen_2_5_32b', 'rtx_5090', workload);
      
      const initialCapEx = onPremOption.capEx.totalCapEx;
      const monthlyAmortization = onPremOption.monthlyAmortization;
      const monthlyElectricity = onPremOption.opEx.monthlyElectricityCost;
      const monthlyMaintenance = onPremOption.opEx.monthlyMaintenanceCost;
      const monthlyOpEx = monthlyElectricity + monthlyMaintenance;
      const monthlyCost = onPremOption.monthlyCost;
      const threeYearTCO = onPremOption.threeYearTCO;
      const oneYearTCO = onPremOption.oneYearTCO;

      rec1 = {
        rank: 1,
        title: "Dual RTX 5090 On-Premise Workstation Node",
        category: "On-Premises Dedicated Server",
        badgeText: "🏆 #1 Best Enterprise Value & Payback (< 5 Mo)",
        badgeClass: "badge-gold",
        initialCapEx,
        initialCapExRefUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
        monthlyOpEx,
        monthlyCost,
        oneYearTCO,
        threeYearTCO,
        latencyRating: "Sub-400ms (High Local Throughput)",
        throughputTokensSec: onPremOption.systemThroughputTokensSec,
        privacyRating: "100% Confidential (Air-Gapped Local LAN)",
        devopsEffort: "Low (Pre-configured Ollama / vLLM Container)",

        // Per-Account / Service Rates
        serviceRates: [
          { service: "NVIDIA RTX 5090 32GB GDDR7 Hardware", rate: `$2,400.00 per fitted GPU (CapEx)`, refUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" },
          { service: "Dual-GPU Workstation Server Base Platform", rate: `$3,200.00 base platform build (CapEx)`, refUrl: onPremOption.platform.pricing_ref_url || "https://www.pugetsystems.com/solutions/ai-and-hpc-workstations/" },
          { service: "Power & Electricity Rate", rate: `${onPremOption.opEx.monthlyKwh} kWh / mo @ $${workload.electricityKwhRate} / kWh`, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
          { service: "IT Hardware Maintenance & Engineering", rate: `$${monthlyMaintenance.toFixed(2)} / month per server node`, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
        ],

        // Itemized Bill of Materials (BOM)
        bom: [
          { item: `NVIDIA GeForce RTX 5090 (32GB GDDR7)`, type: "CapEx", qty: `${onPremOption.requiredGpuCount}x GPUs`, unitCost: `$${onPremOption.gpu.server_fitted_cost_usd.toLocaleString()}`, totalCost: onPremOption.capEx.gpuHardwareCost, refUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" },
          { item: `${onPremOption.platform.name} (${onPremOption.platform.cpu}, ${onPremOption.platform.ram})`, type: "CapEx", qty: "1x Server Chassis", unitCost: `$${onPremOption.platform.base_hardware_cost_usd.toLocaleString()}`, totalCost: onPremOption.platform.base_hardware_cost_usd, refUrl: onPremOption.platform.pricing_ref_url || "https://www.pugetsystems.com/solutions/ai-and-hpc-workstations/" },
          { item: `vLLM / Ollama Engine + ${onPremOption.model.name}`, type: "Software", qty: "Open Source", unitCost: "$0.00", totalCost: 0, refUrl: onPremOption.model.ref_url || "https://huggingface.co/Qwen/Qwen2.5-32B-Instruct" },
          { item: `Electrical Power (${onPremOption.opEx.monthlyKwh} kWh / mo)`, type: "OpEx", qty: `${onPremOption.opEx.monthlyKwh} kWh`, unitCost: `$${workload.electricityKwhRate} / kWh`, totalCost: monthlyElectricity, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
          { item: `IT Engineer Server Maintenance Overhead`, type: "OpEx", qty: "1 Node", unitCost: `$${monthlyMaintenance.toFixed(2)} / mo`, totalCost: monthlyMaintenance, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
        ],

        // Step-by-Step Calculation Formula
        calculationFormula: {
          step1: `Initial Upfront CapEx = (${onPremOption.requiredGpuCount}x GPUs @ $${onPremOption.gpu.server_fitted_cost_usd}) + Chassis ($${onPremOption.platform.base_hardware_cost_usd}) = $${initialCapEx.toLocaleString()}`,
          step2: `Monthly CapEx Amortization = $${initialCapEx.toLocaleString()} ÷ 36 Months = $${monthlyAmortization.toFixed(2)} / mo`,
          step3: `Monthly Electricity = ${onPremOption.opEx.monthlyKwh} kWh × $${workload.electricityKwhRate}/kWh = $${monthlyElectricity.toFixed(2)} / mo`,
          step4: `Monthly Maintenance = $${monthlyMaintenance.toFixed(2)} / mo`,
          step5: `Est. Monthly TCO = ($${initialCapEx.toLocaleString()} ÷ 36) + $${monthlyElectricity.toFixed(2)} + $${monthlyMaintenance.toFixed(2)} = $${Math.round(monthlyCost).toLocaleString()} / mo`,
          step6: `3-Year Total TCO = $${initialCapEx.toLocaleString()} CapEx + (($${monthlyElectricity.toFixed(2)} Power + $${monthlyMaintenance.toFixed(2)} Maint) × 36 Mos) = $${Math.round(threeYearTCO).toLocaleString()}`
        },

        components: [
          { name: "Compute Hardware", detail: `${onPremOption.requiredGpuCount}x NVIDIA RTX 5090 (64GB Unified GDDR7 VRAM)` },
          { name: "Base Server Platform", detail: `${onPremOption.platform.name} (${onPremOption.platform.cpu}, ${onPremOption.platform.ram})` },
          { name: "Inference Engine", detail: "vLLM / Ollama with Continuous Batching & PagedAttention" },
          { name: "Served Model", detail: `${onPremOption.model.name} (${onPremOption.model.recommended_quantization})` }
        ],
        pros: [
          "Fixed predictable cost: No monthly token billing surprises",
          "100% data privacy: Zero tokens or company secrets leave your building",
          "Rapid ROI: Saves thousands vs commercial cloud APIs within 5 months",
          "High VRAM (64GB): Easily runs 32B-72B models with large context windows"
        ],
        cons: [
          `Initial CapEx requirement of ~$${initialCapEx.toLocaleString()}`,
          "Requires in-house IT hardware administration and server room power"
        ],
        architectRationale: `For ${users} active users generating ${workload.monthlyTotalTokens.toLocaleString()} monthly tokens, commercial API bills quickly exceed $1,200-$3,500/month. A dedicated Dual RTX 5090 rig pays for itself in ~4-6 months while guaranteeing 100% data confidentiality.`
      };

    } else {
      // Large Enterprise (300+ users): Quad RTX 5090 Enterprise Rack Node
      const onPremOption = this.calc.calculateOnPremOption('qwen_2_5_72b', 'rtx_5090', workload);

      const initialCapEx = onPremOption.capEx.totalCapEx;
      const monthlyAmortization = onPremOption.monthlyAmortization;
      const monthlyElectricity = onPremOption.opEx.monthlyElectricityCost;
      const monthlyMaintenance = onPremOption.opEx.monthlyMaintenanceCost;
      const monthlyOpEx = monthlyElectricity + monthlyMaintenance;
      const monthlyCost = onPremOption.monthlyCost;
      const threeYearTCO = onPremOption.threeYearTCO;
      const oneYearTCO = onPremOption.oneYearTCO;

      rec1 = {
        rank: 1,
        title: "Quad RTX 5090 High-Density Enterprise AI Rack Node",
        category: "On-Premises Enterprise Cluster",
        badgeText: "🏆 #1 Flagship Performance & Massive TCO Savings",
        badgeClass: "badge-gold",
        initialCapEx,
        initialCapExRefUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
        monthlyOpEx,
        monthlyCost,
        oneYearTCO,
        threeYearTCO,
        latencyRating: "Ultra-Fast (Tensor Parallelism)",
        throughputTokensSec: onPremOption.systemThroughputTokensSec,
        privacyRating: "100% Air-Gapped / Banking & Defense Grade",
        devopsEffort: "Medium (Kubernetes / Ray Cluster Management)",

        serviceRates: [
          { service: "NVIDIA RTX 5090 32GB GDDR7 GPUs", rate: `4x @ $2,400.00 per fitted GPU ($9,600.00 CapEx)`, refUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" },
          { service: "Quad-GPU Enterprise 4U Server Platform", rate: `$6,500.00 base chassis platform (CapEx)`, refUrl: onPremOption.platform.pricing_ref_url || "https://www.supermicro.com/en/products/gpu" },
          { service: "Power & Electricity Rate", rate: `${onPremOption.opEx.monthlyKwh} kWh / mo @ $${workload.electricityKwhRate} / kWh`, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
          { service: "Enterprise IT SysAdmin Overhead", rate: `$${monthlyMaintenance.toFixed(2)} / month`, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
        ],

        bom: [
          { item: `NVIDIA GeForce RTX 5090 (32GB GDDR7)`, type: "CapEx", qty: `${onPremOption.requiredGpuCount}x GPUs`, unitCost: `$${onPremOption.gpu.server_fitted_cost_usd.toLocaleString()}`, totalCost: onPremOption.capEx.gpuHardwareCost, refUrl: onPremOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" },
          { item: `${onPremOption.platform.name}`, type: "CapEx", qty: "1x 4U Server Chassis", unitCost: `$${onPremOption.platform.base_hardware_cost_usd.toLocaleString()}`, totalCost: onPremOption.platform.base_hardware_cost_usd, refUrl: onPremOption.platform.pricing_ref_url || "https://www.supermicro.com/en/products/gpu" },
          { item: `vLLM Tensor Parallel Stack + ${onPremOption.model.name}`, type: "Software", qty: "Open Source", unitCost: "$0.00", totalCost: 0, refUrl: onPremOption.model.ref_url || "https://huggingface.co/Qwen/Qwen2.5-72B-Instruct" },
          { item: `Electrical Power (${onPremOption.opEx.monthlyKwh} kWh / mo)`, type: "OpEx", qty: `${onPremOption.opEx.monthlyKwh} kWh`, unitCost: `$${workload.electricityKwhRate} / kWh`, totalCost: monthlyElectricity, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
          { item: `Enterprise IT SysAdmin & Hardware Maintenance`, type: "OpEx", qty: "1 Cluster Node", unitCost: `$${monthlyMaintenance.toFixed(2)} / mo`, totalCost: monthlyMaintenance, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
        ],

        calculationFormula: {
          step1: `Initial Upfront CapEx = (4x GPUs @ $${onPremOption.gpu.server_fitted_cost_usd}) + Chassis ($${onPremOption.platform.base_hardware_cost_usd}) = $${initialCapEx.toLocaleString()}`,
          step2: `Monthly CapEx Amortization = $${initialCapEx.toLocaleString()} ÷ 36 Months = $${monthlyAmortization.toFixed(2)} / mo`,
          step3: `Monthly Electricity = ${onPremOption.opEx.monthlyKwh} kWh × $${workload.electricityKwhRate}/kWh = $${monthlyElectricity.toFixed(2)} / mo`,
          step4: `Monthly Maintenance = $${monthlyMaintenance.toFixed(2)} / mo`,
          step5: `Est. Monthly TCO = ($${initialCapEx.toLocaleString()} ÷ 36) + $${monthlyElectricity.toFixed(2)} + $${monthlyMaintenance.toFixed(2)} = $${Math.round(monthlyCost).toLocaleString()} / mo`,
          step6: `3-Year Total TCO = $${initialCapEx.toLocaleString()} CapEx + (($${monthlyElectricity.toFixed(2)} Power + $${monthlyMaintenance.toFixed(2)} Maint) × 36 Mos) = $${Math.round(threeYearTCO).toLocaleString()}`
        },

        components: [
          { name: "Compute Hardware", detail: `${onPremOption.requiredGpuCount}x NVIDIA RTX 5090 (128GB GDDR7 Unified VRAM)` },
          { name: "Chassis & Server Platform", detail: `${onPremOption.platform.name} (${onPremOption.platform.cpu}, ${onPremOption.platform.ram})` },
          { name: "Serving Architecture", detail: "vLLM with Tensor Parallelism (TP=4), OpenAI-compatible Endpoint" },
          { name: "Foundation Model", detail: `${onPremOption.model.name} / Kimi / MiniMax MoE` }
        ],
        pros: [
          "Enormous long-term savings: Slashes $15,000+/month from cloud token bills",
          "State-of-the-art 72B parameter reasoning intelligence running locally",
          "Handles 50+ concurrent streaming users with zero performance degradation",
          "Full custom fine-tuning and proprietary internal document indexing"
        ],
        cons: [
          `Substantial initial CapEx (~$${initialCapEx.toLocaleString()})`,
          "Requires dedicated server room with adequate 2.5kW power & cooling"
        ],
        architectRationale: `At enterprise scale (${users} users, ~${workload.totalMonthlyQueries.toLocaleString()} queries/month), cloud token meters become an unsustainable recurring expense. A 4x RTX 5090 server delivers frontier-grade 72B intelligence at a fraction of cloud cost.`
      };
    }

    // =========================================================================
    // RECOMMENDATION #2: MAXIMUM SECURITY & 100% AIR-GAPPED PRIVACY
    // =========================================================================
    const airGappedModelId = users > 200 ? 'qwen_2_5_72b' : (users > 50 ? 'qwen_2_5_32b' : 'gemma_2_27b');
    const airGappedGpuId = users > 200 ? 'rtx_5090' : 'rtx_4090';
    const onPremSecurityOption = this.calc.calculateOnPremOption(airGappedModelId, airGappedGpuId, workload);

    const initialCapExSec = onPremSecurityOption.capEx.totalCapEx;
    const monthlyAmortSec = onPremSecurityOption.monthlyAmortization;
    const monthlyElecSec = onPremSecurityOption.opEx.monthlyElectricityCost;
    const monthlyMaintSec = onPremSecurityOption.opEx.monthlyMaintenanceCost;
    const monthlyOpExSec = monthlyElecSec + monthlyMaintSec;
    const monthlyCostSec = onPremSecurityOption.monthlyCost;
    const threeYearTCOSec = onPremSecurityOption.threeYearTCO;
    const oneYearTCOSec = onPremSecurityOption.oneYearTCO;

    rec2 = {
      rank: 2,
      title: "100% Air-Gapped Sovereign AI Enclave",
      category: "Dedicated On-Premises Security Enclave",
      badgeText: "🔒 #2 100% Data Sovereignty & Zero Egress",
      badgeClass: "badge-purple",
      initialCapEx: initialCapExSec,
      initialCapExRefUrl: onPremSecurityOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
      monthlyOpEx: monthlyOpExSec,
      monthlyCost: monthlyCostSec,
      oneYearTCO: oneYearTCOSec,
      threeYearTCO: threeYearTCOSec,
      latencyRating: "Sub-350ms LAN Latency",
      throughputTokensSec: onPremSecurityOption.systemThroughputTokensSec,
      privacyRating: "100% Air-Gapped (Zero Inbound/Outbound Telemetry)",
      devopsEffort: "Medium (Physical Server & Network Segmentation)",

      serviceRates: [
        { service: `NVIDIA ${onPremSecurityOption.gpu.name} (${onPremSecurityOption.gpu.vram_gb}GB)`, rate: `${onPremSecurityOption.requiredGpuCount}x @ $${onPremSecurityOption.gpu.server_fitted_cost_usd.toLocaleString()} ea (CapEx)`, refUrl: onPremSecurityOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/" },
        { service: `${onPremSecurityOption.platform.name}`, rate: `$${onPremSecurityOption.platform.base_hardware_cost_usd.toLocaleString()} platform cost (CapEx)`, refUrl: onPremSecurityOption.platform.pricing_ref_url || "https://www.pugetsystems.com/solutions/ai-and-hpc-workstations/" },
        { service: "Power & Electricity Rate", rate: `${onPremSecurityOption.opEx.monthlyKwh} kWh / mo @ $${workload.electricityKwhRate} / kWh`, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
        { service: "Air-Gapped Infrastructure Maintenance", rate: `$${monthlyMaintSec.toFixed(2)} / month`, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
      ],

      bom: [
        { item: `NVIDIA ${onPremSecurityOption.gpu.name} (${onPremSecurityOption.gpu.vram_gb}GB VRAM)`, type: "CapEx", qty: `${onPremSecurityOption.requiredGpuCount}x GPUs`, unitCost: `$${onPremSecurityOption.gpu.server_fitted_cost_usd.toLocaleString()}`, totalCost: onPremSecurityOption.capEx.gpuHardwareCost, refUrl: onPremSecurityOption.gpu.pricing_ref_url || "https://www.nvidia.com/en-us/geforce/graphics-cards/" },
        { item: `${onPremSecurityOption.platform.name}`, type: "CapEx", qty: "1x Server Chassis", unitCost: `$${onPremSecurityOption.platform.base_hardware_cost_usd.toLocaleString()}`, totalCost: onPremSecurityOption.platform.base_hardware_cost_usd, refUrl: onPremSecurityOption.platform.pricing_ref_url || "https://www.pugetsystems.com/solutions/ai-and-hpc-workstations/" },
        { item: `Ollama Enclave + ${onPremSecurityOption.model.name}`, type: "Software", qty: "Air-Gapped", unitCost: "$0.00", totalCost: 0, refUrl: "https://ollama.com/" },
        { item: `Power Draw (${onPremSecurityOption.opEx.monthlyKwh} kWh / mo)`, type: "OpEx", qty: `${onPremSecurityOption.opEx.monthlyKwh} kWh`, unitCost: `$${workload.electricityKwhRate} / kWh`, totalCost: monthlyElecSec, refUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
        { item: `Secured Air-Gapped SysAdmin Overhead`, type: "OpEx", qty: "1 Enclave", unitCost: `$${monthlyMaintSec.toFixed(2)} / mo`, totalCost: monthlyMaintSec, refUrl: "https://www.glassdoor.com/Salaries/systems-administrator-salary-SRCH_KO0,21.htm" }
      ],

      calculationFormula: {
        step1: `Initial Upfront CapEx = (${onPremSecurityOption.requiredGpuCount}x ${onPremSecurityOption.gpu.name} @ $${onPremSecurityOption.gpu.server_fitted_cost_usd}) + Chassis ($${onPremSecurityOption.platform.base_hardware_cost_usd}) = $${initialCapExSec.toLocaleString()}`,
        step2: `Monthly CapEx Amortization = $${initialCapExSec.toLocaleString()} ÷ 36 Months = $${monthlyAmortSec.toFixed(2)} / mo`,
        step3: `Monthly Electricity = ${onPremSecurityOption.opEx.monthlyKwh} kWh × $${workload.electricityKwhRate}/kWh = $${monthlyElecSec.toFixed(2)} / mo`,
        step4: `Monthly Maintenance = $${monthlyMaintSec.toFixed(2)} / mo`,
        step5: `Est. Monthly TCO = ($${initialCapExSec.toLocaleString()} ÷ 36) + $${monthlyElecSec.toFixed(2)} + $${monthlyMaintSec.toFixed(2)} = $${Math.round(monthlyCostSec).toLocaleString()} / mo`,
        step6: `3-Year Total TCO = $${initialCapExSec.toLocaleString()} CapEx + (($${monthlyElecSec.toFixed(2)} Power + $${monthlyMaintSec.toFixed(2)} Maint) × 36 Mos) = $${Math.round(threeYearTCOSec).toLocaleString()}`
      },

      components: [
        { name: "Hardware Engine", detail: `${onPremSecurityOption.requiredGpuCount}x NVIDIA ${onPremSecurityOption.gpu.name} (${onPremSecurityOption.totalVramProvidedGb}GB Total VRAM)` },
        { name: "Local LLM Serving", detail: `Ollama / vLLM running ${onPremSecurityOption.model.name}` },
        { name: "Security Architecture", detail: "Isolated VLAN, On-Prem Vector DB (Qdrant/Milvus), Hardware Security Module (HSM)" },
        { name: "Identity & RBAC", detail: "Local Active Directory / LDAP with strict department-level document ACLs" }
      ],
      pros: [
        "Zero data retention or surveillance risk: Fully compliant with HIPAA, GDPR, ISO 27001",
        "Immune to external vendor API outages, price hikes, or policy changes",
        "Consistent sub-second latency across local high-speed corporate LAN (10GbE)",
        "Zero monthly token billing overage risk"
      ],
      cons: [
        "Requires physical server installation, UPS backup, and periodic maintenance",
        "Model upgrades require downloading new weights onto internal servers"
      ],
      architectRationale: "For enterprises handling sensitive proprietary source code, confidential legal contracts, patient medical records, or financial disclosures, this air-gapped on-premise enclave ensures absolute legal and data protection."
    };

    // =========================================================================
    // RECOMMENDATION #3: ZERO-DEVOPS / INSTANT ELASTIC SCALABILITY
    // =========================================================================
    if (users > 500) {
      // Large Scale Cloud Dedicated GPU: RunPod / AWS Dedicated
      const cloudOption = this.calc.calculateCloudDeployOption('runpod', 2, workload); // A100 80GB
      
      const initialCapExCloud = 0;
      const monthlyComputeCloud = cloudOption.monthlyComputeCost;
      const monthlyStorageCloud = cloudOption.storageCost;
      const monthlyEgressCloud = cloudOption.egressCost;
      const monthlyDevOpsCloud = cloudOption.devopsCost;
      const monthlyOpExCloud = monthlyComputeCloud + monthlyStorageCloud + monthlyEgressCloud + monthlyDevOpsCloud;
      const monthlyCostCloud = monthlyOpExCloud;
      const threeYearTCOCloud = monthlyCostCloud * 36;
      const oneYearTCOCloud = monthlyCostCloud * 12;

      rec3 = {
        rank: 3,
        title: "Managed Cloud GPU Cluster (RunPod / AWS Dedicated)",
        category: "Cloud Dedicated GPU Sizing",
        badgeText: "⚡ #3 High-Elasticity Cloud Dedicated",
        badgeClass: "badge-cyan",
        initialCapEx: initialCapExCloud,
        initialCapExRefUrl: cloudOption.instance.pricing_ref_url || cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing",
        monthlyOpEx: monthlyOpExCloud,
        monthlyCost: monthlyCostCloud,
        oneYearTCO: oneYearTCOCloud,
        threeYearTCO: threeYearTCOCloud,
        latencyRating: "~300ms - 450ms",
        throughputTokensSec: 180,
        privacyRating: "Enterprise Cloud VPC (SOC2 / HIPAA Compliant)",
        devopsEffort: "Low-Medium (Managed Cloud Infrastructure)",

        serviceRates: [
          { service: `${cloudOption.instance.name}`, rate: `$1.89 per hour per GPU instance node`, refUrl: cloudOption.instance.pricing_ref_url || cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { service: "Enterprise Network Storage Array", rate: `$40.00 / month per node`, refUrl: cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { service: "Cloud Bandwidth Egress Rate", rate: `$0.01 per GB output data`, refUrl: cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { service: "Managed Cloud Infrastructure Ops", rate: `$250.00 / month`, refUrl: "https://www.glassdoor.com/Salaries/cloud-engineer-salary-SRCH_KO0,14.htm" }
        ],

        bom: [
          { item: `${cloudOption.instance.name}`, type: "OpEx", qty: `${cloudOption.requiredInstances}x Nodes (730 hrs/mo)`, unitCost: "$1.89 / hr", totalCost: monthlyComputeCloud, refUrl: cloudOption.instance.pricing_ref_url || cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { item: "High-Performance NVMe Cloud Storage Array", type: "OpEx", qty: `${cloudOption.requiredInstances}x Disks`, unitCost: "$40.00 / mo", totalCost: monthlyStorageCloud, refUrl: cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { item: "Network Egress Data Bandwidth", type: "OpEx", qty: "Output Traffic", unitCost: "$0.01 / GB", totalCost: monthlyEgressCloud, refUrl: cloudOption.provider.pricing_ref_url || "https://www.runpod.io/pricing" },
          { item: "Managed Cloud Container DevOps", type: "OpEx", qty: "1 Cluster", unitCost: "$250.00 / mo", totalCost: monthlyDevOpsCloud, refUrl: "https://www.glassdoor.com/Salaries/cloud-engineer-salary-SRCH_KO0,14.htm" }
        ],

        calculationFormula: {
          step1: `Initial Upfront CapEx = $0 (Zero Hardware Purchase)`,
          step2: `Monthly Compute = ${cloudOption.requiredInstances}x Nodes × 730 hrs × $1.89/hr = $${monthlyComputeCloud.toFixed(2)} / mo`,
          step3: `Monthly Storage & Egress = $${monthlyStorageCloud.toFixed(2)} Storage + $${monthlyEgressCloud.toFixed(2)} Egress = $${(monthlyStorageCloud + monthlyEgressCloud).toFixed(2)} / mo`,
          step4: `Monthly DevOps Ops = $${monthlyDevOpsCloud.toFixed(2)} / mo`,
          step5: `Est. Monthly TCO = ($0 CapEx ÷ 36) + $${monthlyComputeCloud.toFixed(2)} + $${(monthlyStorageCloud + monthlyEgressCloud).toFixed(2)} + $${monthlyDevOpsCloud.toFixed(2)} = $${Math.round(monthlyCostCloud).toLocaleString()} / mo`,
          step6: `3-Year Total TCO = $0 CapEx + ($${Math.round(monthlyCostCloud).toLocaleString()} / mo × 36 Months) = $${Math.round(threeYearTCOCloud).toLocaleString()}`
        },

        components: [
          { name: "Cloud GPU Instance", detail: `${cloudOption.requiredInstances}x RunPod Secure Cloud / AWS A100 (80GB SXM4)` },
          { name: "Model Stack", detail: "vLLM Container on Kubernetes with Auto-Scaling" },
          { name: "Network Infrastructure", detail: "Encrypted VPC Tunnel with Direct Connect / Direct Peering" }
        ],
        pros: [
          "Zero physical hardware to buy, rack, or cool in your office",
          "Rapid deployment: Live in under 30 minutes with Docker templates",
          "Easy scaling up or down with dynamic enterprise demand",
          "High reliability with 99.9% cloud datacenter uptime guarantee"
        ],
        cons: [
          "Higher recurring monthly OpEx over a 3-year timeline compared to on-prem hardware",
          "Egress bandwidth costs apply for massive data ingestion"
        ],
        architectRationale: "Provides dedicated enterprise GPU power without managing physical server rooms, delivering instant elastic capacity with enterprise security guarantees."
      };
    } else {
      // Small to Mid Scale: Commercial Managed Frontier API Gateway (Claude 3.5 Sonnet / ChatGPT)
      const apiOption = this.calc.calculateCloudLLMOption('claude_anthropic', 'claude_3_5_sonnet', workload);

      const initialCapExApi = 0;
      const monthlyPromptCost = apiOption.promptCost;
      const monthlyCompletionCost = apiOption.completionCost;
      const monthlyMaintenanceApi = apiOption.apiMaintenanceCost;
      const monthlyOpExApi = monthlyPromptCost + monthlyCompletionCost + monthlyMaintenanceApi;
      const monthlyCostApi = monthlyOpExApi;
      const threeYearTCOApi = monthlyCostApi * 36;
      const oneYearTCOApi = monthlyCostApi * 12;

      rec3 = {
        rank: 3,
        title: "Frontier Managed API Gateway (Claude 3.5 Sonnet / GPT-4o)",
        category: "Managed Frontier LLM API",
        badgeText: "🧠 #3 State-of-the-Art Frontier Intelligence",
        badgeClass: "badge-cyan",
        initialCapEx: initialCapExApi,
        initialCapExRefUrl: apiOption.provider.pricing_ref_url || "https://www.anthropic.com/pricing",
        monthlyOpEx: monthlyOpExApi,
        monthlyCost: monthlyCostApi,
        oneYearTCO: oneYearTCOApi,
        threeYearTCO: threeYearTCOApi,
        latencyRating: "~450ms - 900ms",
        throughputTokensSec: 120,
        privacyRating: "Commercial API Terms (Zero Training on Customer Data)",
        devopsEffort: "Zero (Pure REST API Integration)",

        serviceRates: [
          { service: `${apiOption.model.name} Input Prompt Tokens`, rate: `$${apiOption.model.input_cost_per_1m.toFixed(2)} per 1,000,000 tokens`, refUrl: apiOption.model.pricing_ref_url || apiOption.provider.pricing_ref_url || "https://www.anthropic.com/pricing" },
          { service: `${apiOption.model.name} Output Completion Tokens`, rate: `$${apiOption.model.output_cost_per_1m.toFixed(2)} per 1,000,000 tokens`, refUrl: apiOption.model.pricing_ref_url || apiOption.provider.pricing_ref_url || "https://www.anthropic.com/pricing" },
          { service: "API Gateway Integration & Proxy Upkeep", rate: `$${monthlyMaintenanceApi.toFixed(2)} / month flat`, refUrl: "https://litellm.ai/" }
        ],

        bom: [
          { item: `Input Prompt Token Demand`, type: "OpEx", qty: `${(workload.monthlyPromptTokens / 1000000).toFixed(1)}M tokens / mo`, unitCost: `$${apiOption.model.input_cost_per_1m.toFixed(2)} / 1M`, totalCost: monthlyPromptCost, refUrl: apiOption.model.pricing_ref_url || apiOption.provider.pricing_ref_url || "https://www.anthropic.com/pricing" },
          { item: `Output Completion Token Demand`, type: "OpEx", qty: `${(workload.monthlyCompletionTokens / 1000000).toFixed(1)}M tokens / mo`, unitCost: `$${apiOption.model.output_cost_per_1m.toFixed(2)} / 1M`, totalCost: monthlyCompletionCost, refUrl: apiOption.model.pricing_ref_url || apiOption.provider.pricing_ref_url || "https://www.anthropic.com/pricing" },
          { item: `API Key Security & Integration Maintenance`, type: "OpEx", qty: "1 Integration", unitCost: `$${monthlyMaintenanceApi.toFixed(2)} / mo`, totalCost: monthlyMaintenanceApi, refUrl: "https://litellm.ai/" }
        ],

        calculationFormula: {
          step1: `Initial Upfront CapEx = $0 (Zero Hardware Purchase)`,
          step2: `Monthly Prompt Cost = (${(workload.monthlyPromptTokens / 1000000).toFixed(1)}M tokens × $${apiOption.model.input_cost_per_1m.toFixed(2)}/1M) = $${monthlyPromptCost.toFixed(2)} / mo`,
          step3: `Monthly Completion Cost = (${(workload.monthlyCompletionTokens / 1000000).toFixed(1)}M tokens × $${apiOption.model.output_cost_per_1m.toFixed(2)}/1M) = $${monthlyCompletionCost.toFixed(2)} / mo`,
          step4: `Monthly Maintenance = $${monthlyMaintenanceApi.toFixed(2)} / mo`,
          step5: `Est. Monthly TCO = ($0 CapEx ÷ 36) + $${monthlyPromptCost.toFixed(2)} + $${monthlyCompletionCost.toFixed(2)} + $${monthlyMaintenanceApi.toFixed(2)} = $${Math.round(monthlyCostApi).toLocaleString()} / mo`,
          step6: `3-Year Total TCO = $0 CapEx + ($${Math.round(monthlyCostApi).toLocaleString()} / mo × 36 Months) = $${Math.round(threeYearTCOApi).toLocaleString()}`
        },

        components: [
          { name: "Frontier Model API", detail: `${apiOption.provider.provider_name} - ${apiOption.model.name}` },
          { name: "Context Window", detail: `${apiOption.model.context_window.toLocaleString()} tokens` },
          { name: "Integration Layer", detail: "LiteLLM Proxy with Rate Limiting, Prompt Caching, & Audit Logging" }
        ],
        pros: [
          "State-of-the-art reasoning, coding, and multilingual performance",
          "Instant access to model updates without buying new hardware",
          "Zero infrastructure maintenance or server monitoring needed",
          "Massive 200k+ token context window for huge document synthesis"
        ],
        cons: [
          "Strict per-token pricing: Costs grow directly with user query volume",
          "Subject to external API latency variations and rate limit ceilings"
        ],
        architectRationale: "For teams prioritizing maximum reasoning quality and fast time-to-market over fixed infrastructure costs, commercial frontier APIs deliver unmatched intelligence with zero setup delay."
      };
    }

    return [rec1, rec2, rec3];
  }
}

// Export for vanilla JS window environment
if (typeof window !== 'undefined') {
  window.AIArchitectureRecommender = AIArchitectureRecommender;
}
