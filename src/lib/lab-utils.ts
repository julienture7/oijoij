// src/lib/lab-utils.ts
import type { LabReport, LabTest } from "@/data/types";

/**
 * Groups an array of lab reports by the year of their reportDate.
 * @param {LabReport[]} reports - An array of lab reports.
 * @returns {Record<string, LabReport[]>} An object where keys are years (as strings)
 * and values are arrays of lab reports for that year.
 */
export const groupLabReportsByYear = (reports: LabReport[]): Record<string, LabReport[]> => {
  return reports.reduce((acc, report) => {
    const year = new Date(report.reportDate).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(report);
    return acc;
  }, {} as Record<string, LabReport[]>);
};

/**
 * Extracts unique, sorted category names from an array of lab reports.
 * Categories are derived from section names based on keywords.
 * @param {LabReport[]} reports - An array of lab reports.
 * @returns {string[]} A sorted array of unique category names.
 */
export const getUniqueReportCategories = (reports: LabReport[]): string[] => {
  const categories = new Set<string>();
  reports.forEach(report => {
    report.sections.forEach(section => {
      // A simple way to categorize, you might want more specific logic
      const lowerSectionName = section.sectionName.toLowerCase();
      if (lowerSectionName.includes("hématologie")) categories.add("Hématologie");
      else if (lowerSectionName.includes("biochimie")) categories.add("Biochimie");
      else if (lowerSectionName.includes("hormone")) categories.add("Hormones");
      else if (lowerSectionName.includes("vitamine")) categories.add("Vitamines");
      else if (lowerSectionName.includes("immunologie")) categories.add("Immunologie");
      // Add more general categories as needed
    });
  });
  return Array.from(categories).sort();
};

/**
 * Returns Tailwind CSS class names for text color based on lab test status.
 * @param {LabTest["status"]} [status] - The status of the lab test (e.g., "normal", "high", "low").
 * @returns {string} Tailwind CSS class names for text color.
 */
export const getStatusColor = (status?: LabTest["status"]): string => {
  switch (status) {
    case "low":
    case "abnormal":
    case "high":
      return "text-health-abnormal dark:text-health-abnormal";
    case "positive":
      return "text-health-abnormal dark:text-health-abnormal";
    case "borderline":
    case "significant": // Assuming significant is a type of borderline/caution
      return "text-health-caution dark:text-health-caution";
    case "normal":
    case "negative":
      return "text-health-normal dark:text-health-normal";
    default:
      return "text-foreground"; // Default color for undefined or other statuses
  }
};

/**
 * Returns Tailwind CSS class names for badge styling (background, text, border) based on lab test status.
 * @param {LabTest["status"]} [status] - The status of the lab test.
 * @returns {string} Tailwind CSS class names for badge styling.
 */
export const getStatusBadgeColor = (status?: LabTest["status"]): string => {
  switch (status) {
    case "low": // Often grouped with abnormal or caution
    case "abnormal":
    case "high":
      return "bg-health-abnormal-bg text-health-abnormal border-health-abnormal/50";
    case "positive":
      return "bg-health-abnormal-bg text-health-abnormal border-health-abnormal/50";
    case "borderline":
    case "significant":
      return "bg-health-caution-bg text-health-caution border-health-caution/50";
    case "normal":
    case "negative":
      return "bg-health-normal-bg text-health-normal border-health-normal/50";
    default:
      return "bg-muted text-muted-foreground border-border"; // Default badge for undefined or other statuses
  }
};
