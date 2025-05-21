// src/components/laboratoire/lab-report-card.tsx
import type { LabReport, LabSection as LabSectionType, LabTest } from "@/data/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CalendarDays, UserCircle, Microscope } from "lucide-react";
import Link from "next/link";
import { getStatusColor, getStatusBadgeColor } from "@/lib/lab-utils";

interface LabReportCardProps {
  report: LabReport;
}

const LabTestRow = ({ test, level = 0 }: { test: LabTest, level?: number }) => (
  <>
    <TableRow className={level > 0 ? "bg-muted/30 hover:bg-muted/50" : ""}>
      <TableCell style={{ paddingLeft: `${1 + level * 1.5}rem` }} className="font-medium py-2.5">
        {test.name}
        {test.comment && <p className="text-xs text-muted-foreground italic mt-0.5">{test.comment}</p>}
      </TableCell>
      <TableCell className={`text-center font-semibold py-2.5 ${getStatusColor(test.status)}`}>
        {test.value !== null && test.value !== undefined ? String(test.value) : "N/A"}
      </TableCell>
      <TableCell className="text-center py-2.5">{test.unit || "---"}</TableCell>
      <TableCell className="text-center py-2.5">{test.referenceRange || "---"}</TableCell>
      <TableCell className="text-center py-2.5">
        {test.status && (
          <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(test.status)}`}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </Badge>
        )}
      </TableCell>
    </TableRow>
    {test.subTests && test.subTests.map((subTest, idx) => (
      <LabTestRow key={`${test.name}-sub-${idx}`} test={subTest} level={level + 1} />
    ))}
  </>
);


const LabSection = ({ section }: { section: LabSectionType }) => (
  <AccordionItem value={section.sectionName} className="border-b border-border">
    <AccordionTrigger className="py-3 text-md font-semibold hover:no-underline text-primary/90">
      <div className="flex items-center">
        <Microscope className="h-4 w-4 mr-2 text-primary/70" />
        {section.sectionName}
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-2 pb-0">
      {section.tests.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/60">
                <TableHead className="w-2/5 py-2.5">Test</TableHead>
                <TableHead className="text-center py-2.5">Valeur</TableHead>
                <TableHead className="text-center py-2.5">Unité</TableHead>
                <TableHead className="text-center py-2.5">Référence</TableHead>
                <TableHead className="text-center py-2.5">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.tests.map((test, idx) => (
                <LabTestRow key={idx} test={test} />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground px-4 py-2">Aucun test dans cette section.</p>
      )}
      {section.summary && (
        <p className="text-sm text-muted-foreground italic p-3 mt-2 bg-primary/5 rounded-md">{section.summary}</p>
      )}
    </AccordionContent>
  </AccordionItem>
);

export function LabReportCard({ report }: LabReportCardProps) {
  const reportDate = new Date(report.reportDate);

  // Determine default open accordion items - e.g., sections with abnormal results
  const defaultOpenItems = report.sections
    .filter(section => section.tests.some(test => test.status && test.status !== 'normal' && test.status !== 'negative'))
    .map(section => section.sectionName);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <CardHeader className="bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl flex items-center text-primary">
            <FileText size={24} className="mr-3 text-primary/80" />
            {report.reportName}
          </CardTitle>
          {report.filePath && (
            <Link href={`/labs/${report.filePath}`} target="_blank" legacyBehavior>
              <a className="text-xs text-primary hover:underline">Voir PDF original</a>
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2">
          <div className="flex items-center">
            <CalendarDays size={14} className="mr-1.5" />
            Date: {reportDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center">
            <UserCircle size={14} className="mr-1.5" />
            Laboratoire: {report.labName}
          </div>
          {report.doctor && (
            <div className="flex items-center">
              <UserCircle size={14} className="mr-1.5" /> {/* Consider a different icon for doctor */}
              Prescripteur/Valideur: {report.doctor}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {report.sections.length > 0 ? (
          <Accordion type="multiple" defaultValue={defaultOpenItems} className="w-full">
            {report.sections.map((section, idx) => (
              <LabSection key={idx} section={section} />
            ))}
          </Accordion>
        ) : (
          <p className="p-6 text-muted-foreground">Aucune section de résultats dans ce rapport.</p>
        )}
      </CardContent>
    </Card>
  );
}