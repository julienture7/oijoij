"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Stethoscope, AlertTriangle, FileText, MapPin } from "lucide-react"; // Added FileText, MapPin
import type { DysautonomiaLabReport, LabTest } from "@/data/types"; // Added LabTest for status typing
import { getStatusColor, getStatusBadgeColor } from "@/lib/lab-utils"; // Import highlighting utils
import Link from "next/link"; // Import Link

interface DysautonomieLabResultsProps {
  className?: string;
}

export function DysautonomieLabResults({ className }: DysautonomieLabResultsProps) {
  const [reportData, setReportData] = useState<DysautonomiaLabReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/dysautonomie-lab-results.json');
        if (!response.ok) throw new Error(`Failed to fetch Dysautonomia lab results: ${response.statusText}`);
        const data = await response.json();
        // Assuming dysautonomieLabData is an array and we need the first element
        if (Array.isArray(data) && data.length > 0) {
          setReportData(data[0] as DysautonomiaLabReport);
        } else if (!Array.isArray(data)) {
          setReportData(data as DysautonomiaLabReport);
        } else {
          throw new Error("Dysautonomia lab data is empty or not in expected format");
        }
      } catch (err) {
        console.error("Error fetching Dysautonomia lab results:", err);
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
            <CardTitle>Loading Dysautonomia Results...</CardTitle>
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
            <p>{error || "Dysautonomia report data is not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the fetched report data
  const report = reportData;

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl flex items-center">
                 <FileText size={28} className="mr-3 text-primary/80" />
                {report.reportName}
              </CardTitle>
              <CardDescription className="mt-1">
                Examen réalisé le {format(new Date(report.examinationDate), "dd/MM/yyyy")} par {report.doctorPerforming}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="whitespace-nowrap">
                {report.procedureType}
              </Badge>
              {report.filePath && (
                <Link href={`/labs/${report.filePath.split(';')[0]}`} target="_blank" legacyBehavior>
                  <a className="text-xs text-primary hover:underline">Voir PDF</a>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary/70" />
                  Informations Générales
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
                    <span className="font-medium">{report.patientDetails.dob.replace(/\//g, '-')}</span>
                  </div>
                  {report.patientDetails.addressProvidedToLab && (
                    <div>
                      <span className="text-muted-foreground">Adresse (fournie): </span>
                      <span className="font-medium">{report.patientDetails.addressProvidedToLab}</span>
                    </div>
                  )}
                  <hr className="my-2"/>
                  <div>
                    <span className="text-muted-foreground">Laboratoire: </span>
                    <span className="font-medium">{report.labName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service: </span>
                    <span className="font-medium">{report.service}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Médecin traitant: </span>
                    <span className="font-medium">{report.referringDoctor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Motif de l'examen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{report.reasonForExam}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Poids</p>
                    <p className="font-medium">{report.measurements.poids}</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Taille</p>
                    <p className="font-medium">{report.measurements.taille}</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <p className="font-medium">{report.measurements.imc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Méthodes d'évaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{report.methods}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Évaluation Clinique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(report.clinicalEvaluation).map(([key, value], index) => (
                    <div key={index}>
                      <p className="text-sm text-muted-foreground">{key === "scoreEwing" ? "Score d'Ewing" : "Rapport Valsalva"}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tests Autonomiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Test</th>
                      <th className="text-right pb-2">Valeur</th>
                      <th className="text-left pb-2">Interprétation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.autonomicTests.map((test, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 font-medium">{test.testName}</td>
                        <td className="py-3 text-right">{test.value}</td>
                        <td className="py-3 text-sm text-muted-foreground">{test.interpretation || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {report.otherMeasures.secretionSudorale_SUDOSCAN_uS && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sécrétion Sudorale (SUDOSCAN) µS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Membres Supérieurs (MS)</p>
                    <p className="text-xl font-semibold">{report.otherMeasures.secretionSudorale_SUDOSCAN_uS.MS.split(" ")[0]}</p>
                    <Badge className="mt-1" variant="outline">
                      {report.otherMeasures.secretionSudorale_SUDOSCAN_uS.MS.includes("(0)") ? "Normal" : "Anormal"}
                    </Badge>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Membres Inférieurs (MI)</p>
                    <p className="text-xl font-semibold">{report.otherMeasures.secretionSudorale_SUDOSCAN_uS.MI.split(" ")[0]}</p>
                    <Badge className="mt-1" variant="outline">
                      {report.otherMeasures.secretionSudorale_SUDOSCAN_uS.MI.includes("(0)") ? "Normal" : "Anormal"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Interprétation</CardTitle>
              <CardDescription>{report.interpretation.quality}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{report.interpretation.generalFindings}</p>

              <h3 className="font-semibold mb-2">Résultats clés</h3>
              <ul className="space-y-2 pl-4 list-disc">
                {report.interpretation.keyResults.map((result, index) => (
                  <li key={index} className="text-sm">{result}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">Conclusion</h3>
            <p className="text-sm text-blue-900">{report.overallConclusion}</p>
            <p className="mt-4 text-right text-xs text-blue-700">Dr. {report.signature}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
