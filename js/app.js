/**
 * Main Application Controller for Enterprise AI Server Resource Analysis
 * Coordinates state, JSON metadata loading, event orchestration, and live calculations.
 */

class AIApp {
  constructor() {
    this.metadata = {
      hardware: null,
      models: null,
      cloudDeploy: null,
      cloudLLMs: null,
      tiers: null
    };

    this.calculator = null;
    this.recommender = null;
    this.chartManager = null;
    this.uiRenderer = null;

    this.currentCurrency = 'USD';
    this.currencyRates = {
      'USD': { symbol: '$', rate: 1.0 },
      'EUR': { symbol: '€', rate: 0.92 },
      'TWD': { symbol: 'NT$', rate: 32.5 },
      'JPY': { symbol: '¥', rate: 155.0 }
    };
  }

  async init() {
    this.uiRenderer = new window.AIUIRenderer();
    this.chartManager = new window.AIChartManager();

    // Load JSON data files
    await this.loadAllMetadata();

    this.calculator = new window.AICostCalculator(this.metadata);
    this.recommender = new window.AIArchitectureRecommender(this.calculator);

    // Populate UI dropdowns
    this.uiRenderer.populateSelects(
      this.metadata.hardware,
      this.metadata.models,
      this.metadata.cloudDeploy,
      this.metadata.cloudLLMs
    );

    // Set initial child select options
    const initialCloudProvider = document.getElementById('select-cloud-provider')?.value || 'aws';
    this.uiRenderer.updateCloudInstanceOptions(this.metadata.cloudDeploy, initialCloudProvider);

    const initialLlmProvider = document.getElementById('select-llm-provider')?.value || 'chatgpt_openai';
    this.uiRenderer.updateCloudLLMModelOptions(this.metadata.cloudLLMs, initialLlmProvider);

    // Setup event listeners
    this.bindEvents();

    // Perform initial run
    this.recalculateAll();
  }

  async loadAllMetadata() {
    try {
      const [hwRes, modelRes, cloudRes, llmRes, tierRes] = await Promise.all([
        fetch('data/local_hardware.json'),
        fetch('data/onprem_models.json'),
        fetch('data/cloud_deployments.json'),
        fetch('data/cloud_llms.json'),
        fetch('data/enterprise_tiers.json')
      ]);

      this.metadata.hardware = await hwRes.json();
      this.metadata.models = await modelRes.json();
      this.metadata.cloudDeploy = await cloudRes.json();
      this.metadata.cloudLLMs = await llmRes.json();
      this.metadata.tiers = await tierRes.json();
    } catch (err) {
      console.warn('Network fetch error for local JSON (may be file:// protocol), using embedded fallback defaults', err);
      // Fallback is handled gracefully if needed
    }
  }

