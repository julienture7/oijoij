// src/app/laboratoire/page.tsx
import { LabResultsHeader } from "@/components/laboratoire/lab-results-header";
import { LabReportCard } from "@/components/laboratoire/lab-report-card";
import allLabReportsData from "@/data/lab-results.json";
import type { LabReport } from "@/data/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupLabReportsByYear, getUniqueReportCategories } from "@/lib/lab-utils";

export default function LabResultsPage() {
  const reports = allLabReportsData as LabReport[];
  const reportsByYear = groupLabReportsByYear(reports);
  const reportCategories = getUniqueReportCategories(reports);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <LabResultsHeader />
      <Tabs defaultValue="by-date" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-date">Par date</TabsTrigger>
          <TabsTrigger value="by-category">Par catégorie</TabsTrigger>
        </TabsList>
        <TabsContent value="by-date" className="space-y-4">
          {Object.keys(reportsByYear)
            .sort((a, b) => Number(b) - Number(a)) // Sort years descending
            .map((year) => (
              <Card key={year}>
                <CardHeader>
                  <CardTitle>{year}</CardTitle>
                  <CardDescription>
                    {reportsByYear[year].length} rapport(s) de laboratoire
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reportsByYear[year]
                    .sort(
                      (a, b) =>
                        new Date(b.reportDate).getTime() -
                        new Date(a.reportDate).getTime()
                    )
                    .map((report) => (
                      <LabReportCard key={report.reportName} report={report} />
                    ))}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="by-category" className="space-y-4">
          {reportCategories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {
                    reports.filter((r) => r.reportName.includes(category))
                      .length
                  }{" "}
                  rapport(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports
                  .filter((r) => r.reportName.includes(category))
                  .sort(
                    (a, b) =>
                      new Date(b.reportDate).getTime() -
                      new Date(a.reportDate).getTime()
                  )
                  .map((report) => (
                    <LabReportCard key={report.reportName} report={report} />
                  ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
