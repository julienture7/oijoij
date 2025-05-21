import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import patientProfile from "@/../public/data/patient-profile.json";
import currentStatus from "@/../public/data/current-status.json";
import bloodLabResults from "@/../public/data/blood-lab-results.json";
import microbiomeResults from "@/../public/data/microbiome-lab-results.json";
import medicalHistory from "@/../public/data/medical-history.json";

// Simple typings for the imported JSON (use any to keep it light)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateHealthReportPdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let cursorY = 40;

  const title = `Patient Health Summary – ${patientProfile.firstName} ${patientProfile.lastName}`;
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 30;

  // Patient details section
  doc.setFontSize(14);
  doc.text("Patient Information", marginX, cursorY);
  cursorY += 16;
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX },
    body: [
      ["Name", `${patientProfile.firstName} ${patientProfile.lastName}`],
      ["DOB", patientProfile.dateOfBirth],
      ["Gender", patientProfile.gender],
      ["Blood Type", patientProfile.bloodType ?? "N/A"],
    ],
    theme: "grid",
    styles: { halign: "left" },
    head: [],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Current status
  doc.text("Current Status", marginX, cursorY);
  cursorY += 16;
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX },
    body: Object.entries(currentStatus).map(([k, v]) => [k, String(v)]),
    theme: "grid",
    styles: { halign: "left" },
    head: [],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Blood lab results (most recent 10)
  doc.text("Blood Lab Results", marginX, cursorY);
  cursorY += 16;
  const bloodRows = bloodLabResults.slice(0, 10).map((test: any) => [test.testName, test.result, test.units, test.referenceRange]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX },
    head: [["Test", "Result", "Units", "Ref Range"]],
    body: bloodRows,
    styles: { fontSize: 8 },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Microbiome summary rows
  doc.text("Microbiome Results (Top 5)", marginX, cursorY);
  cursorY += 16;
  const microRows = microbiomeResults.slice(0, 5).map((row: any) => [row.bacteria, row.relative_abundance + "%"]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX },
    head: [["Bacteria", "Rel. Abundance"]],
    body: microRows,
    styles: { fontSize: 8 },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Medical history timeline summary
  doc.text("Medical History (latest 5)", marginX, cursorY);
  cursorY += 16;
  const historyRows = medicalHistory.slice(0, 5).map((event: any) => [event.date, event.title, event.description]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX },
    head: [["Date", "Title", "Description"]],
    body: historyRows,
    styles: { fontSize: 8 },
  });

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${patientProfile.firstName} ${patientProfile.lastName} – ${new Date().toLocaleDateString()}`, marginX, 820);
    doc.text(`Page ${i}/${pageCount}`, pageWidth - marginX, 820, { align: "right" });
  }

  doc.save(
    `${patientProfile.lastName}_${patientProfile.firstName}_health_summary_${new Date()
      .toISOString()
      .substring(0, 10)}.pdf`,
  );
}