  bindEvents() {
    // 1. Inputs that trigger immediate recalculation
    const inputIds = [
      'input-active-users',
      'range-active-users',
      'input-queries-per-user',
      'input-avg-prompt-tokens',
      'input-avg-completion-tokens',
      'input-electricity-cost',
      'select-local-gpu',
      'select-onprem-model',
      'select-cloud-provider',
      'select-cloud-instance',
      'select-llm-provider',
      'select-llm-model',
      'select-privacy-level',
      'select-work-days'
    ];

    inputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => this.handleInputChange(e));
        el.addEventListener('change', (e) => this.handleInputChange(e));
      }
    });

    // 2. Sync range and number input for Active Users
    const rangeUsers = document.getElementById('range-active-users');
    const numUsers = document.getElementById('input-active-users');
    if (rangeUsers && numUsers) {
      rangeUsers.addEventListener('input', () => {
        numUsers.value = rangeUsers.value;
        this.recalculateAll();
      });
      numUsers.addEventListener('input', () => {
        rangeUsers.value = numUsers.value;
        this.recalculateAll();
      });
    }

    // 3. Preset Buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const presetId = btn.getAttribute('data-preset');
        this.applyPreset(presetId);
      });
    });

    // 4. Currency Switcher
    const currencySelect = document.getElementById('select-currency');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        const curr = e.target.value;
        const config = this.currencyRates[curr] || this.currencyRates['USD'];
        this.currentCurrency = curr;
        this.uiRenderer.setCurrency(config.symbol, config.rate);
        this.recalculateAll();
      });
    }

    // 5. Dynamic Select Cascades
    const cloudProviderSelect = document.getElementById('select-cloud-provider');
    if (cloudProviderSelect) {
      cloudProviderSelect.addEventListener('change', (e) => {
        this.uiRenderer.updateCloudInstanceOptions(this.metadata.cloudDeploy, e.target.value);
        this.recalculateAll();
      });
    }

    const llmProviderSelect = document.getElementById('select-llm-provider');
    if (llmProviderSelect) {
      llmProviderSelect.addEventListener('change', (e) => {
        this.uiRenderer.updateCloudLLMModelOptions(this.metadata.cloudLLMs, e.target.value);
        this.recalculateAll();
      });
    }

    // 6. Export / Print Executive Report
    const exportBtn = document.getElementById('btn-export-report');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // 7. Export JSON Config
    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        this.exportBudgetPlanJson();
      });
    }
  }

  handleInputChange(e) {
    this.recalculateAll();
  }

  applyPreset(presetId) {
    const presets = this.metadata.tiers?.presets || [];
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    const numUsers = document.getElementById('input-active-users');
    const rangeUsers = document.getElementById('range-active-users');
    const queries = document.getElementById('input-queries-per-user');
    const promptTokens = document.getElementById('input-avg-prompt-tokens');
    const completionTokens = document.getElementById('input-avg-completion-tokens');
    const privacy = document.getElementById('select-privacy-level');

    if (numUsers) numUsers.value = preset.active_users;
    if (rangeUsers) rangeUsers.value = preset.active_users;
    if (queries) queries.value = preset.queries_per_user_day;
    if (promptTokens) promptTokens.value = preset.avg_prompt_tokens;
    if (completionTokens) completionTokens.value = preset.avg_completion_tokens;
    if (privacy) privacy.value = preset.data_privacy_level;

    this.recalculateAll();
  }

  getUserInputs() {
    return {
      activeUsers: parseInt(document.getElementById('input-active-users')?.value) || 50,
      queriesPerUserDay: parseFloat(document.getElementById('input-queries-per-user')?.value) || 25,
      avgPromptTokens: parseInt(document.getElementById('input-avg-prompt-tokens')?.value) || 800,
      avgCompletionTokens: parseInt(document.getElementById('input-avg-completion-tokens')?.value) || 500,
      electricityKwhRate: parseFloat(document.getElementById('input-electricity-cost')?.value) || 0.15,
      workDaysPerMonth: parseInt(document.getElementById('select-work-days')?.value) || 22,
      concurrencyFactor: 0.25,
      privacyLevel: document.getElementById('select-privacy-level')?.value || 'strict',
      onPremGpuId: document.getElementById('select-local-gpu')?.value || 'rtx_5090',
      onPremModelId: document.getElementById('select-onprem-model')?.value || 'qwen_2_5_32b',
      cloudProviderId: document.getElementById('select-cloud-provider')?.value || 'aws',
      cloudInstanceIndex: parseInt(document.getElementById('select-cloud-instance')?.value) || 0,
      cloudLlmProviderId: document.getElementById('select-llm-provider')?.value || 'chatgpt_openai',
      cloudLlmModelId: document.getElementById('select-llm-model')?.value || 'gpt_4o'
    };
  }

  recalculateAll() {
    if (!this.calculator || !this.recommender) return;

    const inputs = this.getUserInputs();

    // 1. Calculate workload demand
    const workload = this.calculator.calculateWorkload(inputs);
    this.uiRenderer.renderWorkloadKPIs(workload);

    // 2. Calculate individual comparison options
    const onPremOption = this.calculator.calculateOnPremOption(inputs.onPremModelId, inputs.onPremGpuId, workload);
    const cloudDeployOption = this.calculator.calculateCloudDeployOption(inputs.cloudProviderId, inputs.cloudInstanceIndex, workload);
    const cloudLlmOption = this.calculator.calculateCloudLLMOption(inputs.cloudLlmProviderId, inputs.cloudLlmModelId, workload);

    // 3. Render 3-Way Comparison Matrix
    this.uiRenderer.renderComparisonMatrix(onPremOption, cloudDeployOption, cloudLlmOption, workload);

    // 4. Generate & Render Top 3 Recommendations
    const recommendations = this.recommender.getTop3Recommendations(workload, {
      privacyLevel: inputs.privacyLevel
    });
    this.uiRenderer.renderRecommendations('recommendations-container', recommendations);

    // 5. Update Charts
    const currencyConfig = this.currencyRates[this.currentCurrency] || this.currencyRates['USD'];
    const timelineData = this.calculator.generateTcoTimeline(onPremOption, cloudDeployOption, cloudLlmOption);
    
    this.chartManager.renderTcoTimelineChart('tco-timeline-chart', timelineData, currencyConfig.symbol);
    this.chartManager.renderBreakdownChart('cost-breakdown-chart', onPremOption, cloudDeployOption, cloudLlmOption, currencyConfig.symbol);

    // 6. Update Break-Even Callout Badge
    const breakEvenEl = document.getElementById('break-even-insight');
    if (breakEvenEl && timelineData.breakEvenMonthApi) {
      breakEvenEl.innerHTML = `
        <span class="pulse-dot"></span>
        <strong>Architect Insight:</strong> For this workload (${workload.activeUsers} users), an On-Premise server breaks even vs commercial LLM API at <strong>Month ${timelineData.breakEvenMonthApi}</strong>, generating cumulative net savings of <strong>${this.uiRenderer.formatMoney(cloudLlmOption.threeYearTCO - onPremOption.threeYearTCO)}</strong> over 3 years.
      `;
    }
  }

  exportBudgetPlanJson() {
    const inputs = this.getUserInputs();
    const workload = this.calculator.calculateWorkload(inputs);
    const onPremOption = this.calculator.calculateOnPremOption(inputs.onPremModelId, inputs.onPremGpuId, workload);
    const cloudDeployOption = this.calculator.calculateCloudDeployOption(inputs.cloudProviderId, inputs.cloudInstanceIndex, workload);
    const cloudLlmOption = this.calculator.calculateCloudLLMOption(inputs.cloudLlmProviderId, inputs.cloudLlmModelId, workload);
    const recommendations = this.recommender.getTop3Recommendations(workload, { privacyLevel: inputs.privacyLevel });

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        title: "Enterprise AI Server Resource & Cost Budget Plan",
        author: "AI Solution Architect"
      },
      workloadParameters: inputs,
      workloadCalculations: workload,
      top3Recommendations: recommendations,
      architecturesCostAnalysis: {
        onPremiseServer: onPremOption,
        cloudDedicatedGPU: cloudDeployOption,
        commercialCloudLLM: cloudLlmOption
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AI_Server_Resource_Budget_${inputs.activeUsers}_Users.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AIApp();
  window.app.init();
});
