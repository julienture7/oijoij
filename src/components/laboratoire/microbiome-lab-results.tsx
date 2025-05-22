"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// Removed Accordion imports as they are not used in the final version of this snippet
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { getStatusBadgeColor, getStatusColor } from "@/lib/lab-utils"; // Added getStatusColor
import type { LabTest, MicrobiomeLabReport, BiomesightSummary } from "@/data/types"; // Added BiomesightSummary

interface MicrobiomeLabResultsProps {
  className?: string;
}

export function MicrobiomeLabResults({ className }: MicrobiomeLabResultsProps) {
  const [reports, setReports] = useState<MicrobiomeLabReport[]>([]);
  const [biomesightSummary, setBiomesightSummary] = useState<BiomesightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [reportsResponse, summaryResponse] = await Promise.all([
          fetch('/data/microbiome-lab-results.json'),
          fetch('/data/biomesight-summary.json')
        ]);

        if (!reportsResponse.ok) throw new Error(`Failed to fetch microbiome lab results: ${reportsResponse.statusText}`);
        const reportsData = await reportsResponse.json();
        const sortedReportsData = [...(reportsData as MicrobiomeLabReport[])].sort(
          (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
        );
        setReports(sortedReportsData);

        if (!summaryResponse.ok) throw new Error(`Failed to fetch Biomesight summary: ${summaryResponse.statusText}`);
        const summaryData = await summaryResponse.json();
        setBiomesightSummary(summaryData as BiomesightSummary);

      } catch (err) {
        console.error("Error fetching microbiome data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to map interpretation to status for Biomesight Key Bacteria
  const mapInterpretationToStatus = (interpretation: string | undefined): LabTest['status'] => {
    if (!interpretation) return undefined;
    switch (interpretation.toLowerCase()) {
      case 'optimal':
      case 'normal':
        return 'normal';
      case 'low':
        return 'low';
      case 'high':
        return 'high';
      case 'slightly low':
      case 'slightly high':
        return 'borderline';
      default:
        return undefined;
    }
  };


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

  if (error) { // Simplified error check, can be expanded for no reports AND no summary
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (reports.length === 0 && !biomesightSummary) {
     return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Microbiome reports and summary are not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedReports = reports; // Already sorted in useEffect

  return (
    <div className={className}>
      {/* Biomesight Summary Card */}
      {biomesightSummary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Résumé Biomesight</CardTitle>
            <CardDescription>
              Aperçu global de votre santé intestinale basé sur le rapport Biomesight du {format(new Date(biomesightSummary.reportDate), "dd/MM/yyyy")}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gut Wellness Score from Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Score de Santé Intestinale (Biomesight)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          biomesightSummary.gutWellnessScore.value > 75 ? "hsl(var(--health-normal))" :
                          biomesightSummary.gutWellnessScore.value > 50 ? "hsl(var(--health-caution))" :
                          "hsl(var(--health-abnormal))"
                        }
                        strokeWidth="10"
                        strokeDasharray={`${(biomesightSummary.gutWellnessScore.value / 100) * 283} 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-bold">{biomesightSummary.gutWellnessScore.value.toFixed(2)}</span>
                      <span className="text-xl">/100</span>
                      <p className={`text-sm font-medium mt-1 ${getStatusColor(mapInterpretationToStatus(biomesightSummary.gutWellnessScore.status))}`}>
                        {biomesightSummary.gutWellnessScore.status}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Indicators from Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Indicateurs Généraux (Biomesight)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Diversité", value: biomesightSummary.diversity },
                    { name: "Probiotiques", value: biomesightSummary.probiotics },
                    { name: "Commensaux", value: biomesightSummary.commensals },
                    { name: "Pathobiontes", value: biomesightSummary.pathobionts },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center p-3 border rounded-lg">
                      <span className="text-sm text-muted-foreground mb-1">{item.name}</span>
                      <span className="text-2xl font-bold">
                        {item.value.toFixed(2)}%
                      </span>
                      {/* Basic status based on value - can be refined */}
                      <Badge className="mt-1" variant={item.value > 75 ? "outline" : item.value > 50 ? "secondary" : "destructive"}>
                         {item.value > 75 ? "Bon" : item.value > 50 ? "Moyen" : "Bas"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Key Bacteria from Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bactéries Clés (Biomesight)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Bactérie</th>
                        <th className="text-center p-2">Valeur</th>
                        <th className="text-center p-2">Plage Réf.</th>
                        <th className="text-center p-2">Interprétation</th>
                        <th className="text-center p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {biomesightSummary.keyBacteria.map((bact, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="p-2 text-sm">{bact.name}</td>
                          <td className="p-2 text-sm text-center">{bact.value}</td>
                          <td className="p-2 text-sm text-center text-muted-foreground">{bact.range}</td>
                          <td className="p-2 text-sm text-center">
                            <Badge variant="outline" className={getStatusBadgeColor(mapInterpretationToStatus(bact.interpretation))}>
                              {bact.interpretation}
                            </Badge>
                          </td>
                           <td className="p-2 text-sm text-center">{bact.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations from Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommandations (Biomesight)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-md">Aliments à ajouter :</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {biomesightSummary.recommendations.foodToAdd.map((food, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{food}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-md">Aliments à réduire :</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {biomesightSummary.recommendations.foodToReduce.map((food, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">{food}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-md">Probiotiques à ajouter :</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {biomesightSummary.recommendations.probioticsToAdd.map((probio, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{probio}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Existing Microbiome Reports section */}
      {reports.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Analyses Détaillées du Microbiome</CardTitle>
            <CardDescription>
              Résultats des différentes analyses de votre microbiome intestinal
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
                  {/* ... rest of the existing report section rendering ... */}
                  {report.sections.map((section, sectionIndex) => {
                    // For Biomesight Gut Wellness Score, create a custom visualization
                    if (report.reportName.toLowerCase().includes("biomesight") && section.sectionName === "Gut Wellness Score" && section.tests[0]) {
                      const scoreTest = section.tests[0];
                      const score = typeof scoreTest.value === 'number' ? scoreTest.value : parseFloat(String(scoreTest.value));
                      const scoreStatus = mapInterpretationToStatus(scoreTest.comment || scoreTest.status as string);

                      return (
                        <Card key={`${report.reportDate}-gutwellness`} className="mb-4">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Score de Santé Intestinale ({report.labName})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col items-center">
                              <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke={ // Use getStatusColor for consistency, though direct HSL is also themed
                                      scoreStatus === "normal" ? "hsl(var(--health-normal))" : // Already good
                                      scoreStatus === "borderline" ? "hsl(var(--health-caution))" : // Already good
                                      "hsl(var(--health-abnormal))" // Already good
                                    }
                                    strokeWidth="10"
                                    strokeDasharray={`${(score / 100) * 283} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                  />
                                </svg>
                                <div className="absolute text-center">
                                  <span className="text-3xl font-bold">{score.toFixed(2)}</span>
                                  <span className="text-xl">/100</span>
                                  {scoreTest.comment && (
                                     <p className={`text-sm font-medium mt-1 ${getStatusColor(scoreStatus) || 'text-foreground'}`}>
                                        {scoreTest.comment}
                                     </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    // For Overall Indicators from Biomesight report
                    if (report.reportName.toLowerCase().includes("biomesight") && section.sectionName === "Overall Indicators") {
                      return (
                        <Card key={`${report.reportDate}-overallindicators`} className="mb-4">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Indicateurs Généraux ({report.labName})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {section.tests.map((test, idx) => (
                                <div key={idx} className="flex flex-col items-center p-3 border rounded-lg">
                                  <span className="text-sm text-muted-foreground mb-1">{test.name}</span>
                                  {/* Ensure getStatusColor returns a valid class, provide fallback */}
                                  <span className={`text-2xl font-bold ${getStatusColor(test.status as LabTest['status']) || 'text-foreground'}`}>
                                    {test.value}{test.unit === "%" ? "%" : ""}
                                  </span>
                                  <Badge variant="outline" className={`mt-1 ${getStatusBadgeColor(test.status as LabTest['status'])}`}>
                                    {test.status === "normal" ? "Normal" :
                                     test.status === "borderline" ? "Limite" :
                                     test.status === "abnormal" && test.comment === "POOR" ? "Pauvre" : // Custom case for "POOR"
                                     test.status ? test.status.charAt(0).toUpperCase() + test.status.slice(1) : "N/A"}
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
                      const chartData = section.tests
                        .filter(test => test.name !== "Non classés" && !test.name.includes("Rapport"))
                        .map(test => ({
                          name: test.name,
                          value: typeof test.value === 'string' ? parseFloat(test.value) : test.value as number,
                          status: test.status as LabTest['status']
                        }));

                      return (
                        <Card key={`${report.reportDate}-phyla`} className="mb-4">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Distribution des Phyla ({report.labName})</CardTitle>
                            <CardDescription>
                              Répartition en pourcentage des principales familles bactériennes
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                  <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
                                  <YAxis type="category" dataKey="name" width={100} interval={0} tick={{fontSize: '10px'}}/>
                                  <Tooltip formatter={(value) => [`${value}%`, "Pourcentage"]} />
                                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {chartData.map((entry, index) => {
                                    let fillColor = 'hsl(var(--muted))'; // Default for undefined status
                                    if (entry.status === 'normal') fillColor = 'hsl(var(--health-normal))';
                                    else if (entry.status === 'low') fillColor = 'hsl(var(--health-caution))';
                                    else if (entry.status === 'high') fillColor = 'hsl(var(--health-abnormal))';
                                    //  'borderline' could also map to caution or a specific color
                                    else if (entry.status === 'borderline') fillColor = 'hsl(var(--health-caution))'; 

                                    return (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={fillColor}
                                      />
                                    );
                                  })}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                             <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 text-xs text-center gap-1">
                                <div className="flex items-center justify-center gap-1"><span className="h-3 w-3 rounded-full" style={{backgroundColor: 'hsl(var(--health-normal))'}}></span>Normal</div>
                              <div className="flex items-center justify-center gap-1"><span className="h-3 w-3 rounded-full" style={{backgroundColor: 'hsl(var(--health-caution))'}}></span>Bas/Limite</div>
                                <div className="flex items-center justify-center gap-1"><span className="h-3 w-3 rounded-full" style={{backgroundColor: 'hsl(var(--health-abnormal))'}}></span>Élevé</div>
                                <div className="flex items-center justify-center gap-1"><span className="h-3 w-3 rounded-full" style={{backgroundColor: 'hsl(var(--muted))'}}></span>Indéfini</div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    // Default section display for other reports or sections
                    return (
                      <Card key={`${report.reportDate}-${sectionIndex}`} className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{section.sectionName} ({report.labName})</CardTitle>
                          {section.summary && (
                            <CardDescription>{section.summary}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Test</th>
                                  <th className="text-right p-2">Valeur</th>
                                  <th className="text-right p-2">Unité</th>
                                  <th className="text-right p-2">Réf.</th>
                                  <th className="text-center p-2">Statut</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.tests.map((test, testIndex) => (
                                  <tr key={testIndex} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="p-2 text-sm">{test.name}</td>
                                    {/* Ensure getStatusColor provides a fallback for undefined status */}
                                    <td className={`p-2 text-right text-sm font-medium ${getStatusColor(test.status as LabTest['status']) || 'text-foreground'}`}>
                                      {String(test.value) !== "N.D." ? String(test.value) : "N.D."}
                                    </td>
                                    <td className="p-2 text-right text-sm text-muted-foreground">{test.unit || ''}</td>
                                    <td className="p-2 text-right text-sm text-muted-foreground">{test.referenceRange || 'N/A'}</td>
                                    <td className="p-2 text-center">
                                      {test.status && (
                                        <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(test.status as LabTest["status"])}`}>
                                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
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
      )}
    </div>
  );
}
