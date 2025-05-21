"use client";

import { Badge } from "@/components/ui/badge";
import type { LabReport, LabTest } from "@/data/types";
import { getStatusBadgeColor } from "@/lib/lab-utils";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


interface RecentLabResultsProps {
  reports: LabReport[];
}

// Helper to find a few key tests from a report, focusing on abnormal or key markers
const findKeyTestsForDashboard = (report: LabReport): LabTest[] => {
  const priorityTests: LabTest[] = [];
  const otherTests: LabTest[] = [];

  const keyTestNames = [
    "Hémoglobine", "Leucocytes", "Plaquettes",
    "HDL-Cholestérol", "Potassium", "S-DHEA", "Vitamine D", "Ferritine",
    "TSH u.s.", "Glycémie A JEUN", "HbA1c", "Créatinine", "pH fécal",
    "Ochratoxine A", "Dihydrocitrinone", // Mycotoxins
    "Acide cholique", "Acide chénodésoxycholique", // Bile acids
    "Fusobacteria", "Bifidobacterium" // Microbiome
  ];


  report.sections.forEach(section => {
    section.tests.forEach(test => {
      if (keyTestNames.includes(test.name)) {
        if (test.status && test.status !== 'normal' && test.status !== 'negative') {
          priorityTests.push(test);
        } else {
          otherTests.push(test);
        }
      }
      if (test.subTests) {
        test.subTests.forEach(subTest => {
          if (keyTestNames.includes(subTest.name)) {
             if (subTest.status && subTest.status !== 'normal' && subTest.status !== 'negative') {
                priorityTests.push(subTest);
             } else {
                otherTests.push(subTest);
             }
          }
        });
      }
    });
  });

  // Combine priority tests and then other key tests, up to a limit (e.g., 3-4 total for dashboard card)
  return [...priorityTests, ...otherTests].slice(0, 4);
};


export function RecentLabResults({ reports }: RecentLabResultsProps) {
  if (!reports || reports.length === 0) {
    return <p className="text-muted-foreground">Aucun résultat de laboratoire récent à afficher.</p>;
  }

  return (
    <div className="space-y-5">
      {reports.map((report, reportIndex) => {
        const keyTests = findKeyTestsForDashboard(report);
        return (
          <Card key={`${report.reportName}-${report.reportDate}-${reportIndex}`} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md font-semibold">{report.reportName}</CardTitle>
                <span className="text-xs text-muted-foreground">{new Date(report.reportDate).toLocaleDateString('fr-FR')}</span>
              </div>
               {report.labName && <CardDescription className="text-xs">{report.labName}</CardDescription>}
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {keyTests.length > 0 ? keyTests.map((test, testIndex) => (
                <div key={`${test.name}-${testIndex}`} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/30 last:border-b-0">
                  <span className="font-medium text-sm flex-1 truncate" title={test.name}>{test.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-semibold ${test.status && (test.status === 'low' || test.status === 'high' || test.status === 'abnormal' || test.status === 'positive') ? 'text-destructive' : 'text-foreground'}`}>
                      {test.value !== null && test.value !== undefined ? String(test.value) : "N/A"} {test.unit}
                    </span>
                    {test.status && (
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0.5 ${getStatusBadgeColor(test.status)}`}
                      >
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">Aucun test clé à afficher pour ce rapport.</p>}
              {report.filePath && (
                <div className="text-right mt-3">
                    <Link href={`/labs/${report.filePath}`} target="_blank" legacyBehavior>
                        <a className="text-xs text-primary hover:underline">Voir rapport complet</a>
                    </Link>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}