// src/components/historique/medical-event-card.tsx
import type { MedicalEvent } from "@/data/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, FileText, Microscope, StickyNote, Stethoscope, Syringe, Pill, Brain, Bone } from "lucide-react";

interface MedicalEventCardProps {
  event: MedicalEvent;
}

const getIconForTitle = (title: string) => {
  if (title.toLowerCase().includes("traitement")) return <Pill className="mr-2 h-5 w-5 text-primary" />;
  if (title.toLowerCase().includes("symptom") || title.toLowerCase().includes("problème")) return <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />;
  if (title.toLowerCase().includes("imagerie") || title.toLowerCase().includes("scanner") || title.toLowerCase().includes("irm")) return <FileText className="mr-2 h-5 w-5 text-blue-500" />;
  if (title.toLowerCase().includes("lab") || title.toLowerCase().includes("sanguin") || title.toLowerCase().includes("analyse")) return <Microscope className="mr-2 h-5 w-5 text-green-500" />;
  if (title.toLowerCase().includes("découverte")) return <CheckCircle className="mr-2 h-5 w-5 text-teal-500" />;
  if (title.toLowerCase().includes("note")) return <StickyNote className="mr-2 h-5 w-5 text-yellow-500" />;
  if (title.toLowerCase().includes("neurologique") || title.toLowerCase().includes("cognitif")) return <Brain className="mr-2 h-5 w-5 text-purple-500" />;
  if (title.toLowerCase().includes("musculo-squelettique") || title.toLowerCase().includes("articulation")) return <Bone className="mr-2 h-5 w-5 text-orange-500" />;


  return <Stethoscope className="mr-2 h-5 w-5 text-primary" />;
}

export function MedicalEventCard({ event }: MedicalEventCardProps) {
  return (
    <Card className="ml-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
                {getIconForTitle(event.title)}
                {event.title}
            </CardTitle>
            <Badge variant="outline" className="text-sm font-semibold">{typeof event.year === 'number' ? event.year : event.year}</Badge>
        </div>
        {event.description && <CardDescription className="pt-2">{event.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {event.details && event.details.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2 text-primary/80">Détails :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {event.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        {event.labSummary && (
          <div>
            <h4 className="font-semibold text-md mb-2 text-green-600 dark:text-green-400">Résumé Laboratoire :</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{event.labSummary}</p>
          </div>
        )}

        {event.discoveries && event.discoveries.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2 text-teal-600 dark:text-teal-400">Découvertes :</h4>
            <div className="space-y-3">
              {event.discoveries.map((discovery, i) => (
                <div key={i} className="p-3 border rounded-md bg-primary/5">
                  <p className="font-medium text-primary">{discovery.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{discovery.description}</p>
                  {discovery.details && discovery.details.length > 0 && (
                     <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground/80 mt-2 pl-4">
                        {discovery.details.map((d, idx) => <li key={idx}>{d}</li>)}
                     </ul>
                  )}
                  {discovery.outcome && <p className="text-xs italic text-primary/70 mt-2">{discovery.outcome}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {event.imaging && event.imaging.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2 text-blue-600 dark:text-blue-400">Imagerie :</h4>
            <div className="space-y-3">
              {event.imaging.map((img, i) => (
                <div key={i} className="p-3 border rounded-md bg-blue-500/5">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-blue-700 dark:text-blue-300">{img.type} - {img.location}</p>
                    <Badge variant="secondary" className="text-xs">{new Date(img.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{img.clinic}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Indication:</span> {img.indication}</p>
                  {img.results && img.results.length > 0 && (
                    <>
                      <p className="text-sm font-medium mt-2">Résultats :</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground/90 pl-4">
                        {img.results.map((res, idx) => <li key={idx}>{res}</li>)}
                      </ul>
                    </>
                  )}
                  <p className="text-sm mt-2"><span className="font-medium">Conclusion:</span> {img.conclusion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.treatments && event.treatments.length > 0 && (
           <div>
            {/* Group treatments by positive/negative if needed, or list them all */}
            {/* This example lists them under one heading, you can refine */}
            <h4 className="font-semibold text-md mb-2 text-purple-600 dark:text-purple-400">Réponses aux Traitements :</h4>
            <div className="space-y-3">
              {event.treatments.map((treatment, i) => (
                <div key={i} className={`p-3 border rounded-md ${treatment.positive ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                  <div className="flex items-center">
                    {treatment.positive ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                    <p className="font-medium">{treatment.name}</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-1 pl-4">
                    {treatment.effects.map((effect, idx) => <li key={idx}>{effect}</li>)}
                  </ul>
                  {treatment.notes && <p className="text-xs italic text-muted-foreground/80 mt-2">{treatment.notes}</p>}
                </div>
              ))}
            </div>
           </div>
        )}

        {event.notes && event.notes.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2 text-yellow-600 dark:text-yellow-400">Notes Diverses :</h4>
             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
              {event.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}


        {/* Placeholder for future lab results directly linked to an event if needed */}
        {/* {event.labResults && event.labResults.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">Résultats de Laboratoire Associés :</h4>
            <p className="text-sm text-muted-foreground">TODO: Display linked lab results</p>
          </div>
        )} */}
      </CardContent>
      {/* Optional Footer
      <CardFooter>
        <p className="text-xs text-muted-foreground">Event recorded on...</p>
      </CardFooter>
      */}
    </Card>
  );
}