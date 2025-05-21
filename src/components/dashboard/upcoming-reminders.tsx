"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format, isToday, addDays } from "date-fns";
import { Pill, CalendarClock, AlertCircle } from "lucide-react";

// Mock data for reminders
const mockReminders = [
  {
    type: "medication",
    name: "Lisinopril",
    dosage: "10mg",
    instruction: "Once daily",
    date: new Date(),
    time: "8:00 AM",
    refillRemaining: 5,
  },
  {
    type: "medication",
    name: "Atorvastatin",
    dosage: "20mg",
    instruction: "Once daily at bedtime",
    date: new Date(),
    time: "9:00 PM",
    refillRemaining: 12,
  },
  {
    type: "appointment",
    name: "Dr. Johnson",
    specialty: "Cardiologist",
    date: addDays(new Date(), 3),
    time: "2:30 PM",
    location: "Medical Center, Room 304",
  },
  {
    type: "labwork",
    name: "Quarterly Blood Panel",
    date: addDays(new Date(), 7),
    time: "10:00 AM",
    location: "Lab Services, 2nd Floor",
    fasting: true,
  },
];

export function UpcomingReminders() {
  return (
    <div className="space-y-4">
      {mockReminders.map((reminder, index) => {
        const isUpcoming = isToday(reminder.date);
        const dateFormatted = format(reminder.date, "MMM d");

        return (
          <div key={index} className="flex items-start gap-3 p-2">
            {reminder.type === "medication" && (
              <div className="bg-medical-teal-light rounded-full p-2">
                <Pill className="h-4 w-4 text-medical-teal" />
              </div>
            )}
            {reminder.type === "appointment" && (
              <div className="bg-medical-indigo-light rounded-full p-2">
                <CalendarClock className="h-4 w-4 text-medical-indigo" />
              </div>
            )}
            {reminder.type === "labwork" && (
              <div className="bg-medical-purple-light rounded-full p-2">
                <AlertCircle className="h-4 w-4 text-medical-purple" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {reminder.name}
                  {reminder.type === "medication" && (
                    <span className="text-muted-foreground ml-1">{reminder.dosage}</span>
                  )}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-xs ${isUpcoming ? "bg-health-caution-bg text-health-caution" : "bg-muted"}`}
                >
                  {isUpcoming ? "Today" : dateFormatted}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {reminder.time} • {reminder.type === "medication"
                  ? reminder.instruction
                  : reminder.location
                }
              </div>

              {reminder.type === "medication" && (
                <div className="text-xs mt-2">
                  <span className={reminder.refillRemaining <= 5 ? "text-health-abnormal" : ""}>
                    Refills remaining: {reminder.refillRemaining}
                  </span>
                </div>
              )}

              {reminder.type === "labwork" && reminder.fasting && (
                <div className="text-xs mt-2 text-health-caution">
                  Fasting required (8 hours)
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Separator />

      <div className="flex justify-center pt-2">
        <Badge variant="outline" className="cursor-pointer">
          View All Reminders
        </Badge>
      </div>
    </div>
  );
}
