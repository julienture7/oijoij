"use client";
// src/app/page.tsx
"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RecentLabResults } from "@/components/dashboard/recent-lab-results";
import { RecentSymptoms } from "@/components/dashboard/recent-symptoms";
import { type LabReport, type CurrentSymptomEntry, type LabTest } from "@/data/types";

/**
 * @interface BloodTestData
 * @description Defines the structure for a single blood test's data as stored in `blood-lab-results.json`.
 * @property {string} unit - The unit of measurement for the test.
 * @property {string} referenceRange - The reference range for the test.
 * @property {string} category - The category the test belongs to (e.g., "Hématologie").
 * @property {Array<{ date: string; value: number | string | null }>} history - An array of historical results for the test.
 */
interface BloodTestData {
  unit: string;
  referenceRange: string;
  category: string;
  history: Array<{ date: string; value: number | string | null }>;
}

/**
 * @interface BloodLabDataCollection
 * @description Represents the entire collection of blood tests, where each key is the test name.
 * @property {[testName: string]: BloodTestData} - Dynamic keys representing each blood test name.
 */
interface BloodLabDataCollection {
  [testName: string]: BloodTestData;
}

/**
 * Transforms the raw blood lab data collection into an array of `LabReport` objects
 * suitable for display on the dashboard. It selects key tests, extracts their latest
 * results, and determines their status relative to reference ranges.
 * @param {BloodLabDataCollection} data - The raw collection of blood test data.
 * @returns {LabReport[]} An array of `LabReport` objects, each representing the latest
 * result of a key test, sorted by the test result date (most recent first). Limited to 8 reports.
 */
