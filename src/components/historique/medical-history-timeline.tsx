// src/components/historique/medical-history-timeline.tsx
import type { MedicalEvent } from "@/data/types";
import { MedicalEventCard } from "./medical-event-card";

interface MedicalHistoryTimelineProps {
  events: MedicalEvent[];
}

// Helper function to parse year/age strings for sorting
function parseYearForSorting(year: string | number): number {
  if (typeof year === 'number') {
    return year;
  }
  if (typeof year === 'string') {
    // Handle "X ans"
    const ageMatch = year.match(/^(\d+)\s*an(s)?$/i);
    if (ageMatch && ageMatch[1]) {
      return parseInt(ageMatch[1], 10);
    }
    // Handle "X-Y ans" - use the lower bound
    const ageRangeMatch = year.match(/^(\d+)-(\d+)\s*an(s)?$/i);
    if (ageRangeMatch && ageRangeMatch[1]) {
      return parseInt(ageRangeMatch[1], 10);
    }
    // Try to parse as a plain number (year) if it's a string like "2023"
    const directNumberMatch = year.match(/^\d{4}$/);
     if (directNumberMatch) {
        const num = parseInt(year, 10);
        if (!isNaN(num)) return num;
    }
  }
  // For purely descriptive strings or unparseable formats, place them at the end.
  // Consider a secondary sorting key if these need specific ordering among themselves.
  return Number.POSITIVE_INFINITY;
}

export function MedicalHistoryTimeline({ events }: MedicalHistoryTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => {
    const valA = parseYearForSorting(a.year);
    const valB = parseYearForSorting(b.year);

    // If both are descriptive or unparseable, maintain original relative order or sort by title
    if (valA === Number.POSITIVE_INFINITY && valB === Number.POSITIVE_INFINITY) {
      // Optionally, add secondary sort criterion here, e.g., by title
      // For now, keep original relative order for these specific cases
      return 0; 
    }
    
    return valA - valB;
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