"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parse, isValid, subMonths, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { fr } from "date-fns/locale";

export interface HistoricalDataPoint {
  date: string;
  value: number | string | null;
}

interface ProcessedDataPoint {
  originalDate: string;
  date: Date;
  formattedDate: string;
  value: number;
  status: "normal" | "abnormal" | "unknown";
}

interface LabResultChartCardProps {
  name: string;
  unit: string;
  category: string;
  refRange: string | null | undefined; // Allow refRange to be potentially null/undefined
  historicalData: HistoricalDataPoint[];
}

const getStatus = (value: number | null, refRangeInput: string | null | undefined): "normal" | "abnormal" | "unknown" => {
  try {
    if (value === null || value === undefined || isNaN(value)) return "unknown";
    // Robust check for refRangeInput before using string methods
    if (!refRangeInput || typeof refRangeInput !== 'string' || refRangeInput.toLowerCase() === "n/a" || refRangeInput.trim() === "") {
      return "unknown";
    }

    const refRange = refRangeInput; // Now we know it's a usable string

    let lowerBoundNum: number | undefined;
    let upperBoundNum: number | undefined;
    const cleanedRefRange = refRange.replace(/\s+/g, "");

    if (cleanedRefRange.includes("-")) {
      const parts = cleanedRefRange.split("-").map(s => Number.parseFloat(s.replace(',', '.')));
      lowerBoundNum = parts[0];
      upperBoundNum = parts[1];
      if (!isNaN(lowerBoundNum) && !isNaN(upperBoundNum)) {
        return value >= lowerBoundNum && value <= upperBoundNum ? "normal" : "abnormal";
      }
    } else if (cleanedRefRange.startsWith("<=") || cleanedRefRange.startsWith("<")) {
      upperBoundNum = Number.parseFloat(cleanedRefRange.replace(/[<=]/g, "").replace(',', '.'));
      if (!isNaN(upperBoundNum)) {
        return value <= upperBoundNum ? "normal" : "abnormal";
      }
    } else if (cleanedRefRange.startsWith(">=") || cleanedRefRange.startsWith(">")) {
      lowerBoundNum = Number.parseFloat(cleanedRefRange.replace(/[>=]/g, "").replace(',', '.'));
      if (!isNaN(lowerBoundNum)) {
        return value >= lowerBoundNum ? "normal" : "abnormal";
      }
    }
    return "unknown";
  } catch (error) {
    console.error("Error determining status:", error);
    return "unknown";
  }
};

