"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link"; // Added for filePath

import { getStatusBadgeColor, getStatusColor } from "@/lib/lab-utils"; // Added getStatusColor
import type { LabTest, MycotoxinLabReport } from "@/data/types";

interface MycotoxinLabResultsProps {
  className?: string;
}

export function MycotoxinLabResults({ className }: MycotoxinLabResultsProps) {
  const [reportData, setReportData] = useState<MycotoxinLabReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/mycotoxin-lab-results.json');
        if (!response.ok) throw new Error(`Failed to fetch mycotoxin lab results: ${response.statusText}`);
        const data = await response.json();
        // Assuming mycotoxinLabData is an array and we need the first element
        if (Array.isArray(data) && data.length > 0) {
          setReportData(data[0] as MycotoxinLabReport);
        } else if (!Array.isArray(data)) {
          setReportData(data as MycotoxinLabReport);
        } else {
          throw new Error("Mycotoxin lab data is empty or not in expected format");
        }
      } catch (err) {
        console.error("Error fetching mycotoxin lab results:", err);
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
            <CardTitle>Loading Mycotoxin Results...</CardTitle>
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
            <p>{error || "Mycotoxin report data is not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the fetched report data
  const report = reportData;

  // Count normal and abnormal tests
  const testSummary = report.sections.reduce(
    (acc, section) => {
      section.tests.forEach(test => {
        // Ensure status is one of the expected values before incrementing
        if (test.status === "high" || test.status === "abnormal" || test.status === "positive") {
          acc.abnormal++;
        } else if (test.status === "normal" || test.status === "negative") {
          acc.normal++;
        } else {
          // Optionally handle other statuses or count them as 'other'
          acc.other++;
        }
      });
      return acc;
    },
    { normal: 0, abnormal: 0, other: 0 }
  );

  const pieData = [
    { name: "Normal", value: testSummary.normal, color: "hsl(var(--health-normal))" },
    { name: "Élevé/Anormal", value: testSummary.abnormal, color: "hsl(var(--health-abnormal))" }
  ];
  if (testSummary.other > 0) {
    pieData.push({ name: "Autre", value: testSummary.other, color: "hsl(var(--muted-foreground))"});
  }


  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">{report.reportName}</CardTitle>
              <CardDescription>
                Analyse de mycotoxines du {format(new Date(report.reportDate), "dd/MM/yyyy")}
                {report.receptionNumber && <span className="ml-2 text-xs"> (Réf: {report.receptionNumber})</span>}
              </CardDescription>
            </div>
            {report.filePath && (
               <Link href={`/labs/${report.filePath.split(';')[0]}`} target="_blank" legacyBehavior>
                <a className="text-sm text-primary hover:underline whitespace-nowrap">Voir PDF original</a>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Résumé des résultats</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-sm text-center">
                    {testSummary.abnormal > 0 ? (
                      <span className={`font-medium ${getStatusColor("high")}`}>
                        {testSummary.abnormal} mycotoxine{testSummary.abnormal > 1 ? "s" : ""} élevée{testSummary.abnormal > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className={`font-medium ${getStatusColor("normal")}`}>Tous les résultats sont normaux</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Détails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="text-sm font-medium">{report.patientDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de naissance</p>
                      <p className="text-sm font-medium">{format(new Date(report.patientDetails.dob), "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sexe</p>
                      <p className="text-sm font-medium">{report.patientDetails.sex === "M" ? "Masculin" : "Féminin"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Laboratoire</p>
                      <p className="text-sm font-medium">{report.labName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Médecin</p>
                      <p className="text-sm font-medium">{report.doctor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date du prélèvement</p>
                      <p className="text-sm font-medium">{format(new Date(report.samplingDate), "dd/MM/yyyy")}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Créatinine</p>
                      <p className="text-sm font-medium">{report.creatinineValue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            {report.sections.map((section, sIndex) => (
              <Card key={sIndex} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-2">
                  <CardTitle className="text-lg">
                    {section.sectionName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Mycotoxine</th>
                          <th className="text-right pb-2">Valeur</th>
                          <th className="text-right pb-2">Plage normale</th>
                          <th className="text-center pb-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.tests.map((test, tIndex) => (
                          <tr key={tIndex} className="border-b last:border-0">
                            <td className="py-3 font-medium">{test.name}</td>
                            <td className={`py-3 text-right font-semibold ${getStatusColor(test.status as LabTest["status"])}`}>
                                {test.value} {test.unit}
                            </td>
                            <td className="py-3 text-right text-muted-foreground">{test.referenceRange}</td>
                            <td className="py-3 text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getStatusBadgeColor(test.status as LabTest["status"])}`}
                              >
                                {test.status === "normal" || test.status === "negative" ? "Normal" : 
                                 test.status === "high" || test.status === "positive" || test.status === "abnormal" ? "Élevé" :
                                 test.status ? test.status.charAt(0).toUpperCase() + test.status.slice(1) : "N/A"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {report.labComments && report.labComments.length > 0 && (
             <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Commentaires du laboratoire</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  {report.labComments.map((comment, idx) => (
                    <li key={idx}>{comment}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {Object.keys(report.interpretiveInformation).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Interprétation des Mycotoxines</CardTitle>
                <CardDescription>
                  Informations sur les mycotoxines potentiellement détectées et leurs implications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(report.interpretiveInformation).map(([toxin, info], index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="font-medium text-primary/90 hover:no-underline">
                        {toxin}
                      </AccordionTrigger>
                      <AccordionContent className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-muted-foreground">
                        <p>{info}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {report.overallConclusion && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Conclusion Générale</h3>
              <p className="text-sm text-primary/80">{report.overallConclusion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
