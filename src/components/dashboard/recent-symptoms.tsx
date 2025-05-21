"use client";

import { Badge } from "@/components/ui/badge";
import type { CurrentSymptomEntry } from "@/data/types"; // Import your type
import { Card, CardContent } from "@/components/ui/card";


interface RecentSymptomsProps {
  symptomEntry?: CurrentSymptomEntry; // Make it optional
}

export function RecentSymptoms({ symptomEntry }: RecentSymptomsProps) {
  if (!symptomEntry) {
    return <p className="text-muted-foreground">Aucune donnée de symptôme actuelle à afficher.</p>;
  }

  return (
    <div className="space-y-2">
        <ul className="list-disc list-inside space-y-1 text-sm">
            {symptomEntry.symptoms.map((symptom, idx) => (
            <li key={idx} className="text-muted-foreground">
                {symptom.description}
                {symptom.details && <span className="font-semibold text-foreground"> ({symptom.details})</span>}
            </li>
            ))}
        </ul>
    </div>
  );
}