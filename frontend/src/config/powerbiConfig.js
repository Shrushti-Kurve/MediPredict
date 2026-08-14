/**
 * Power BI Embedded Configuration
 * 
 * Supports role-based report definitions and environment variable overrides.
 * When real Power BI publish URLs or Azure Power BI embed tokens are ready, 
 * configure them here or pass via .env (e.g. VITE_POWERBI_DOCTOR_URL).
 */

export const POWER_BI_REPORTS = {
  doctor: {
    reportId: 'MP-BI-DOC-2026',
    title: 'Clinical Outcomes & Disease Prevalence Intelligence',
    category: 'Doctor Clinical Analytics',
    description: 'Real-time patient diagnosis distribution, treatment efficacy, visit velocity, and critical health risk telemetry.',
    defaultEmbedUrl: import.meta.env?.VITE_POWERBI_DOCTOR_URL || '', //add ur power bi url
    refreshIntervalMins: 15,
    metrics: [
      { label: 'Patient Recovery Index', value: '88.4%', change: '+4.2%', trend: 'up' },
      { label: 'Avg Treatment Duration', value: '14.2 Days', change: '-1.8 Days', trend: 'down' },
      { label: 'Chronic Disease Ratio', value: '42.1%', change: '+0.8%', trend: 'up' },
      { label: 'Critical Risk Alerts', value: '3 Active', change: '-2', trend: 'down' }
    ]
  },
  hospitalStaff: {
    reportId: 'MP-BI-HOSP-2026',
    title: 'Hospital Patient Inflow & Facility Operations Analytics',
    category: 'Hospital Staff Operations',
    description: 'Patient admissions throughput, bed occupancy distribution, demographic coverage, and daily clinic attendance velocity.',
    defaultEmbedUrl: import.meta.env?.VITE_POWERBI_HOSPITAL_URL || '',
    refreshIntervalMins: 10,
    metrics: [
      { label: 'Today Total Footfall', value: '142 Patients', change: '+18%', trend: 'up' },
      { label: 'Avg Triage Wait Time', value: '11.5 Mins', change: '-3.2 Mins', trend: 'down' },
      { label: 'Bed Capacity Load', value: '76.8%', change: '+5.4%', trend: 'up' },
      { label: 'Rural Outreach Coverage', value: '18 Villages', change: '+2 Villages', trend: 'up' }
    ]
  },
  pharmacist: {
    reportId: 'MP-BI-PHARM-2026',
    title: 'Pharmaceutical Inventory Velocity & Stock Forecast',
    category: 'Pharmacy Supply Chain',
    description: 'Medicine consumption rates, stockout risk predictions, expiry horizons, and automated procurement forecasting.',
    defaultEmbedUrl: import.meta.env?.VITE_POWERBI_PHARMACY_URL || '',
    refreshIntervalMins: 30,
    metrics: [
      { label: 'Inventory Turnover Rate', value: '4.6x / mo', change: '+0.3x', trend: 'up' },
      { label: 'Near-Expiry Stock', value: '2 Batches', change: '-1 Batch', trend: 'down' },
      { label: 'Critical Low Stock Items', value: '3 Medicines', change: '-2', trend: 'down' },
      { label: 'Restock Fulfillment Rate', value: '96.2%', change: '+2.1%', trend: 'up' }
    ]
  }
};
