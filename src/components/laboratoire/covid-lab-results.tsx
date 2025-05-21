"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug } from "lucide-react";
import type { CovidLabReport } from "@/data/types";

interface CovidLabResultsProps {
  className?: string;
}

export function CovidLabResults({ className }: CovidLabResultsProps) {
  const [reportData, setReportData] = useState<CovidLabReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/covid-lab-results.json');
        if (!response.ok) throw new Error(`Failed to fetch COVID lab results: ${response.statusText}`);
        const data = await response.json();
        // Assuming covidLabData is an array and we need the first element
        if (Array.isArray(data) && data.length > 0) {
          setReportData(data[0] as CovidLabReport);
        } else if (!Array.isArray(data)) {
          // If it's a single object directly, which might be the case for some files
          setReportData(data as CovidLabReport);
        } else {
          throw new Error("COVID lab data is empty or not in expected format");
        }
      } catch (err) {
        console.error("Error fetching COVID lab results:", err);
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
            <CardTitle>Loading COVID-19 Results...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "COVID-19 report data is not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the fetched report data
  const report = reportData;
  const isPositive = report.sections.some(section =>
    section.overallResult?.toLowerCase() === "positive"
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{report.reportName}</CardTitle>
              <CardDescription>
                Test effectué le {format(new Date(report.examinationDate), "dd/MM/yyyy")} à {report.samplingTime}
              </CardDescription>
            </div>
            <Badge
              className={`text-md px-3 py-1 ${isPositive ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-green-100 text-green-700 hover:bg-green-100"}`}
            >
              {isPositive ? "POSITIF" : "NÉGATIF"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Détails du Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Laboratoire</p>
                      <p className="font-medium">{report.labName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type de procédure</p>
                      <p className="font-medium">{report.procedureType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type d'échantillon</p>
                      <p className="font-medium">{report.sampleType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Médecin</p>
                      <p className="font-medium">{report.doctor}</p>
                    </div>
                    {report.referenceNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">N° de référence</p>
                        <p className="font-medium">{report.referenceNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Résultats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.sections.map((section, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h3 className="font-semibold text-sm mb-1">{section.sectionName}</h3>
                      <ul className="space-y-1 list-disc pl-5">
                        {section.findings.map((finding, fIndex) => (
                          <li key={fIndex} className="text-sm">{finding}</li>
                        ))}
                      </ul>
                      {section.overallResult && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">
                            Résultat: <span className={isPositive ? "text-red-600" : "text-green-600"}>{section.overallResult}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {report.techniqueDetails && (
            <div className="mt-2 mb-6">
              <h3 className="font-semibold text-sm mb-1">Technique d'analyse</h3>
              <p className="text-sm bg-muted/50 p-3 rounded">{report.techniqueDetails}</p>
            </div>
          )}

          {report.additionalNotes && report.additionalNotes.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Informations complémentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.additionalNotes.map((note, index) => (
                    <li key={index} className="text-sm border-l-2 border-muted-foreground/30 pl-3 py-1">
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.overallConclusion && (
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <h3 className="font-semibold mb-2">Conclusion</h3>
              <p className="text-sm">{report.overallConclusion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
