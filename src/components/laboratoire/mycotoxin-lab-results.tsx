"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { getStatusBadgeColor } from "@/lib/lab-utils";
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
        if (test.status === "high") acc.abnormal++;
        else if (test.status === "normal") acc.normal++;
      });
      return acc;
    },
    { normal: 0, abnormal: 0 }
  );

  const pieData = [
    { name: "Normal", value: testSummary.normal, color: "#10b981" },
    { name: "Élevé", value: testSummary.abnormal, color: "#ef4444" }
  ];

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{report.reportName}</CardTitle>
          <CardDescription>
            Analyse de mycotoxines du {format(new Date(report.reportDate), "dd/MM/yyyy")}
          </CardDescription>
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
                      <Tooltip formatter={(value) => [value, "Tests"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-sm text-center">
                    {testSummary.abnormal > 0 ? (
                      <span className="font-medium text-destructive">
                        {testSummary.abnormal} mycotoxine{testSummary.abnormal > 1 ? "s" : ""} élevée{testSummary.abnormal > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="font-medium text-green-600">Tous les résultats sont normaux</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Détails du patient</CardTitle>
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
                            <td className="py-3">{test.name}</td>
                            <td className="py-3 text-right">{test.value} {test.unit}</td>
                            <td className="py-3 text-right text-muted-foreground">{test.referenceRange}</td>
                            <td className="py-3 text-center">
                              <Badge
                                variant="outline"
                                className={getStatusBadgeColor(test.status as LabTest["status"])}
                              >
                                {test.status === "normal" ? "Normal" : "Élevé"}
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

          {Object.keys(report.interpretiveInformation).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Informations Interprétatives</CardTitle>
                <CardDescription>
                  Détails sur la signification des mycotoxines détectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {Object.entries(report.interpretiveInformation).map(([toxin, info], index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="font-semibold">{toxin}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm whitespace-pre-line">{info}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {report.overallConclusion && (
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <h3 className="font-semibold mb-2">Conclusion</h3>
              <p>{report.overallConclusion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
