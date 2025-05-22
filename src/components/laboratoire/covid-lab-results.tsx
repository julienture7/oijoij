"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, FileText, UserCircle } from "lucide-react"; // Added FileText, UserCircle
import type { CovidLabReport, LabTest } from "@/data/types"; // Added LabTest for status typing
import { getStatusColor, getStatusBadgeColor } from "@/lib/lab-utils"; // Import highlighting utils
import Link from "next/link"; // Import Link

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
  // Determine overall status based on the first section's overallResult for simplicity
  // More robust logic might be needed if sections can have conflicting results
  const overallStatus = report.sections[0]?.overallResult?.toLowerCase() as LabTest['status'] || "unknown";

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <FileText size={28} className="mr-3 text-primary/80" />
                {report.reportName}
              </CardTitle>
              <CardDescription className="mt-1">
                Test effectué le {format(new Date(report.examinationDate), "dd/MM/yyyy")} à {report.samplingTime}
                {report.referenceNumber && <span className="ml-2 text-xs">(Réf: {report.referenceNumber})</span>}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`text-lg px-4 py-1.5 mt-2 sm:mt-0 ${getStatusBadgeColor(overallStatus)}`}
            >
              {overallStatus === "positive" ? "POSITIF" : 
               overallStatus === "negative" ? "NÉGATIF" : 
               overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary/70" />
                    Patient & Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Patient: </span>
                      <span className="font-medium">{report.patientDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Né(e) le: </span>
                      <span className="font-medium">{format(new Date(report.patientDetails.dob.replace(/(\d{2})−(\d{2})−(\d{4})/, '$3-$2-$1')), "dd/MM/yyyy")}</span>
                    </div>
                     <div>
                      <span className="text-muted-foreground">Sexe: </span>
                      <span className="font-medium">{report.patientDetails.sex === "M" ? "Masculin" : "Féminin"}</span>
                    </div>
                    <hr className="my-2"/>
                    <div>
                      <span className="text-muted-foreground">Laboratoire: </span>
                      <span className="font-medium">{report.labName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type de procédure: </span>
                      <span className="font-medium">{report.procedureType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type d'échantillon: </span>
                      <span className="font-medium">{report.sampleType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Médecin: </span>
                      <span className="font-medium">{report.doctor}</span>
                    </div>
                    {report.filePath && (
                      <div>
                        <span className="text-muted-foreground">Document: </span>
                        <Link href={`/labs/${report.filePath.split(';')[0]}`} target="_blank" legacyBehavior>
                          <a className="font-medium text-primary hover:underline">Voir PDF</a>
                        </Link>
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
