/**
 * Interactive Chart Manager using Chart.js
 * Handles responsive 36-Month Cumulative TCO curves and Monthly Cost Distribution breakdowns.
 */

class AIChartManager {
  constructor() {
    this.tcoChartInstance = null;
    this.breakdownChartInstance = null;
    this.chartColors = {
      onPrem: {
        border: '#38bdf8', // Neon Sky Blue
        background: 'rgba(56, 189, 248, 0.15)',
        point: '#0284c7'
      },
      cloudDeploy: {
        border: '#a855f7', // Purple/Violet
        background: 'rgba(168, 85, 247, 0.15)',
        point: '#7e22ce'
      },
      cloudLLM: {
        border: '#34d399', // Emerald Green
        background: 'rgba(52, 211, 153, 0.15)',
        point: '#059669'
      },
      gridColor: 'rgba(255, 255, 255, 0.08)',
      textColor: '#94a3b8'
    };
  }

  /**
   * Format currency values for tooltips and axes
   */
  formatCurrency(value, currencySymbol = '$') {
    if (value >= 1000000) {
      return `${currencySymbol}${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
    }
    return `${currencySymbol}${Math.round(value)}`;
  }

  /**
   * Render or update the 36-Month Cumulative TCO Chart
   */
  renderTcoTimelineChart(canvasId, timelineData, currencySymbol = '$') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.tcoChartInstance) {
      this.tcoChartInstance.destroy();
    }

    const datasets = [
      {
        label: '1. On-Premise AI Server (CapEx + Power + Maint)',
        data: timelineData.onPremData,
        borderColor: this.chartColors.onPrem.border,
        backgroundColor: this.chartColors.onPrem.background,
        borderWidth: 3,
        fill: true,
        tension: 0.15,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: '2. Cloud GPU Dedicated (AWS/RunPod/Lambda)',
        data: timelineData.cloudDeployData,
        borderColor: this.chartColors.cloudDeploy.border,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: '3. Commercial Cloud LLM API (ChatGPT/Claude/Gemini)',
        data: timelineData.cloudLlmData,
        borderColor: this.chartColors.cloudLLM.border,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6
      }
    ];

    this.tcoChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timelineData.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: { family: "'Inter', sans-serif", size: 12 },
              usePointStyle: true,
              padding: 18
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label.split('(')[0] || '';
                return ` ${label}: ${currencySymbol}${Math.round(context.raw).toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: this.chartColors.gridColor },
            ticks: {
              color: this.chartColors.textColor,
              font: { size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            }
          },
          y: {
            grid: { color: this.chartColors.gridColor },
            ticks: {
              color: this.chartColors.textColor,
              font: { size: 11 },
              callback: (value) => this.formatCurrency(value, currencySymbol)
            }
          }
        }
      }
    });
  }

  /**
   * Render or update the Monthly Cost Breakdown Stacked Bar Chart
   */
  renderBreakdownChart(canvasId, onPremOption, cloudDeployOption, cloudLlmOption, currencySymbol = '$') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.breakdownChartInstance) {
      this.breakdownChartInstance.destroy();
    }

    const labels = [
      'On-Premise Server',
      'Cloud GPU Dedicated',
      'Commercial LLM API'
    ];

    // Components breakdown
    const hardwareAmortization = [
      onPremOption ? onPremOption.monthlyAmortization : 0,
      0,
      0
    ];

    const electricityPower = [
      onPremOption ? onPremOption.opEx.monthlyElectricityCost : 0,
      0,
      0
    ];

    const cloudComputeOrTokens = [
      0,
      cloudDeployOption ? cloudDeployOption.monthlyComputeCost : 0,
      cloudLlmOption ? (cloudLlmOption.promptCost + cloudLlmOption.completionCost) : 0
    ];

    const maintenanceDevops = [
      onPremOption ? onPremOption.opEx.monthlyMaintenanceCost : 0,
      cloudDeployOption ? (cloudDeployOption.devopsCost + cloudDeployOption.storageCost + cloudDeployOption.egressCost) : 0,
      cloudLlmOption ? cloudLlmOption.apiMaintenanceCost : 0
    ];

    this.breakdownChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Hardware CapEx Amortization',
            data: hardwareAmortization,
            backgroundColor: 'rgba(56, 189, 248, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Electricity & Server Power',
            data: electricityPower,
            backgroundColor: 'rgba(251, 191, 36, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Cloud Compute / API Tokens',
            data: cloudComputeOrTokens,
            backgroundColor: 'rgba(168, 85, 247, 0.85)',
            borderRadius: 4
          },
          {
            label: 'Maintenance, Storage & DevOps',
            data: maintenanceDevops,
            backgroundColor: 'rgba(52, 211, 153, 0.85)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: { family: "'Inter', sans-serif", size: 12 },
              usePointStyle: true,
              padding: 14
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${currencySymbol}${Math.round(context.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: this.chartColors.gridColor },
            ticks: { color: this.chartColors.textColor, font: { size: 12, weight: '500' } }
          },
          y: {
            stacked: true,
            grid: { color: this.chartColors.gridColor },
            ticks: {
              color: this.chartColors.textColor,
              font: { size: 11 },
              callback: (value) => this.formatCurrency(value, currencySymbol)
            }
          }
        }
      }
    });
  }
}

// Export for vanilla JS window environment
if (typeof window !== 'undefined') {
  window.AIChartManager = AIChartManager;
}
