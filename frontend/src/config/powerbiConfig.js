/**
 * Power BI Embedded Configuration
 * 
 * Paste your Power BI report embed URLs (or "Publish to web" iframe URLs) below.
 * When a URL is provided, the dashboard will automatically render the live embedded report.
 * If left empty (""), a clean Power BI placeholder will be displayed.
 * 
 * Example:
 * doctor: "https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&autoAuth=true..."
 */

export const POWER_BI_REPORTS = {
  doctor: import.meta.env?.VITE_POWERBI_DOCTOR_URL || "",
  hospitalStaff: import.meta.env?.VITE_POWERBI_HOSPITAL_URL || "",
  pharmacist: import.meta.env?.VITE_POWERBI_PHARMACY_URL || "",
  admin: import.meta.env?.VITE_POWERBI_ADMIN_URL || ""
};

export const POWER_BI_TITLES = {
  doctor: "Doctor Power BI Dashboard",
  hospitalStaff: "Hospital Staff Power BI Dashboard",
  pharmacist: "Pharmacist Power BI Dashboard",
  admin: "Admin Power BI Dashboard"
};

export const POWER_BI_CATEGORIES = {
  doctor: "Clinical Outcomes & Disease Prevalence Intelligence",
  hospitalStaff: "Hospital Operations & Patient Inflow Analytics",
  pharmacist: "Pharmacy Inventory & Supply Chain Logistics",
  admin: "Master System Telemetry & Rural Healthcare Overview"
};

// export const POWER_BI_REPORTS = {
//   doctor: "https://app.powerbi.com/reportEmbed?reportId=d3d5ae9e-b51e-4dba-9191-fabeab31c91d&autoAuth=true&embeddedDemo=true",
//   hospitalStaff: "https://app.powerbi.com/reportEmbed?reportId=YOUR_HOSPITAL_REPORT_ID&autoAuth=true...",
//   pharmacist: "https://app.powerbi.com/reportEmbed?reportId=YOUR_PHARMACY_REPORT_ID&autoAuth=true...",
//   admin: "https://app.powerbi.com/reportEmbed?reportId=YOUR_ADMIN_REPORT_ID&autoAuth=true..."
// };