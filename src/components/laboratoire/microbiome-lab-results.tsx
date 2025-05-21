"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { getStatusBadgeColor } from "@/lib/lab-utils";
import type { LabTest, MicrobiomeLabReport } from "@/data/types";

interface MicrobiomeLabResultsProps {
  className?: string;
}

export function MicrobiomeLabResults({ className }: MicrobiomeLabResultsProps) {
  const [reports, setReports] = useState<MicrobiomeLabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/microbiome-lab-results.json');
        if (!response.ok) throw new Error(`Failed to fetch microbiome lab results: ${response.statusText}`);
        const data = await response.json();
        // Sort reports by date (newest first)
        const sortedData = [...(data as MicrobiomeLabReport[])].sort(
          (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
        );
        setReports(sortedData);
      } catch (err) {
        console.error("Error fetching microbiome lab results:", err);
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
            <CardTitle>Loading Microbiome Results...</CardTitle>
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
            <p>{error || "Microbiome reports are not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedReports = reports;

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Analyse du Microbiome Intestinal</CardTitle>
          <CardDescription>
            Résultats des analyses de votre microbiome intestinal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sortedReports[0]?.reportDate}>
            <TabsList className="mb-4 flex flex-wrap">
              {sortedReports.map((report) => (
                <TabsTrigger key={report.reportDate} value={report.reportDate} className="text-sm">
                  {format(new Date(report.reportDate), "dd/MM/yyyy")} - {report.reportName.substring(0, 15)}...
                </TabsTrigger>
              ))}
            </TabsList>

            {sortedReports.map((report) => (
              <TabsContent key={report.reportDate} value={report.reportDate} className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{report.reportName}</h2>
                  <p className="text-sm text-muted-foreground">{report.labName}</p>
                  {report.doctor && <p className="text-sm text-muted-foreground">Médecin: {report.doctor}</p>}
                </div>

                {report.sections.map((section, sectionIndex) => {
                  // For Biomesight Gut Wellness Score, create a custom visualization
                  if (section.sectionName === "Gut Wellness Score" && section.tests[0]) {
                    const score = section.tests[0].value as number;
                    return (
                      <Card key={sectionIndex} className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Score de Santé Intestinale</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#e2e8f0"
                                  strokeWidth="10"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke={score > 75 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444"}
                                  strokeWidth="10"
                                  strokeDasharray={`${(score / 100) * 283} 283`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 50 50)"
                                />
                              </svg>
                              <div className="absolute text-center">
                                <span className="text-3xl font-bold">{score}</span>
                                <span className="text-xl">/100</span>
                                <p className="text-sm font-medium mt-1 text-muted-foreground">
                                  {section.tests[0].comment || ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // For Overall Indicators from Biomesight
                  if (section.sectionName === "Overall Indicators") {
                    return (
                      <Card key={sectionIndex} className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Indicateurs Généraux</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {section.tests.map((test, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center p-3 border rounded-lg"
                              >
                                <span className="text-sm text-muted-foreground mb-1">{test.name}</span>
                                <span
                                  className={`text-2xl font-bold ${
                                    test.status === "normal"
                                      ? "text-green-500"
                                      : test.status === "borderline"
                                      ? "text-amber-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {test.value}
                                </span>
                                <Badge
                                  className="mt-1"
                                  variant={
                                    test.status === "normal"
                                      ? "outline"
                                      : test.status === "borderline"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {test.status === "normal"
                                    ? "Normal"
                                    : test.status === "borderline"
                                    ? "Limite"
                                    : "Anormal"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Create a bar chart for Phyla distribution
                  if (section.sectionName === "Microbiote intestinal - Phyla (distribution) (%)") {
                    // Exclude "Non classés" and "Rapport" entries
                    const chartData = section.tests
                      .filter(test => test.name !== "Non classés" && !test.name.includes("Rapport"))
                      .map(test => ({
                        name: test.name,
                        value: test.value as number,
                        status: test.status
                      }));

                    return (
                      <Card key={sectionIndex} className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Distribution des Phyla</CardTitle>
                          <CardDescription>
                            Répartition en pourcentage des principales familles bactériennes
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Tooltip
                                  formatter={(value) => [`${value}%`, "Pourcentage"]}
                                  labelFormatter={(label) => `${label}`}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {chartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.status === 'normal' ? '#10b981' :
                                            entry.status === 'high' ? '#ef4444' :
                                            entry.status === 'low' ? '#f59e0b' : '#94a3b8'}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 grid grid-cols-3 text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="h-3 w-3 rounded-full bg-green-500"></span>
                              <span>Normal</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                              <span>Bas</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="h-3 w-3 rounded-full bg-red-500"></span>
                              <span>Élevé</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Default section display
                  return (
                    <Card key={sectionIndex} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{section.sectionName}</CardTitle>
                        {section.summary && (
                          <CardDescription>{section.summary}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left pb-2">Test</th>
                                <th className="text-right pb-2">Valeur</th>
                                <th className="text-right pb-2">Ref. Range</th>
                                <th className="text-center pb-2">Statut</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.tests.map((test, testIndex) => (
                                <tr key={testIndex} className="border-b last:border-0">
                                  <td className="py-2 text-sm">{test.name}</td>
                                  <td className="py-2 text-right text-sm">
                                    {test.value !== "N.D." ? test.value : "N.D."} {test.unit}
                                  </td>
                                  <td className="py-2 text-right text-sm text-muted-foreground">
                                    {test.referenceRange}
                                  </td>
                                  <td className="py-2 text-center">
                                    {test.status && (
                                      <Badge variant="outline" className={getStatusBadgeColor(test.status as LabTest["status"])}>
                                        {test.status === "normal" ? "Normal" :
                                         test.status === "high" ? "Élevé" :
                                         test.status === "low" ? "Bas" :
                                         test.status === "borderline" ? "Limite" :
                                         test.status}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