export function LabResultChartCard({ name, unit, category, refRange, historicalData }: LabResultChartCardProps) {
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  const processedData = useMemo(() => {
    try {
      if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) return [];

      const validData = historicalData
        .filter(item => item && item.date && (item.value !== undefined && item.value !== null))
        .map(item => {
          try {
            const dateObj = parse(item.date, "yyyy-MM-dd", new Date());
            let numericValue: number | null = null;

            if (typeof item.value === 'string') {
              // Try to convert various string formats to numbers
              const cleanedValueStr = item.value.replace(/[<>,]/g, '').trim();
              numericValue = Number.parseFloat(cleanedValueStr);
            } else if (typeof item.value === 'number') {
              numericValue = item.value;
            }

            if (!isValid(dateObj) || numericValue === null || isNaN(numericValue)) {
              return null;
            }

            return {
              originalDate: item.date,
              date: dateObj,
              formattedDate: format(dateObj, "dd MMM yy", { locale: fr }),
              value: numericValue,
              status: getStatus(numericValue, refRange)
            };
          } catch (itemError) {
            console.error("Error processing data point:", itemError, item);
            return null;
          }
        })
        .filter(item => item !== null);

      // Use a safer sort function that doesn't rely on Math.min.apply
      if (validData.length === 0) return [];

      return validData.sort((a, b) => {
        if (!a || !b) return 0;
        return (a as ProcessedDataPoint).date.getTime() - (b as ProcessedDataPoint).date.getTime();
      }) as ProcessedDataPoint[];
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [historicalData, refRange, name]);

  const chartData = useMemo(() => {
    try {
      if (dateRangeFilter === "all" || processedData.length === 0) {
        return processedData;
      }

      const today = new Date();
      let startDateBoundary: Date;

      switch (dateRangeFilter) {
        case "1w":
          startDateBoundary = startOfWeek(subDays(today, 6), { locale: fr });
          break;
        case "1m":
          startDateBoundary = startOfMonth(subMonths(today, 0));
          break;
        case "6m":
          startDateBoundary = startOfMonth(subMonths(today, 5));
          break;
        case "1y":
          startDateBoundary = startOfYear(subMonths(today, 11));
          break;
        default:
          return processedData;
      }

      return processedData.filter(item => item.date >= startDateBoundary);
    } catch (error) {
      console.error("Error filtering chart data by date:", error);
      return processedData;
    }
  }, [processedData, dateRangeFilter]);

  // Safely find the latest result
  const latestResult = useMemo(() => {
    try {
      if (chartData.length > 0) {
        return chartData[chartData.length - 1];
      } else if (processedData.length > 0) {
        return processedData[processedData.length - 1];
      }
      return null;
    } catch (error) {
      console.error("Error determining latest result:", error);
      return null;
    }
  }, [chartData, processedData]);

  const displayLatestValue = latestResult ? String(latestResult.value) : "N/A";
  const latestStatus = latestResult ? latestResult.status : "unknown";

  // Safely parse reference range bounds
  const { lowerBound, upperBound } = useMemo(() => {
    try {
      let lowerBound: number | undefined;
      let upperBound: number | undefined;

      if (refRange && typeof refRange === 'string' && refRange.toLowerCase() !== 'n/a' && refRange.trim() !== '') {
        const cleanedRefRangeVal = refRange.replace(/\s+/g, "");

        if (cleanedRefRangeVal.includes("-")) {
          const parts = cleanedRefRangeVal.split("-").map(s => Number.parseFloat(s.replace(',', '.')));
          lowerBound = !isNaN(parts[0]) ? parts[0] : undefined;
          upperBound = !isNaN(parts[1]) ? parts[1] : undefined;
        } else if (cleanedRefRangeVal.startsWith("<=") || cleanedRefRangeVal.startsWith("<")) {
          upperBound = Number.parseFloat(cleanedRefRangeVal.replace(/[<=]/g, "").replace(',', '.'));
          if (!isNaN(upperBound)) lowerBound = 0;
        } else if (cleanedRefRangeVal.startsWith(">=") || cleanedRefRangeVal.startsWith(">")) {
          lowerBound = Number.parseFloat(cleanedRefRangeVal.replace(/[>=]/g, "").replace(',', '.'));
          if (lowerBound !== undefined && !isNaN(lowerBound)) upperBound = lowerBound * 2;
        }
      }

      return { lowerBound, upperBound };
    } catch (error) {
      console.error("Error parsing reference range bounds:", error);
      return { lowerBound: undefined, upperBound: undefined };
    }
  }, [refRange]);

  // Safely calculate Y-axis domain
  const { yDomainMinCalc, yDomainMaxCalc } = useMemo(() => {
    try {
      const yValues = chartData.map(item => item.value);

      // Default values in case of empty data
      if (yValues.length === 0) return { yDomainMinCalc: 0, yDomainMaxCalc: 100 };

      // Use a safer way to find min and max without using Math.min.apply or Math.max.apply
      let yMinVal = yValues[0];
      let yMaxVal = yValues[0];

      for (let i = 1; i < yValues.length; i++) {
        if (yValues[i] < yMinVal) yMinVal = yValues[i];
        if (yValues[i] > yMaxVal) yMaxVal = yValues[i];
      }

      let yDomainMinCalc = yMinVal;
      let yDomainMaxCalc = yMaxVal;

      // Include reference range in domain if available
      if (lowerBound !== undefined && !isNaN(lowerBound)) {
        yDomainMinCalc = yDomainMinCalc < lowerBound ? yDomainMinCalc : lowerBound;
      }

      if (upperBound !== undefined && !isNaN(upperBound)) {
        yDomainMaxCalc = yDomainMaxCalc > upperBound ? yDomainMaxCalc : upperBound;
      }

      // Add padding for better visualization
      const yPadding = (yDomainMaxCalc - yDomainMinCalc) * 0.15 || 5;
      yDomainMinCalc = Math.max(0, Math.floor(yDomainMinCalc - yPadding));
      yDomainMaxCalc = Math.ceil(yDomainMaxCalc + yPadding);

      return { yDomainMinCalc, yDomainMaxCalc };
    } catch (error) {
      console.error("Error calculating Y axis domain:", error);
      return { yDomainMinCalc: 0, yDomainMaxCalc: 100 };
    }
  }, [chartData, lowerBound, upperBound]);

  const lastUpdatedDate = latestResult ? latestResult.date : null;

  // Return a fallback UI if no data available
  if (processedData.length === 0) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-card shadow">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-muted-foreground text-sm">Aucune donnée historique valide pour ce marqueur.</p>
        {unit && <p className="text-xs text-muted-foreground">Unité: {unit}</p>}
        {refRange && <p className="text-xs text-muted-foreground">Plage de référence: {refRange}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            {latestResult && (
              <Badge
                variant="outline"
                className={
                  latestStatus === "normal"
                    ? "bg-health-normal-bg text-health-normal"
                    : latestStatus === "unknown" ? "bg-muted"
                    : "bg-health-abnormal-bg text-health-abnormal"
                }
              >
                {latestStatus === "normal" ? "Normal" : latestStatus === "unknown" ? "N/A" : "Anormal"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{category}</span>
            <span>•</span>
            <span>Intervalle de réf: {refRange || "N/A"} {unit}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-xl font-bold">
            {displayLatestValue}
          </div>
          <div className="text-sm text-muted-foreground">
            {unit}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant={dateRangeFilter === "1w" ? "default" : "outline"} size="sm" onClick={() => setDateRangeFilter("1w")}>1s</Button>
          <Button variant={dateRangeFilter === "1m" ? "default" : "outline"} size="sm" onClick={() => setDateRangeFilter("1m")}>1m</Button>
          <Button variant={dateRangeFilter === "6m" ? "default" : "outline"} size="sm" onClick={() => setDateRangeFilter("6m")}>6m</Button>
          <Button variant={dateRangeFilter === "1y" ? "default" : "outline"} size="sm" onClick={() => setDateRangeFilter("1y")}>1a</Button>
          <Button variant={dateRangeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setDateRangeFilter("all")}>Tout</Button>
        </div>
      </div>

      <div className="h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 10 }}
                tickLine={false}
                minTickGap={15}
                angle={chartData.length > 10 ? -30 : 0}
                textAnchor={chartData.length > 10 ? "end" : "middle"}
                height={chartData.length > 10 ? 50 : 30}
              />
              <YAxis
                domain={[yDomainMinCalc, yDomainMaxCalc]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  try {
                    if (active && payload && payload.length) {
                      const pointData = payload[0].payload as ProcessedDataPoint;
                      return (
                        <div className="bg-popover border text-popover-foreground shadow-sm p-3 rounded-md">
                          <div className="text-sm font-medium">{format(pointData.date, "dd MMM yyyy", {locale: fr})}</div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="font-bold">
                              {pointData.value} {unit}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                pointData.status === "normal"
                                ? "bg-health-normal-bg text-health-normal"
                                : pointData.status === "abnormal" ? "bg-health-abnormal-bg text-health-abnormal"
                                : "bg-muted"
                              }`}
                            >
                              {pointData.status === "normal" ? "Normal" : pointData.status === "abnormal" ? "Anormal" : "Inconnu"}
                            </Badge>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  } catch (tooltipError) {
                    console.error("Error rendering tooltip:", tooltipError);
                    return null;
                  }
                }}
              />

              {typeof lowerBound === 'number' && typeof upperBound === 'number' && !isNaN(lowerBound) && !isNaN(upperBound) && (
                <ReferenceArea
                  y1={lowerBound}
                  y2={upperBound}
                  fill="hsl(var(--health-normal-bg))"
                  fillOpacity={0.3}
                  ifOverflow="visible"
                />
              )}
              {typeof lowerBound === 'number' && !isNaN(lowerBound) && (
                <ReferenceArea
                  y1={yDomainMinCalc < lowerBound ? yDomainMinCalc : undefined}
                  y2={lowerBound}
                  fill="hsl(var(--health-abnormal-bg))"
                  fillOpacity={0.15}
                  ifOverflow="visible"
                />
              )}
              {typeof upperBound === 'number' && !isNaN(upperBound) && (
                <ReferenceArea
                  y1={upperBound}
                  y2={yDomainMaxCalc > upperBound ? yDomainMaxCalc : undefined}
                  fill="hsl(var(--health-abnormal-bg))"
                  fillOpacity={0.15}
                  ifOverflow="visible"
                />
              )}

              {typeof lowerBound === 'number' && !isNaN(lowerBound) && (
                <ReferenceLine y={lowerBound} stroke="hsl(var(--health-caution))" strokeWidth={1} strokeDasharray="2 2" />
              )}
              {typeof upperBound === 'number' && !isNaN(upperBound) && (
                <ReferenceLine y={upperBound} stroke="hsl(var(--health-caution))" strokeWidth={1} strokeDasharray="2 2" />
              )}

              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={({ cx, cy, payload, index }) => {
                  try {
                    return (
                      <circle
                        key={`dot-${name}-${index}`}
                        cx={cx}
                        cy={cy}
                        r={3.5}
                        fill={payload.status === "normal" ? "hsl(var(--health-normal))" : payload.status === "abnormal" ? "hsl(var(--health-abnormal))" : "hsl(var(--muted-foreground))"}
                        stroke="hsl(var(--card))"
                        strokeWidth={1.5}
                      />
                    );
                  } catch (dotError) {
                    console.error("Error rendering dot:", dotError);
                    return null;
                  }
                }}
                activeDot={{ r: 5, strokeWidth: 1.5, stroke: "hsl(var(--card))" }}
              />
              {chartData.length > 8 && (
                <Brush
                  dataKey="formattedDate"
                  height={25}
                  stroke="hsl(var(--primary-foreground))"
                  fill="hsl(var(--secondary))"
                  travellerWidth={10}
                  startIndex={Math.max(0, chartData.length - Math.min(chartData.length, 12))}
                  tickFormatter={(tick) => {
                    try {
                      return format(parse(tick, "dd MMM yy", new Date(), { locale: fr }), "MMM yy", { locale: fr });
                    } catch (error) {
                      console.error("Error formatting tick:", error);
                      return tick;
                    }
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center text-muted-foreground">
            (Pas assez de données pour afficher un graphique de tendance)
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-2">
        <div>
          Dernière donnée: {lastUpdatedDate && isValid(lastUpdatedDate) ? format(lastUpdatedDate, "dd MMM yyyy", {locale: fr}) : "N/A"}
        </div>
        <div>
          {chartData.length} point{chartData.length !== 1 ? 's' : ''} de données affiché{chartData.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
