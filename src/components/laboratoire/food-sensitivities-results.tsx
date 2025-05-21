"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HorizontalBar } from "./food-sensitivity-bar";
import type { FoodSensitivitiesReport } from "@/data/types";

interface FoodSensitivitiesResultsProps {
  className?: string;
}

// Type for IgG items
interface IgGItem {
  foodName: string;
  value: number;
  unit: string;
  reactionLevel: "none" | "moderate" | "high";
}

// Type for IgE items
interface IgEFoodItem {
  foodName: string;
  value: number;
  unit: string;
  interpretation: string;
}

interface IgEAllergenItem {
  allergenName: string;
  value: number;
  unit: string;
  interpretation: string;
}

type IgEItem = IgEFoodItem | IgEAllergenItem;

export function FoodSensitivitiesResults({ className }: FoodSensitivitiesResultsProps) {
  const [reportData, setReportData] = useState<FoodSensitivitiesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/food-sensitivities.json');
        if (!response.ok) throw new Error(`Failed to fetch food sensitivities data: ${response.statusText}`);
        const data = await response.json();
        setReportData(data as FoodSensitivitiesReport);
      } catch (err) {
        console.error("Error fetching food sensitivities data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Loading Food Sensitivities...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Food sensitivities data is not available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make sure the data has the expected structure before using it
  if (
    !reportData ||
    !reportData.iggSensitivities ||
    !reportData.igeSensitivities
  ) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Sensibilités Alimentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Données non disponibles</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data safely
  const iggData = reportData.iggSensitivities;
  const igeData = reportData.igeSensitivities;

  // Count IgG sensitivities
  const iggItems = iggData.categories.flatMap(cat => cat.items as IgGItem[]);
  const iggSensitivityLevels = {
    none: iggItems.filter(item => item.reactionLevel === "none").length,
    moderate: iggItems.filter(item => item.reactionLevel === "moderate").length,
    high: iggItems.filter(item => item.reactionLevel === "high").length
  };

  // Get IgG categories with at least one sensitivity
  const iggCategoriesWithSensitivities = iggData.categories.filter(cat =>
    (cat.items as IgGItem[]).some(item => item.reactionLevel !== "none")
  );

  return (
    <div className={className}>
      <Tabs defaultValue="igg" className="w-full">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="igg" className="flex-1">Sensibilités IgG</TabsTrigger>
          <TabsTrigger value="ige" className="flex-1">Allergies IgE</TabsTrigger>
        </TabsList>

        {/* IgG Sensitivities Tab */}
        <TabsContent value="igg">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Sensibilités Alimentaires IgG</CardTitle>
              <CardDescription>
                Test effectué le {format(new Date(iggData.reportDate), "dd MMMM yyyy", { locale: fr })} par {iggData.labName}
                <span className="ml-2 text-xs text-muted-foreground">Technique: {iggData.technique}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Résumé des résultats</CardTitle>
                    <CardDescription>Vue d'ensemble des sensibilités alimentaires IgG</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Aucune sensibilité</span>
                        <span className="text-sm text-muted-foreground">{iggSensitivityLevels.none} aliments</span>
                      </div>
                      <HorizontalBar
                        value={iggSensitivityLevels.none}
                        max={iggItems.length}
                        color="#10b981"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sensibilité modérée</span>
                        <span className="text-sm text-muted-foreground">{iggSensitivityLevels.moderate} aliments</span>
                      </div>
                      <HorizontalBar
                        value={iggSensitivityLevels.moderate}
                        max={iggItems.length}
                        color="#f59e0b"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sensibilité élevée</span>
                        <span className="text-sm text-muted-foreground">{iggSensitivityLevels.high} aliments</span>
                      </div>
                      <HorizontalBar
                        value={iggSensitivityLevels.high}
                        max={iggItems.length}
                        color="#ef4444"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Aliments à surveiller</CardTitle>
                    <CardDescription>Aliments avec sensibilité détectée</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {iggCategoriesWithSensitivities.length > 0 ? (
                      <div className="space-y-2">
                        {iggCategoriesWithSensitivities.map((category, index) => {
                          const sensitiveFoods = (category.items as IgGItem[]).filter(item => item.reactionLevel !== "none");
                          if (sensitiveFoods.length === 0) return null;

                          return (
                            <div key={index} className="border-l-2 border-primary pl-3 py-1">
                              <p className="text-sm font-medium">{category.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sensitiveFoods.map((food, foodIndex) => (
                                  <Badge
                                    key={foodIndex}
                                    variant="outline"
                                    className={`
                                      ${food.reactionLevel === "moderate" ? "border-amber-500 bg-amber-50 text-amber-700" : ""}
                                      ${food.reactionLevel === "high" ? "border-red-500 bg-red-50 text-red-700" : ""}
                                    `}
                                  >
                                    {food.foodName} ({food.value} {food.unit})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune sensibilité alimentaire significative détectée</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="all">Toutes les catégories</TabsTrigger>
                  {iggData.categories.map((category, index) => (
                    <TabsTrigger key={index} value={`cat-${index}`} className="text-sm">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {iggData.categories.map((category, catIndex) => (
                      <Card key={catIndex}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <table className="w-full">
                            <thead>
                              <tr className="border-b text-xs">
                                <th className="text-left py-2">Aliment</th>
                                <th className="text-right py-2">Valeur</th>
                                <th className="text-center py-2">Niveau</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(category.items as IgGItem[]).map((item, itemIndex) => (
                                <tr key={itemIndex} className="border-b last:border-0">
                                  <td className="py-2 text-sm">{item.foodName}</td>
                                  <td className="py-2 text-right text-sm">{item.value} {item.unit}</td>
                                  <td className="py-2 text-center">
                                    <Badge
                                      variant="outline"
                                      className={`
                                        ${item.reactionLevel === "none" ? "border-green-500 bg-green-50 text-green-700" : ""}
                                        ${item.reactionLevel === "moderate" ? "border-amber-500 bg-amber-50 text-amber-700" : ""}
                                        ${item.reactionLevel === "high" ? "border-red-500 bg-red-50 text-red-700" : ""}
                                      `}
                                    >
                                      {item.reactionLevel === "none" ? "Aucune" :
                                        item.reactionLevel === "moderate" ? "Modérée" : "Élevée"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {iggData.categories.map((category, catIndex) => (
                  <TabsContent key={catIndex} value={`cat-${catIndex}`}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>
                          {category.items.length} aliment{category.items.length > 1 ? "s" : ""} testé{category.items.length > 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Aliment</th>
                              <th className="text-right py-2">Valeur</th>
                              <th className="text-center py-2">Niveau</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(category.items as IgGItem[]).map((item, itemIndex) => (
                              <tr key={itemIndex} className="border-b last:border-0">
                                <td className="py-3 text-sm font-medium">{item.foodName}</td>
                                <td className="py-3 text-right">{item.value} {item.unit}</td>
                                <td className="py-3 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${item.reactionLevel === "none" ? "border-green-500 bg-green-50 text-green-700" : ""}
                                      ${item.reactionLevel === "moderate" ? "border-amber-500 bg-amber-50 text-amber-700" : ""}
                                      ${item.reactionLevel === "high" ? "border-red-500 bg-red-50 text-red-700" : ""}
                                    `}
                                  >
                                    {item.reactionLevel === "none" ? "Aucune" :
                                      item.reactionLevel === "moderate" ? "Modérée" : "Élevée"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="font-semibold">Candidat Albicans:</div>
                  <Badge
                    variant="outline"
                    className="border-red-500 bg-red-50 text-red-700"
                  >
                    {iggData.candidaAlbicans}
                  </Badge>
                </div>
                <div>
                  <div className="font-semibold mb-1">Légende des niveaux de sensibilité:</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>
                      <span className="font-medium">Aucune sensibilité</span>:
                      <span className="text-muted-foreground"> Valeur &lt; 10 µg/ml</span>
                    </li>
                    <li>
                      <span className="font-medium">Sensibilité modérée</span>:
                      <span className="text-muted-foreground"> Valeur entre 10 et 19.99 µg/ml</span>
                    </li>
                    <li>
                      <span className="font-medium">Sensibilité élevée</span>:
                      <span className="text-muted-foreground"> Valeur ≥ 20 µg/ml</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IgE Allergies Tab */}
        <TabsContent value="ige">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Allergies Alimentaires IgE</CardTitle>
              <CardDescription>
                Test effectué le {format(new Date(igeData.reportDate), "dd MMMM yyyy", { locale: fr })} par {igeData.labName}
                <span className="ml-2 text-xs text-muted-foreground">Technique: {igeData.technique}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Marqueur CCD (Carbohydrates)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Résultat: {igeData.ccdMarqueurCarbohydrates.interpretation}</span>
                      <Badge>{igeData.ccdMarqueurCarbohydrates.value} {igeData.ccdMarqueurCarbohydrates.unit}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {igeData.categories.map((category, catIndex) => (
                  <Card key={catIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>
                        {category.items.length} test{category.items.length > 1 ? "s" : ""} réalisé{category.items.length > 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">{category.name === "Aliments (IgE)" ? "Aliment" : "Allergène"}</th>
                            <th className="text-center py-2">Classe</th>
                            <th className="text-left py-2">Interprétation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(category.items as IgEItem[]).map((item, itemIndex) => {
                            // Get the appropriate name property based on the item type
                            const itemName = 'foodName' in item ? item.foodName : 'allergenName' in item ? item.allergenName : 'Inconnu';

                            // Determine the proper styling class based on the interpretation text
                            const interpretationClass =
                              item.interpretation.includes("Absence") ? "bg-green-50 text-green-700" :
                                item.interpretation.includes("faible") ? "bg-blue-50 text-blue-700" :
                                  item.interpretation.includes("modérée") ? "bg-amber-50 text-amber-700" :
                                    item.interpretation.includes("élevée") ? "bg-red-50 text-red-700" :
                                      item.interpretation.includes("très élevée") ? "bg-red-100 text-red-800" :
                                        "bg-gray-50 text-gray-700";

                            const intClasses = `px-2 py-1 rounded-md text-xs font-medium ${interpretationClass}`;

                            return (
                              <tr key={itemIndex} className="border-b last:border-0">
                                <td className="py-3 text-sm font-medium">{itemName}</td>
                                <td className="py-3 text-center">
                                  <Badge variant="outline" className={item.value > 0 ? "border-red-500 bg-red-50 text-red-700" : ""}>
                                    {item.value} {item.unit}
                                  </Badge>
                                </td>
                                <td className="py-3 text-sm">
                                  <span className={intClasses}>{item.interpretation}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                ))}

                <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                  <div className="font-semibold mb-1">Interprétation des classes EAST:</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><span className="inline-block w-16">Classe 0:</span> <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs">Absence d'IgEs spécifiques (&lt;0.35 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 1:</span> <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs">Concentration faible d'IgEs (0.35 à 0.7 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 2:</span> <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs">Concentration faible d'IgEs (0.7 à 3.5 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 3:</span> <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs">Concentration modérée d'IgEs (3.5 à 17.5 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 4:</span> <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md text-xs">Concentration élevée d'IgEs (17.5 à 50 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 5:</span> <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md text-xs">Concentration très élevée d'IgEs (50 à 100 kU/l)</span></li>
                    <li><span className="inline-block w-16">Classe 6:</span> <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md text-xs">Concentration très élevée d'IgEs (&gt;100 kU/l)</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
