// src/components/historique/medical-history-timeline.tsx
import type { MedicalEvent } from "@/data/types";
import { MedicalEventCard } from "./medical-event-card";

interface MedicalHistoryTimelineProps {
  events: MedicalEvent[];
}

export function MedicalHistoryTimeline({ events }: MedicalHistoryTimelineProps) {
  // Sort events: by year if number, or keep original order for string "years"
  // This simple sort might need refinement if "year" strings are complex
  const sortedEvents = [...events].sort((a, b) => {
    const yearA = typeof a.year === 'number' ? a.year : Number.POSITIVE_INFINITY; // Push strings to end or handle differently
    const yearB = typeof b.year === 'number' ? b.year : Number.POSITIVE_INFINITY;
    if (yearA !== Number.POSITIVE_INFINITY && yearB !== Number.POSITIVE_INFINITY) {
      return yearA - yearB;
    }
    // Basic sort for string years like "12 ans", "15 ans" if they are consistent
    if (typeof a.year === 'string' && typeof b.year === 'string') {
        const numA = Number.parseInt(a.year.split(' ')[0]);
        const numB = Number.parseInt(b.year.split(' ')[0]);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    }
    return 0; // Keep original order for mixed or complex strings
  });


  return (
    <div className="relative pl-8 ">
      {/* Vertical line for the timeline */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-full ml-[calc(0.375rem-0.5px)]"></div>

      <div className="space-y-12">
        {sortedEvents.map((event, index) => (
          <div key={index} className="relative">
            {/* Dot on the timeline */}
            <div className="absolute -left-[calc(0.375rem+4px)] top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-card"></div>
            <MedicalEventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}