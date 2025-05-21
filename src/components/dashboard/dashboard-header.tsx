"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const dataFiles = [
    "biomesight-summary.json",
    "blood-lab-results.json",
    "covid-lab-results.json",
    "current-status.json",
    "dysautonomie-lab-results.json",
    "food-sensitivities.json",
    "medical-history.json",
    "microbiome-lab-results.json",
    "mycotoxin-lab-results.json",
    "neck-lab-results.json",
    "patient-profile.json",
    "scandigestif-lab-results.json",
  ];

  const handleDownloadData = async () => {
    try {
      const allData: { [key: string]: any } = {};
      for (const fileName of dataFiles) {
        const response = await fetch(`/data/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
        }
        const data = await response.json();
        allData[fileName.replace('.json', '')] = data;
      }

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "all_patient_data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Data downloaded successfully");
    } catch (error) {
      console.error("Error downloading data:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleExportPDF = () => {
    console.log("Export PDF button clicked - logic to be implemented");
    // TODO: Implement actual PDF export logic
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Vue d'Ensemble</h1>
        <div className="flex items-center mt-1">
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
          <span className="mx-2 text-muted-foreground">•</span>
          <Badge variant="outline" className="font-medium bg-medical-blue-light text-medical-blue">
            Patient: John Doe
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleDownloadData} className="mr-2">
          <Download size={16} className="mr-2" />
          Download Data
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="mr-2">
          <FileDown size={16} className="mr-2" />
          Export PDF
        </Button>
        <div className="relative">
          <Button variant="outline" size="icon">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-health-abnormal text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
        <div className="flex flex-col">
          <div className="font-semibold">Dr. Sarah Johnson</div>
          <div className="text-sm text-muted-foreground">Last update: May 15, 2025</div>
        </div>
      </div>
    </div>
  );
}
