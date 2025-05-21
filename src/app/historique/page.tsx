// src/app/historique/page.tsx
import { MedicalHistoryTimeline } from "@/components/historique/medical-history-timeline";
import type { MedicalEvent } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy data for static export
const staticMedicalHistory: MedicalEvent[] = [
  {
    year: "2023",
    title: "Exemple d'événement médical",
    description: "Description de l'événement médical pour la version statique",
  },
];

export default function HistoriquePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Historique Médical</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chronologie des événements médicaux, diagnostics et découvertes.
          </p>
        </CardContent>
      </Card>

      <MedicalHistoryTimeline events={staticMedicalHistory} />
    </div>
  );
}
