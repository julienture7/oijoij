"use client";

import { Progress } from "@/components/ui/progress";
import { BarChart3, Heart, BarChart2, Activity } from "lucide-react";

export function HealthSummary() {
  const healthMetrics = [
    {
      name: "Blood Pressure",
      icon: <Activity className="h-5 w-5 text-medical-blue" />,
      status: "Normal",
      value: "120/80 mmHg",
      progress: 75,
      progressColor: "bg-health-normal",
    },
    {
      name: "Heart Rate",
      icon: <Heart className="h-5 w-5 text-health-abnormal" />,
      status: "Elevated",
      value: "88 bpm",
      progress: 60,
      progressColor: "bg-health-caution",
    },
    {
      name: "BMI",
      icon: <BarChart3 className="h-5 w-5 text-medical-teal" />,
      status: "Normal",
      value: "22.5",
      progress: 85,
      progressColor: "bg-health-normal",
    },
    {
      name: "Activity Level",
      icon: <BarChart2 className="h-5 w-5 text-medical-indigo" />,
      status: "Below Target",
      value: "65%",
      progress: 65,
      progressColor: "bg-health-caution",
    },
  ];

  return (
    <div className="space-y-5">
      {healthMetrics.map((metric) => (
        <div key={metric.name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {metric.icon}
              <div className="font-medium">{metric.name}</div>
            </div>
            <div className="text-sm font-medium">{metric.value}</div>
          </div>
          <Progress
            value={metric.progress}
            className="h-2"
            indicatorClassName={metric.progressColor}
          />
          <div className="text-xs text-muted-foreground">
            Status: <span className="font-medium">{metric.status}</span>
          </div>
        </div>
      ))}

      <div className="pt-4 border-t mt-4">
        <div className="text-sm font-medium mb-3">Health Score</div>
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-health-caution via-health-normal to-health-normal flex items-center justify-center">
            <div className="bg-card w-18 h-18 rounded-full flex items-center justify-center">
              <div className="text-2xl font-bold">82</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-sm text-muted-foreground">Good</div>
      </div>
    </div>
  );
}
