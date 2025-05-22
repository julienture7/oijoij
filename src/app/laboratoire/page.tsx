// src/app/laboratoire/page.tsx
import { LabResultsHeader } from "@/components/laboratoire/lab-results-header";
import { BloodLabResults } from "@/components/laboratoire/blood-lab-results";
// Import other lab result components
import { NeckLabResults } from "@/components/laboratoire/neck-lab-results";
import { MicrobiomeLabResults } from "@/components/laboratoire/microbiome-lab-results";
import { MycotoxinLabResults } from "@/components/laboratoire/mycotoxin-lab-results";
import { CovidLabResults } from "@/components/laboratoire/covid-lab-results";
import { DysautonomieLabResults } from "@/components/laboratoire/dysautonomie-lab-results";
import { FoodSensitivitiesResults } from "@/components/laboratoire/food-sensitivities-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * `LabResultsPage` component.
 * This page serves as a container for displaying various categories of lab results.
 * It uses a tabbed interface to switch between different lab result components.
 *
 * @component
 * @returns {React.ReactElement} The rendered lab results page with a tabbed layout.
 */
export default function LabResultsPage(): React.ReactElement {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <LabResultsHeader />

      <div className="relative">
        {/* Tabs component for navigating between different lab result categories */}
        <Tabs defaultValue="blood" className="w-full">
          <TabsList className="mb-6 z-30 sticky top-0 bg-background/95 pt-4 pb-4 grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 flex-wrap">
            <TabsTrigger value="blood">Analyses Sanguines</TabsTrigger>
            <TabsTrigger value="covid">COVID-19</TabsTrigger>
            <TabsTrigger value="neck">Résultats Cervicaux</TabsTrigger>
            <TabsTrigger value="microbiome">Microbiome</TabsTrigger>
            <TabsTrigger value="mycotoxins">Mycotoxines</TabsTrigger>
            <TabsTrigger value="dysautonomie">Dysautonomie</TabsTrigger>
            <TabsTrigger value="food">Sensibilités Alimentaires</TabsTrigger>
          </TabsList>

          {/* Container for the content of each tab */}
          <div className="mt-6 pb-8 relative z-10">
            <TabsContent value="blood" className="mt-0">
              <BloodLabResults />
            </TabsContent>

            <TabsContent value="covid" className="mt-0">
              <CovidLabResults />
            </TabsContent>

            <TabsContent value="neck" className="mt-0">
              <NeckLabResults />
            </TabsContent>

            <TabsContent value="microbiome" className="mt-0">
              <MicrobiomeLabResults />
            </TabsContent>

            <TabsContent value="mycotoxins" className="mt-0">
              <MycotoxinLabResults />
            </TabsContent>

            <TabsContent value="dysautonomie" className="mt-0">
              <DysautonomieLabResults />
            </TabsContent>

            <TabsContent value="food" className="mt-0">
              <FoodSensitivitiesResults />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
