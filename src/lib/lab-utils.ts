// src/lib/lab-utils.ts
import type { LabReport, LabTest } from "@/data/types";

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

export const getUniqueReportCategories = (reports: LabReport[]): string[] => {
  const categories = new Set<string>();
  reports.forEach(report => {
    report.sections.forEach(section => {
      // A simple way to categorize, you might want more specific logic
      if (section.sectionName.toLowerCase().includes("hématologie")) categories.add("Hématologie");
      else if (section.sectionName.toLowerCase().includes("biochimie")) categories.add("Biochimie");
      else if (section.sectionName.toLowerCase().includes("hormone")) categories.add("Hormones");
      else if (section.sectionName.toLowerCase().includes("vitamine")) categories.add("Vitamines");
      else if (section.sectionName.toLowerCase().includes("immunologie")) categories.add("Immunologie");
      // Add more general categories as needed
    });
  });
  return Array.from(categories).sort();
};

export const getStatusColor = (status?: string): string => {
  switch (status) {
    case "low":
    case "abnormal":
    case "high":
      return "text-health-abnormal dark:text-health-abnormal"; // or health-caution if preferred for low/high
    case "positive":
      return "text-health-abnormal dark:text-health-abnormal";
    case "borderline":
      return "text-health-caution dark:text-health-caution";
    case "significant":
      return "text-health-caution dark:text-health-caution";
    case "normal":
    case "negative":
      return "text-health-normal dark:text-health-normal";
    default:
      return "text-foreground";
  }
};

export const getStatusBadgeColor = (status?: string): string => {
  switch (status) {
    case "low":
    case "abnormal":
    case "high":
      return "bg-health-abnormal-bg text-health-abnormal border-health-abnormal/50";
    case "positive":
      return "bg-health-abnormal-bg text-health-abnormal border-health-abnormal/50";
    case "borderline":
      return "bg-health-caution-bg text-health-caution border-health-caution/50";
    case "significant":
      return "bg-health-caution-bg text-health-caution border-health-caution/50";
    case "normal":
    case "negative":
      return "bg-health-normal-bg text-health-normal border-health-normal/50";
    default:
      return "bg-muted text-muted-foreground";
  }
};