const transformBloodDataToLabReportsForDashboard = (data: BloodLabDataCollection): LabReport[] => {
  const reports: LabReport[] = [];
  const keyTestsToDisplayOnDashboard: string[] = [
    // Hématologie
    "Leucocytes", "Hémoglobine", "Plaquettes",
    // Inflammation
    "Protéine C-Réactive (PCR)", "Vitesse de Sédimentation (1ère heure)",
    // Métabolisme Glucidique
    "Glycémie à jeun", "Hémoglobine Glyquée (HbA1c)", "Insulinémie",
    // Lipides
    "HDL-Cholestérol", "LDL-Cholestérol (calculé)", "Triglycérides", "Cholestérol Total",
    // Hormones
    "TSH ultra sensible", "Cortisolémie (matin)", "Sulfate de Dehydroepiandrosterone (S.D.H.A.)", "Testostérone",
    // Vitamines & Minéraux
    "Vitamine D (D2+D3)", "Ferritine", "Vitamine B12", "Folates Sériques (Vitamine B9)", "Magnésium",
    // Fonction Rénale
    "Créatinine", "DFG (CKD-EPI)",
    // Ionogramme
    "Potassium", "Sodium"
    // Foie - can be added if space or if specific concerns arise
    // "ALAT (GPT)", "ASAT (GOT)"
  ];

  keyTestsToDisplayOnDashboard.forEach(testName => {
    const testInfo = data[testName];
    if (testInfo && testInfo.history && testInfo.history.length > 0) {
      // Sort history to get the most recent
      const sortedHistory = [...testInfo.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestEntry = sortedHistory[0];

      // Helper to determine status
      let status: LabTest["status"] = "abnormal"; // Default to abnormal if specific conditions not met
      const rawValue = latestEntry.value;
      const refRange = testInfo.referenceRange;

      if (rawValue === null || rawValue === undefined) {
        status = "abnormal"; // Or handle as 'unknown' if type allows
      } else if (typeof rawValue === 'string') {
        const lowerValue = rawValue.toLowerCase();
        if (lowerValue === 'négatif' || lowerValue === 'negative' || lowerValue === 'absence') {
          status = "negative";
        } else if (lowerValue === 'positif' || lowerValue === 'positive' || lowerValue.includes('présence')) {
          status = "positive";
        } else { // Attempt to parse if it's a string number or contains <, >
            const numericValue = Number.parseFloat(lowerValue.replace(/[<>,≤≥]/g, '').trim());
            if (!isNaN(numericValue)) { // Check if numericValue is a valid number
                 if (refRange && typeof refRange === 'string' && refRange.trim() !== "") { // Ensure refRange is a usable string
                    const cleanedRefRange = refRange.replace(/\s+/g, "");
                    let lowerBound: number | undefined;
                    let upperBound: number | undefined;

                    if (cleanedRefRange.includes("-")) {
                        const parts = cleanedRefRange.split("-").map(s => Number.parseFloat(s.replace(',', '.')));
                        lowerBound = parts[0];
                        upperBound = parts[1];
                    } else if (cleanedRefRange.startsWith("<=") || cleanedRefRange.startsWith("≤")) {
                        upperBound = Number.parseFloat(cleanedRefRange.replace(/[≤<>=]/g, "").replace(',', '.'));
                    } else if (cleanedRefRange.startsWith("<")) {
                        upperBound = Number.parseFloat(cleanedRefRange.replace(/[<>=]/g, "").replace(',', '.'));
                        if (numericValue < upperBound) status = "normal"; else status = "high"; // Value should be less than
                    } else if (cleanedRefRange.startsWith(">=") || cleanedRefRange.startsWith("≥")) {
                        lowerBound = Number.parseFloat(cleanedRefRange.replace(/[≥<>=]/g, "").replace(',', '.'));
                    } else if (cleanedRefRange.startsWith(">")) {
                        lowerBound = Number.parseFloat(cleanedRefRange.replace(/[<>=]/g, "").replace(',', '.'));
                        if (numericValue > lowerBound) status = "normal"; else status = "low"; // Value should be greater than
                    }

                    if (lowerBound !== undefined && !isNaN(lowerBound) && upperBound !== undefined && !isNaN(upperBound)) {
                        status = numericValue >= lowerBound && numericValue <= upperBound ? "normal" :
                                 numericValue < lowerBound ? "low" : "high";
                    } else if (upperBound !== undefined && !isNaN(upperBound) && (lowerBound === undefined || isNaN(lowerBound))) {
                         status = numericValue <= upperBound ? "normal" : "high";
                         if ((cleanedRefRange.startsWith("<=") || cleanedRefRange.startsWith("≤")) && numericValue === upperBound) status = "normal";
                         else if (cleanedRefRange.startsWith("<") && numericValue === upperBound) status = "high";
                    } else if (lowerBound !== undefined && !isNaN(lowerBound) && (upperBound === undefined || isNaN(upperBound))) {
                         status = numericValue >= lowerBound ? "normal" : "low";
                         if ((cleanedRefRange.startsWith(">=") || cleanedRefRange.startsWith("≥")) && numericValue === lowerBound) status = "normal";
                         else if (cleanedRefRange.startsWith(">") && numericValue === lowerBound) status = "low";
                    }
                 } else { status = "abnormal"; } // No refRange, cannot determine numeric status beyond abnormal
            } else { status = "abnormal"; } // Non-numeric string that wasn't 'négatif' etc.
        }
      } else if (typeof rawValue === 'number') { // Pure numeric value
        const numericValue = rawValue;
         if (refRange && typeof refRange === 'string' && refRange.trim() !== "") { // Ensure refRange is a usable string
            const cleanedRefRange = refRange.replace(/\s+/g, "");
            let lowerBound: number | undefined;
            let upperBound: number | undefined;

            if (cleanedRefRange.includes("-")) {
                const parts = cleanedRefRange.split("-").map(s => Number.parseFloat(s.replace(',', '.')));
                lowerBound = parts[0];
                upperBound = parts[1];
            } else if (cleanedRefRange.startsWith("<=") || cleanedRefRange.startsWith("≤")) {
                upperBound = Number.parseFloat(cleanedRefRange.replace(/[≤<>=]/g, "").replace(',', '.'));
            } else if (cleanedRefRange.startsWith("<")) {
                 upperBound = Number.parseFloat(cleanedRefRange.replace(/[<>=]/g, "").replace(',', '.'));
                 if (numericValue < upperBound) status = "normal"; else status = "high";
            } else if (cleanedRefRange.startsWith(">=") || cleanedRefRange.startsWith("≥")) {
                lowerBound = Number.parseFloat(cleanedRefRange.replace(/[≥<>=]/g, "").replace(',', '.'));
            } else if (cleanedRefRange.startsWith(">")) {
                lowerBound = Number.parseFloat(cleanedRefRange.replace(/[<>=]/g, "").replace(',', '.'));
                if (numericValue > lowerBound) status = "normal"; else status = "low";
            }

            if (lowerBound !== undefined && !isNaN(lowerBound) && upperBound !== undefined && !isNaN(upperBound)) {
                status = numericValue >= lowerBound && numericValue <= upperBound ? "normal" :
                         numericValue < lowerBound ? "low" : "high";
            } else if (upperBound !== undefined && !isNaN(upperBound) && (lowerBound === undefined || isNaN(lowerBound))) {
                 status = numericValue <= upperBound ? "normal" : "high";
                 if ((cleanedRefRange.startsWith("<=") || cleanedRefRange.startsWith("≤")) && numericValue === upperBound) status = "normal";
                 else if (cleanedRefRange.startsWith("<") && numericValue === upperBound) status = "high";
            } else if (lowerBound !== undefined && !isNaN(lowerBound) && (upperBound === undefined || isNaN(upperBound))) {
                 status = numericValue >= lowerBound ? "normal" : "low";
                 if ((cleanedRefRange.startsWith(">=") || cleanedRefRange.startsWith("≥")) && numericValue === lowerBound) status = "normal";
                 else if (cleanedRefRange.startsWith(">") && numericValue === lowerBound) status = "low";
            }
         }
      }

      }

      // Ensure status is a valid LabTest['status'] type
      const validStatuses: LabTest['status'][] = ["normal", "low", "high", "abnormal", "positive", "negative", "borderline", "significant"];
      if (!validStatuses.includes(status!)) {
          status = "abnormal"; // Fallback for unparsed or ambiguous statuses
      }

      reports.push({
        reportDate: latestEntry.date, // This is the date of the specific test value
        reportName: testName, // Used as the title for the LabReportCard on dashboard
        labName: testInfo.category, // Using category as labName for context on dashboard
        sections: [
          {
            sectionName: testInfo.category, // Redundant but matches LabReport structure
            tests: [
              {
                name: testName,
                value: latestEntry.value,
                unit: testInfo.unit,
                referenceRange: testInfo.referenceRange,
                status: status,
              },
            ],
          },
        ],
      });
    }
  });
  // Sort the "reports" by their date to show the most recent tests first
  return reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()).slice(0, 8); // Increased to 8
};

let typedBloodLabData: BloodLabDataCollection = {};

/**
 * Dashboard page component.
 * Fetches and displays recent lab results and current symptoms.
 * @returns {React.ReactElement} The dashboard page.
 */
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
            {recentLabReportsForDashboard.length > 0 ? 
              <RecentLabResults reports={recentLabReportsForDashboard} /> :
              <p className="text-sm text-muted-foreground">Aucun résultat de laboratoire clé récent à afficher.</p>
            }
          </CardContent>
        </Card>

        {currentActualSymptoms && (
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>
                Symptômes Actuels 
                {currentActualSymptoms.date && ` (${new Date(currentActualSymptoms.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })})`}
              </CardTitle>
              <CardDescription>Auto-rapporté.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSymptoms symptomEntry={currentActualSymptoms} />
            </CardContent>
          </Card>
        )}

        {achardProtocolEffects && (
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>
                Effet Protocole Achard 
                {achardProtocolEffects.date && ` (${new Date(achardProtocolEffects.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })})`}
                </CardTitle>
              <CardDescription>Auto-rapporté.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSymptoms symptomEntry={achardProtocolEffects} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
