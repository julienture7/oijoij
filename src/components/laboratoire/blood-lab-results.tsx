"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabResultChartCard } from "@/components/laboratoire/lab-result-chart-card";
import bloodLabData from "../../../public/data/blood-lab-results.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BloodLabResult {
  unit: string;
  referenceRange: string;
  category: string;
  history: Array<{
    date: string;
    value: number | string;
  }>;
}

interface CategoryGroup {
  [category: string]: {
    [testName: string]: BloodLabResult;
  };
}

export function BloodLabResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Group blood lab results by category
  const categoryGroups = useMemo(() => {
    const groups: CategoryGroup = {};

    Object.entries(bloodLabData).forEach(([testName, data]) => {
      const result = data as BloodLabResult;
      const category = result.category;

      if (!groups[category]) {
        groups[category] = {};
      }

      groups[category][testName] = result;
    });

    return groups;
  }, []);

  // Get unique categories for tabs
  const categories = useMemo(() => {
    return Object.keys(categoryGroups).sort();
  }, [categoryGroups]);

  // Filter results based on search term and selected category
  const filteredResults = useMemo(() => {
    const results: { testName: string; data: BloodLabResult }[] = [];

    Object.entries(bloodLabData).forEach(([testName, data]) => {
      const result = data as BloodLabResult;

      if (
        testName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "all" || result.category === selectedCategory)
      ) {
        results.push({ testName, data: result });
      }
    });

    // Sort by most recent test date
    return results.sort((a, b) => {
      const lastDateA = a.data.history.length ? new Date(a.data.history[a.data.history.length - 1].date).getTime() : 0;
      const lastDateB = b.data.history.length ? new Date(b.data.history[b.data.history.length - 1].date).getTime() : 0;
      return lastDateB - lastDateA;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <Card className="w-full max-h-[80vh] overflow-auto">
      <CardHeader className="sticky top-0 bg-card z-10">
        <CardTitle>Résultats d'Analyses Sanguines</CardTitle>
        <CardDescription>
          Visualisation des résultats d'analyses sanguines au fil du temps
        </CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Rechercher un test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResults.length > 0 ? (
            filteredResults.map(({ testName, data }) => (
              <Card key={testName} className="overflow-hidden">
                <CardContent className="p-6">
                  <LabResultChartCard
                    name={testName}
                    unit={data.unit}
                    category={data.category}
                    refRange={data.referenceRange}
                    historicalData={data.history}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-muted-foreground">
              Aucun résultat trouvé pour la recherche ou la catégorie sélectionnée.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
