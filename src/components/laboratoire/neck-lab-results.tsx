"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { NeckImagingReport } from "@/data/types";

interface NeckLabResultsProps {
  className?: string;
}

export function NeckLabResults({ className }: NeckLabResultsProps) {
  const [reports, setReports] = useState<NeckImagingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/neck-lab-results.json');
        if (!response.ok) throw new Error(`Failed to fetch neck lab results: ${response.statusText}`);
        const data = await response.json();
        // Sort reports by date (newest first)
        const sortedData = [...(data as NeckImagingReport[])].sort(
          (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
        );
        setReports(sortedData);
      } catch (err) {
        console.error("Error fetching neck lab results:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Loading Neck Imaging Results...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || reports.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Neck imaging reports are not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the fetched and sorted reports
  const sortedReports = reports;

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Résultats des Examens Cervicaux</CardTitle>
          <CardDescription>
            Suivi des examens d&apos;imagerie cervicale (Scanner et IRM) au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sortedReports[0]?.reportDate}>
            <TabsList className="mb-4 flex flex-wrap">
              {sortedReports.map((report) => (
                <TabsTrigger key={report.reportDate} value={report.reportDate} className="text-sm">
                  {format(new Date(report.reportDate), "dd/MM/yyyy")} - {report.procedureType}
                </TabsTrigger>
              ))}
            </TabsList>

            {sortedReports.map((report) => (
              <TabsContent key={report.reportDate} value={report.reportDate} className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">Examen</h3>
                      <p className="text-lg font-bold">{report.reportName}</p>
                      <Badge variant="outline" className="mt-1">
                        {report.procedureType}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Lieu</h3>
                      <p>{report.labName}</p>
                      {report.clinic && <p className="text-sm text-muted-foreground">{report.clinic}</p>}
                      {report.doctor && <p className="text-sm text-muted-foreground mt-1">Médecin: {report.doctor}</p>}
                    </div>
                  </div>

                  {report.indication && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">Indication</h3>
                      <p className="text-sm bg-muted rounded p-2">{report.indication}</p>
                    </div>
                  )}

                  {report.techniqueDetails && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">Technique</h3>
                      <p className="text-sm">{report.techniqueDetails}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Résultats</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {report.sections.map((section, index) => (
                        <AccordionItem key={index} value={`section-${index}`}>
                          <AccordionTrigger className="font-medium">
                            {section.sectionName}
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 pl-4 list-disc">
                              {section.findings.map((finding, idx) => (
                                <li key={idx} className="text-sm">{finding}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  {report.overallConclusion && (
                    <div className="mt-6 bg-muted/50 p-4 rounded-lg border">
                      <h3 className="font-semibold mb-2">Conclusion</h3>
                      <p className="text-sm">{report.overallConclusion}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Évolution des pathologies cervicales</CardTitle>
          <CardDescription>
            Comparaison des observations clés au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Bloc fusionnel C3-C4</h3>
              <div className="space-y-2">
                {sortedReports.map((report) => (
                  <div key={report.reportDate} className="border-l-2 border-primary pl-4 py-1">
                    <p className="text-sm font-medium">
                      {format(new Date(report.reportDate), "dd/MM/yyyy")} - {report.procedureType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.overallConclusion && report.overallConclusion.includes("C3-C4")
                        ? report.overallConclusion.substring(0, 100) + (report.overallConclusion.length > 100 ? "..." : "")
                        : "Pas de mention spécifique"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Discopathies C4-C5 / C5-C6</h3>
              <div className="space-y-2">
                {sortedReports.map((report) => (
                  <div key={report.reportDate} className="border-l-2 border-primary pl-4 py-1">
                    <p className="text-sm font-medium">
                      {format(new Date(report.reportDate), "dd/MM/yyyy")} - {report.procedureType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.overallConclusion &&
                      (report.overallConclusion.includes("C4-C5") || report.overallConclusion.includes("C5-C6"))
                        ? report.overallConclusion.substring(0, 100) + (report.overallConclusion.length > 100 ? "..." : "")
                        : "Pas de mention spécifique"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
