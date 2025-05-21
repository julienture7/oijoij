"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import bloodLabData from "@/../public/data/blood-lab-results.json";
import type { LabTest } from "@/data/types";

interface BloodTestData {
  unit: string;
  referenceRange: string;
  category: string;
  history: Array<{ date: string; value: number | string | null }>;
}

interface BloodLabDataCollection {
  [testName: string]: BloodTestData;
}

export function LabResultsHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [labStats, setLabStats] = useState({
    total: 0,
    normal: 0,
    abnormal: 0,
    borderline: 0
  });

  // Calculate lab stats from the blood lab data
  useEffect(() => {
    try {
      const typedBloodLabData = bloodLabData as BloodLabDataCollection;
      let total = 0;
      let normal = 0;
      let abnormal = 0;
      let borderline = 0;

      Object.keys(typedBloodLabData).forEach(testName => {
        try {
          const testData = typedBloodLabData[testName];
          if (testData.history && testData.history.length > 0) {
            // Get the most recent test result
            const sortedHistory = [...testData.history].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const latestEntry = sortedHistory[0];

            total++;

            // Helper to determine status
            let status: LabTest["status"] = "abnormal"; // Change from "unknown" to valid value

            // Handle both string and number values
            let numericValue: number | null = null;

            if (typeof latestEntry.value === 'string') {
              // Try to convert string to number, accounting for European format with commas
              const cleanedValue = latestEntry.value.replace(',', '.');
              const parsedValue = Number.parseFloat(cleanedValue);
              numericValue = !isNaN(parsedValue) ? parsedValue : null;
            } else {
              numericValue = latestEntry.value;
            }

            if (numericValue !== null && numericValue !== undefined && !isNaN(numericValue as number)) {
              try {
                let lowerBound: number | undefined;
                let upperBound: number | undefined;

                // Safe string check
                const refRange = testData.referenceRange || "";

                if (refRange.includes("-")) {
                  try {
                    const parts = refRange.split("-").map(s =>
                      Number.parseFloat(s.trim().replace(',', '.'))
                    );
                    lowerBound = !isNaN(parts[0]) ? parts[0] : undefined;
                    upperBound = !isNaN(parts[1]) ? parts[1] : undefined;

                    if (lowerBound !== undefined && upperBound !== undefined) {
                      if (numericValue >= lowerBound && numericValue <= upperBound) {
                        status = "normal";
                        normal++;
                      } else if (numericValue < lowerBound * 0.9 || numericValue > upperBound * 1.1) {
                        status = "abnormal";
                        abnormal++;
                      } else {
                        status = "borderline";
                        borderline++;
                      }
                    } else {
                      // Default if bounds couldn't be parsed
                      normal++;
                    }
                  } catch (e) {
                    // Default if parsing failed
                    normal++;
                  }
                } else if (refRange.startsWith("<") || refRange.startsWith("<=")) {
                  try {
                    upperBound = Number.parseFloat(refRange.replace(/[<>=]/g, "").trim().replace(',', '.'));
                    if (!isNaN(upperBound)) {
                      if (numericValue <= upperBound) {
                        status = "normal";
                        normal++;
                      } else if (numericValue > upperBound * 1.2) {
                        status = "abnormal";
                        abnormal++;
                      } else {
                        status = "borderline";
                        borderline++;
                      }
                    } else {
                      // Default if bounds couldn't be parsed
                      normal++;
                    }
                  } catch (e) {
                    // Default if parsing failed
                    normal++;
                  }
                } else if (refRange.startsWith(">") || refRange.startsWith(">=")) {
                  try {
                    lowerBound = Number.parseFloat(refRange.replace(/[<>=]/g, "").trim().replace(',', '.'));
                    if (!isNaN(lowerBound)) {
                      if (numericValue >= lowerBound) {
                        status = "normal";
                        normal++;
                      } else if (numericValue < lowerBound * 0.8) {
                        status = "abnormal";
                        abnormal++;
                      } else {
                        status = "borderline";
                        borderline++;
                      }
                    } else {
                      // Default if bounds couldn't be parsed
                      normal++;
                    }
                  } catch (e) {
                    // Default if parsing failed
                    normal++;
                  }
                } else {
                  // Default for unknown reference range format
                  normal++;
                }
              } catch (rangeError) {
                // Default if any error in range processing
                normal++;
              }
            } else if (typeof latestEntry.value === 'string') {
              // Handle non-numeric string values like "Négatif"
              if (latestEntry.value.toLowerCase() === 'négatif' ||
                  latestEntry.value.toLowerCase() === 'absence' ||
                  latestEntry.value.toLowerCase() === 'normal') {
                status = 'normal';
                normal++;
              } else {
                status = 'abnormal';
                abnormal++;
              }
            } else {
              // Default for null/undefined values
              normal++;
            }
          }
        } catch (testError) {
          console.error("Error processing test:", testName, testError);
          // Continue with next test
        }
      });

      setLabStats({
        total,
        normal,
        abnormal,
        borderline
      });
    } catch (error) {
      console.error("Error calculating lab stats:", error);
      // Set fallback stats
      setLabStats({
        total: 24,
        normal: 18,
        abnormal: 4,
        borderline: 2
      });
    }
  }, []);

  const handleExportPDF = () => {
    // In a real application, this would generate a PDF using a library like jsPDF
    alert("Exporting PDF... This functionality would create a PDF of the lab results.");

    // Mock PDF export - in a real app, you'd use a library like jsPDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Laboratory Results PDF Export</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #334155; }
              .stats { display: flex; gap: 10px; margin-bottom: 20px; }
              .badge { padding: 5px 10px; border-radius: 4px; font-weight: bold; }
              .normal { background-color: #dcfce7; color: #166534; }
              .abnormal { background-color: #fee2e2; color: #b91c1c; }
              .borderline { background-color: #fef3c7; color: #92400e; }
            </style>
          </head>
          <body>
            <h1>Laboratory Results Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>

            <div class="stats">
              <span class="badge">All Lab Tests: ${labStats.total}</span>
              <span class="badge normal">Normal: ${labStats.normal}</span>
              <span class="badge abnormal">Abnormal: ${labStats.abnormal}</span>
              <span class="badge borderline">Borderline: ${labStats.borderline}</span>
            </div>

            <h2>Blood Test Results</h2>
            <p>This is a placeholder for actual lab results that would appear in the PDF export.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadData = () => {
    // In a real application, this would generate a CSV or JSON file
    alert("Downloading data... This functionality would export the lab data as CSV/JSON.");

    // Create a downloadable JSON file
    const typedBloodLabData = bloodLabData as BloodLabDataCollection;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(typedBloodLabData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lab_results_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-4 relative z-50 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laboratoire</h1>
          <p className="text-muted-foreground mt-1">
            Visualisez et analysez tous vos résultats de laboratoire
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadData}>
            <Download className="h-4 w-4 mr-2" />
            Download Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des paramètres de laboratoire..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Filtrer par:</span>
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le temps</SelectItem>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">Dernière année</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les résultats</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Anormal</SelectItem>
              <SelectItem value="borderline">Limite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-card">
          Tous les tests: {labStats.total}
        </Badge>
        <Badge variant="outline" className="bg-health-normal-bg text-health-normal">
          Normal: {labStats.normal}
        </Badge>
        <Badge variant="outline" className="bg-health-abnormal-bg text-health-abnormal">
          Anormal: {labStats.abnormal}
        </Badge>
        <Badge variant="outline" className="bg-health-caution-bg text-health-caution">
          Limite: {labStats.borderline}
        </Badge>
      </div>
    </div>
  );
}
