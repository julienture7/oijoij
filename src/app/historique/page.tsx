// src/app/historique/page.tsx
"use client";

import { useEffect, useState } from "react";
import { MedicalHistoryTimeline } from "@/components/historique/medical-history-timeline";
import type { MedicalEvent } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * `HistoriquePage` component.
 * This page component fetches and displays the patient's medical history.
 * It handles loading and error states during data fetching.
 *
 * @component
 * @returns {React.ReactElement} The rendered medical history page.
 */
export default function HistoriquePage(): React.ReactElement {
  const [medicalHistory, setMedicalHistory] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches medical history data from the JSON endpoint.
     * Updates state with the fetched data, or sets an error state if fetching fails.
     */
    async function fetchMedicalHistory(): Promise<void> {
      try {
        setLoading(true); // Ensure loading is true at the start of fetch attempt
        setError(null); // Reset previous errors
        const response = await fetch("/data/medical-history.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MedicalEvent[] = await response.json();
        setMedicalHistory(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching medical history.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMedicalHistory();
  }, []); // Empty dependency array ensures this effect runs only once on mount

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

      {loading && <p className="text-center text-muted-foreground py-4">Chargement de l'historique médical...</p>}
      {error && <p className="text-center text-destructive py-4">Erreur: {error}</p>}
      {!loading && !error && medicalHistory.length > 0 && <MedicalHistoryTimeline events={medicalHistory} />}
      {!loading && !error && medicalHistory.length === 0 && <p className="text-center text-muted-foreground py-4">Aucun événement d'historique médical disponible.</p>}
    </div>
  );
}
