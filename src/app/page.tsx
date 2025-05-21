"use client";
// src/app/page.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentLabResults } from "@/components/dashboard/recent-lab-results";
import { RecentSymptoms } from "@/components/dashboard/recent-symptoms";
import { type LabReport, type CurrentSymptomEntry, MedicalEvent, type LabTest } from "@/data/types";

// Define a type for your structured blood lab data (as it is in blood-lab-results.json)
interface BloodTestData {
  unit: string;
  referenceRange: string;
  category: string;
  history: Array<{ date: string; value: number | string | null }>;
}
interface BloodLabDataCollection {
  [testName: string]: BloodTestData;
}

// Helper to transform BloodLabDataCollection into LabReport[] for RecentLabResults component
// This creates a simplified LabReport structure for each key test's latest result.
const transformBloodDataToLabReportsForDashboard = (data: BloodLabDataCollection): LabReport[] => {
  const reports: LabReport[] = [];
  const keyTestsToDisplayOnDashboard = [
    "Leucocytes", "Hémoglobine", "Plaquettes", "HDL-Cholestérol",
    "Potassium", "Sulfate de Dehydroepiandrosterone (S.D.H.A.)", "Vitamine D (D2+D3)", "Ferritine",
    "TSH ultra sensible", "Glycémie à jeun", "Hémoglobine Glyquée (HbA1c)"
  ];

  keyTestsToDisplayOnDashboard.forEach(testName => {
    const testInfo = data[testName];
    if (testInfo && testInfo.history && testInfo.history.length > 0) {
      // Sort history to get the most recent
      const sortedHistory = [...testInfo.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestEntry = sortedHistory[0];

      // Helper to determine status (simplified for dashboard)
      let status: LabTest["status"] = "abnormal"; // Change from "unknown" to valid value
      const numericValue = typeof latestEntry.value === 'string' ? Number.parseFloat(latestEntry.value.replace(',', '.')) : latestEntry.value;
      if (numericValue !== null && numericValue !== undefined && !isNaN(numericValue as number)) {
        let lowerBound: number | undefined;
        let upperBound: number | undefined;
        if (testInfo.referenceRange.includes("-")) {
            const parts = testInfo.referenceRange.split("-").map(s => Number.parseFloat(s.trim().replace(',', '.')));
            lowerBound = parts[0];
            upperBound = parts[1];
            if (!isNaN(lowerBound) && !isNaN(upperBound)) {
            status = numericValue >= lowerBound && numericValue <= upperBound ? "normal" : "abnormal";
            }
        } else if (testInfo.referenceRange.startsWith("<") || testInfo.referenceRange.startsWith("<=")) {
            upperBound = Number.parseFloat(testInfo.referenceRange.replace(/[<>=]/g, "").trim().replace(',', '.'));
            if(!isNaN(upperBound)) status = numericValue <= upperBound ? "normal" : "abnormal";
        } else if (testInfo.referenceRange.startsWith(">") || testInfo.referenceRange.startsWith(">=")) {
            lowerBound = Number.parseFloat(testInfo.referenceRange.replace(/[<>=]/g, "").trim().replace(',', '.'));
            if(!isNaN(lowerBound)) status = numericValue >= lowerBound ? "normal" : "abnormal";
        }
      } else if (typeof latestEntry.value === 'string') {
         status = latestEntry.value.toLowerCase() === 'négatif' || latestEntry.value.toLowerCase() === 'absence' ? 'negative' : 'positive';
      }

      reports.push({
        reportDate: latestEntry.date,
        reportName: testName,
        labName: testInfo.category,
        sections: [
          {
            sectionName: testInfo.category,
            tests: [
              {
                name: testName,
                value: latestEntry.value,
                unit: testInfo.unit,
                referenceRange: testInfo.referenceRange,
                status: status
              }
            ]
          }
        ]
      });
    }
  });
  // Sort the "reports" by date to show the most recent tests first
  return reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()).slice(0, 4);
};

let typedBloodLabData: BloodLabDataCollection = {};

export default function Dashboard() {
  const [symptomsStatus, setSymptomsStatus] = React.useState<CurrentSymptomEntry[]>([]);
  const [recentLabReportsForDashboard, setRecentLabReportsForDashboard] = React.useState<LabReport[]>([]);
  const [currentActualSymptoms, setCurrentActualSymptoms] = React.useState<CurrentSymptomEntry | undefined>(undefined);
  const [achardProtocolEffects, setAchardProtocolEffects] = React.useState<CurrentSymptomEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [bloodDataResponse, currentStatusResponse] = await Promise.all([
          fetch('/data/blood-lab-results.json'),
          fetch('/data/current-status.json')
        ]);

        if (!bloodDataResponse.ok) throw new Error(`Failed to fetch blood lab data: ${bloodDataResponse.statusText}`);
        if (!currentStatusResponse.ok) throw new Error(`Failed to fetch current status data: ${currentStatusResponse.statusText}`);

        const bloodData = await bloodDataResponse.json();
        const currentStatus = await currentStatusResponse.json();

        typedBloodLabData = bloodData as BloodLabDataCollection;
        const transformedReports = transformBloodDataToLabReportsForDashboard(typedBloodLabData);
        setRecentLabReportsForDashboard(transformedReports);

        const typedCurrentStatus = currentStatus as CurrentSymptomEntry[];
        setSymptomsStatus(typedCurrentStatus);
        setCurrentActualSymptoms(typedCurrentStatus.find(s => s.category.startsWith("Symptomes actuel")));
        setAchardProtocolEffects(typedCurrentStatus.find(s => s.category.startsWith("Protocole achard effet")));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Analyses Sanguines Récentes Clés</CardTitle>
            <CardDescription>Derniers résultats de laboratoire sanguins significatifs.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLabResults reports={recentLabReportsForDashboard} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Symptômes Actuels (18/05/2025)</CardTitle>
            <CardDescription>Auto-rapporté.</CardDescription>
          </CardHeader>
          <CardContent>
             <RecentSymptoms symptomEntry={currentActualSymptoms} />
          </CardContent>
        </Card>
         <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Effet Protocole Achard (19/03/2024)</CardTitle>
            <CardDescription>Auto-rapporté.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSymptoms symptomEntry={achardProtocolEffects} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
