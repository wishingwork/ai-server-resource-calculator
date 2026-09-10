/**
 * Enterprise AI Solution Architect Recommendation Engine
 * Evaluates company scale, active users, data sensitivity, latency, and TCO
 * to generate and rank the Top 3 Recommended Architectures.
 */

class AIArchitectureRecommender {
  constructor(calculator) {
    this.calc = calculator;
  }

  /**
   * Generates the Top 3 recommended enterprise architectures
   */
  getTop3Recommendations(workload, constraints = {}) {
    const users = workload.activeUsers;
    const privacy = constraints.privacyLevel || 'strict'; // 'standard', 'strict', 'air_gapped'
    const latencyPriority = constraints.latencyPriority || 'balanced'; // 'subsecond', 'balanced', 'throughput'

    let rec1, rec2, rec3;

    // =========================================================================
    // RECOMMENDATION #1: TOP OVERALL STRATEGIC VALUE & BALANCED TCO
    // =========================================================================
    if (users <= 25) {
      // Small Teams / Startups (<25 users): Serverless Edge or Smart Tiered API
      const cloudflareOption = this.calc.calculateCloudDeployOption('cloudflare', 0, workload);
      const apiOption = this.calc.calculateCloudLLMOption('chatgpt_openai', 'gpt_4o_mini', workload);
      
      rec1 = {
        rank: 1,
        title: "Hybrid Serverless & Smart API Gateway",
        category: "Cloud Serverless & API",
        badgeText: "🏆 #1 Best ROI for Small Teams",
        badgeClass: "badge-gold",
        monthlyCost: (cloudflareOption.monthlyCost + (apiOption.monthlyCost * 0.4)),
        oneYearTCO: (cloudflareOption.oneYearTCO + (apiOption.oneYearTCO * 0.4)),
        threeYearTCO: (cloudflareOption.threeYearTCO + (apiOption.threeYearTCO * 0.4)),
        latencyRating: "< 350ms",
        throughputTokensSec: 150,
        privacyRating: "Standard Business Isolation (Zero Data Retention)",
        devopsEffort: "Near Zero (No Hardware / No Server Maintenance)",
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
        architectRationale: `With ${users} active users generating ~${workload.totalDailyQueries.toLocaleString()} daily queries, dedicated 24/7 on-premise hardware ($3,000-$5,000 CapEx) has high idle waste. A hybrid serverless approach provides immediate enterprise agility at just $${Math.round(cloudflareOption.monthlyCost + (apiOption.monthlyCost * 0.4))}/mo.`
      };
    } else if (users <= 300) {
      // Mid-Market Teams (25-300 users): On-Premises Dual RTX 5090 / 4090 Workstation Rig
      const onPremOption = this.calc.calculateOnPremOption('qwen_2_5_32b', 'rtx_5090', workload);
      
      rec1 = {
        rank: 1,
        title: "Dual RTX 5090 On-Premise Workstation Node",
        category: "On-Premises Dedicated Server",
        badgeText: "🏆 #1 Best Enterprise Value & Payback (< 5 Mo)",
        badgeClass: "badge-gold",
        monthlyCost: onPremOption.monthlyCost,
        oneYearTCO: onPremOption.oneYearTCO,
        threeYearTCO: onPremOption.threeYearTCO,
        latencyRating: "Sub-400ms (High Local Throughput)",
        throughputTokensSec: onPremOption.systemThroughputTokensSec,
        privacyRating: "100% Confidential (Air-Gapped Local LAN)",
        devopsEffort: "Low (Pre-configured Ollama / vLLM Container)",
        components: [
          { name: "Compute Hardware", detail: `${onPremOption.requiredGpuCount}x NVIDIA RTX 5090 (32GB GDDR7 / 1.79 TB/s)` },
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
          `Initial CapEx requirement of ~$${onPremOption.capEx.totalCapEx.toLocaleString()}`,
          "Requires in-house IT hardware administration and server room power"
        ],
        architectRationale: `For ${users} active users generating ${workload.monthlyTotalTokens.toLocaleString()} monthly tokens, commercial API bills quickly exceed $1,200-$3,500/month. A dedicated Dual RTX 5090 rig pays for itself in ~4-6 months while guaranteeing 100% data confidentiality.`
      };
    } else {
      // Large Enterprise (300+ users): Quad RTX 5090 / Octa Enterprise Rackmount Cluster
      const onPremOption = this.calc.calculateOnPremOption('qwen_2_5_72b', 'rtx_5090', workload);
      
      rec1 = {
        rank: 1,
        title: "Quad RTX 5090 High-Density Enterprise AI Rack Node",
        category: "On-Premises Enterprise Cluster",
        badgeText: "🏆 #1 Flagship Performance & Massive TCO Savings",
        badgeClass: "badge-gold",
        monthlyCost: onPremOption.monthlyCost,
        oneYearTCO: onPremOption.oneYearTCO,
        threeYearTCO: onPremOption.threeYearTCO,
        latencyRating: "Ultra-Fast (Tensor Parallelism)",
        throughputTokensSec: onPremOption.systemThroughputTokensSec,
        privacyRating: "100% Air-Gapped / Banking & Defense Grade",
        devopsEffort: "Medium (Kubernetes / Ray Cluster Management)",
        components: [
          { name: "Compute Hardware", detail: `${onPremOption.requiredGpuCount}x NVIDIA RTX 5090 (128GB GDDR7 Unified VRAM)` },
          { name: "Chassis & Server Platform", detail: `${onPremOption.platform.name} (${onPremOption.platform.cpu}, ${onPremOption.platform.ram}, Redundant Titanium PSU)` },
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
          `Substantial initial CapEx (~$${onPremOption.capEx.totalCapEx.toLocaleString()})`,
          "Requires dedicated server room with adequate 2.5kW power & cooling"
        ],
        architectRationale: `At enterprise scale (${users} users, ~${workload.totalMonthlyQueries.toLocaleString()} queries/month), cloud token meters become an unsustainable recurring expense. A 4x RTX 5090 server delivers frontier-grade 72B intelligence at a fraction of cloud cost with 3-year TCO savings exceeding $150,000.`
      };
    }

    // =========================================================================
    // RECOMMENDATION #2: MAXIMUM SECURITY & 100% AIR-GAPPED PRIVACY
    // =========================================================================
    const airGappedModelId = users > 200 ? 'qwen_2_5_72b' : (users > 50 ? 'qwen_2_5_32b' : 'gemma_2_27b');
    const airGappedGpuId = users > 200 ? 'rtx_5090' : 'rtx_4090';
    const onPremSecurityOption = this.calc.calculateOnPremOption(airGappedModelId, airGappedGpuId, workload);

    rec2 = {
      rank: 2,
      title: "100% Air-Gapped Sovereign AI Enclave",
      category: "Dedicated On-Premises Security Enclave",
      badgeText: "🔒 #2 100% Data Sovereignty & Zero Egress",
      badgeClass: "badge-purple",
      monthlyCost: onPremSecurityOption.monthlyCost,
      oneYearTCO: onPremSecurityOption.oneYearTCO,
      threeYearTCO: onPremSecurityOption.threeYearTCO,
      latencyRating: "Sub-350ms LAN Latency",
      throughputTokensSec: onPremSecurityOption.systemThroughputTokensSec,
      privacyRating: "100% Air-Gapped (Zero Inbound/Outbound Telemetry)",
      devopsEffort: "Medium (Physical Server & Network Segmentation)",
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
      // Large Scale Cloud: RunPod Secure Cloud or AWS Dedicated GPU
      const cloudOption = this.calc.calculateCloudDeployOption('runpod', 2, workload); // A100 80GB
      
      rec3 = {
        rank: 3,
        title: "Managed Cloud GPU Cluster (RunPod / AWS Dedicated)",
        category: "Cloud Dedicated GPU Sizing",
        badgeText: "⚡ #3 High-Elasticity Cloud Dedicated",
        badgeClass: "badge-cyan",
        monthlyCost: cloudOption.monthlyCost,
        oneYearTCO: cloudOption.oneYearTCO,
        threeYearTCO: cloudOption.threeYearTCO,
        latencyRating: "~300ms - 450ms",
        throughputTokensSec: 180,
        privacyRating: "Enterprise Cloud VPC (SOC2 / HIPAA Compliant)",
        devopsEffort: "Low-Medium (Managed Cloud Infrastructure)",
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
      // Small to Mid Scale: Managed Frontier API Gateway (ChatGPT GPT-4o / Claude 3.5 Sonnet)
      const apiOption = this.calc.calculateCloudLLMOption('claude_anthropic', 'claude_3_5_sonnet', workload);
      
      rec3 = {
        rank: 3,
        title: "Frontier Managed API Gateway (Claude 3.5 Sonnet / GPT-4o)",
        category: "Managed Frontier LLM API",
        badgeText: "🧠 #3 State-of-the-Art Frontier Intelligence",
        badgeClass: "badge-cyan",
        monthlyCost: apiOption.monthlyCost,
        oneYearTCO: apiOption.oneYearTCO,
        threeYearTCO: apiOption.threeYearTCO,
        latencyRating: "~450ms - 900ms",
        throughputTokensSec: 120,
        privacyRating: "Commercial API Terms (Zero Training on Customer Data)",
        devopsEffort: "Zero (Pure REST API Integration)",
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
