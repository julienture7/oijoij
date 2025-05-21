// src/data/types.ts

export interface MedicalEvent {
  year: number | string; // Can be "12 ans" or a specific year
  title: string;
  description: string; // Main description for the event
  details?: string[]; // Bullet points or further details
  labSummary?: string; // Brief summary of lab findings for this period
  discoveries?: Array<{ // For the "Découvertes" section
    name: string;
    description: string;
    details?: string[];
    outcome?: string;
  }>;
  treatments?: Array<{ // For "Réponses aux traitements"
    name:string;
    positive?: boolean; // true for positive, false for negative
    effects: string[];
    notes?: string;
  }>;
  imaging?: Array<{
    date: string; // YYYY-MM-DD
    type: string; // e.g., Scanner, IRM
    location: string; // e.g., Rachis cervical
    clinic: string;
    indication: string;
    results: string[];
    conclusion: string;
  }>;
  labResults?: LabReport[]; // Array of lab reports associated with this period/event
  notes?: string[]; // General notes for "Notes diverses"
  currentSymptoms?: CurrentSymptomEntry[]; // For current symptoms page
}

export interface LabReport {
  reportDate: string; // YYYY-MM-DD
  reportName: string; // e.g., "Bilan sanguin complet", "Analyse de selles"
  labName: string;
  doctor?: string; // Prescribing or validating doctor
  filePath?: string; // Optional: if you want to link to the PDF scan
  sections: LabSection[];
}

export interface LabSection {
  sectionName: string; // e.g., "Hématologie", "Biochimie Sanguine"
  tests: LabTest[];
  summary?: string; // e.g., "Absence de bactéries entéropathogènes"
}

export interface LabTest {
  name: string;
  value: string | number | null; // Can be numerical, textual (e.g., "Négatif", "< 0.1"), or null
  unit?: string;
  referenceRange?: string; // e.g., "4.0-11.0", "<5.0", "Négatif"
  status?: "normal" | "low" | "high" | "abnormal" | "positive" | "negative" | "borderline" | "significant";
  comment?: string;
  subTests?: LabTest[]; // For grouped tests like fatty acid profiles
}

export interface CurrentSymptomEntry {
  category: string; // e.g., "Symptomes actuel (18/05/2025)", "Protocole achard effet (19/03/2024)"
  date?: string; // YYYY-MM-DD or descriptive
  symptoms: Array<{
    description: string;
    details?: string; // e.g. for "Taux glycémie a jeun 1,25-1,30"
  }>;
}

// For Biomesight specific summary
export interface BiomesightSummary {
  reportDate: string; // YYYY-MM-DD
  gutWellnessScore: {
    value: number;
    status: string; // e.g., "NEEDS IMPROVEMENT"
  };
  diversity: number; // Percentage
  probiotics: number; // Percentage
  commensals: number; // Percentage
  pathobionts: number; // Percentage
  keyBacteria?: Array<{
    name: string;
    percentile?: number; // For some chart representation
    value: string; // e.g. "0.013%"
    range?: string; // e.g. "(0.02-3.0%)"
    interpretation?: string; // e.g. "Low"
    score?: string; // e.g. "65.0%"
  }>;
  recommendations?: {
    foodToAdd?: string[];
    foodToReduce?: string[];
    probioticsToAdd?: string[];
  }
}

// For Food Sensitivities IgG
export interface FoodSensitivityTest {
  foodName: string;
  value: number;
  unit: string; // e.g., "µg/ml"
  reactionLevel: "low" | "moderate" | "high" | "none"; // Derived from value
  // Reaction levels based on legend: ●◌◌ : <10 µg/ml (none/low), ●●◌ : 10 à 19.99 µg/ml (moderate), ●●●: >20 µg/ml (high)
}

export interface FoodSensitivityReport {
  reportDate: string;
  labName: string;
  technique: string; // e.g., "RIDA®CHIP FoodGuide"
  candidaAlbicans: string; // e.g., "sérologie positive"
  categories: Array<{
    name: string; // e.g., "CÉRÉALES GLUTEN", "FRUITS"
    items: FoodSensitivityTest[];
  }>;
}

export interface PatientProfile {
  name: string;
  dob: string; // YYYY-MM-DD
  sex: string;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  // You can add more fields here like allergies, primary doctor etc.
}

// Specific Report Types for different lab results that were previously directly imported

export interface CovidLabReport {
  reportName: string;
  examinationDate: string; // "YYYY-MM-DD"
  samplingTime: string; // "HH:MM"
  labName: string;
  procedureType: string;
  sampleType: string;
  doctor: string;
  referenceNumber?: string;
  sections: Array<{
    sectionName: string;
    findings: string[];
    overallResult?: string; // e.g., "Positive", "Negative"
  }>;
  techniqueDetails?: string;
  additionalNotes?: string[];
  overallConclusion?: string;
}

export interface DysautonomiaLabReportPatientDetails {
  name: string;
  dob: string; // "DD/MM/YYYY"
}

export interface DysautonomiaLabReport {
  reportName: string;
  examinationDate: string; // "YYYY-MM-DD"
  doctorPerforming: string;
  procedureType: string;
  labName: string;
  service: string;
  referringDoctor: string;
  patientDetails: DysautonomiaLabReportPatientDetails;
  reasonForExam: string;
  measurements: {
    poids: string;
    taille: string;
    imc: string;
  };
  methods: string;
  clinicalEvaluation: {
    scoreEwing: string;
    rapportValsalva: string;
  };
  autonomicTests: Array<{
    testName: string;
    value: string;
    interpretation?: string;
  }>;
  otherMeasures: {
    secretionSudorale_SUDOSCAN_uS?: {
      MS: string; // e.g. "78 (0)"
      MI: string; // e.g. "72 (0)"
    };
    // Add other potential measures here
  };
  interpretation: {
    quality: string;
    generalFindings: string;
    keyResults: string[];
  };
  overallConclusion: string;
  signature: string;
}

// For Food Sensitivities (already partially defined, let's refine and combine)
// Re-using FoodSensitivityTest from above
export interface IgGSensitivityCategory {
  name: string;
  items: FoodSensitivityTest[];
}

export interface IgESensitivityItem {
  foodName?: string; // For food items
  allergenName?: string; // For allergen items
  value: number;
  unit: string;
  interpretation: string;
}

export interface IgESensitivityCategory {
  name: string;
  items: IgESensitivityItem[];
}

export interface FoodSensitivitiesReport {
  iggSensitivities: {
    reportDate: string; // YYYY-MM-DD
    labName: string;
    technique: string;
    candidaAlbicans: string;
    categories: IgGSensitivityCategory[];
  };
  igeSensitivities: {
    reportDate: string; // YYYY-MM-DD
    labName: string;
    technique: string;
    ccdMarqueurCarbohydrates: {
      interpretation: string;
      value: number;
      unit: string;
    };
    categories: IgESensitivityCategory[];
  };
}

export interface MicrobiomeLabReport extends LabReport {
  // Microbiome specific fields can be added if they are top-level
  // Most microbiome data seems to fit within LabReport sections and tests structure
}

export interface MycotoxinLabReportPatientDetails {
  name: string;
  dob: string; //"YYYY-MM-DD"
  sex: string;
}

export interface MycotoxinLabReport {
  reportDate: string; // YYYY-MM-DD
  reportName: string;
  labName: string;
  doctor: string;
  samplingDate: string; // YYYY-MM-DD
  patientDetails: MycotoxinLabReportPatientDetails;
  creatinineValue: string; // e.g., "0.70 mg/dL"
  sections: LabSection[]; // Re-uses LabSection from base types
  interpretiveInformation: Record<string, string>; // Key-value pairs, e.g. {"Aflatoxin M1": "Details..."}
  overallConclusion?: string;
}

export interface NeckImagingReportSection {
  sectionName: string;
  findings: string[];
}

export interface NeckImagingReport {
  reportDate: string; // YYYY-MM-DD
  reportName: string;
  procedureType: string; // "Scanner", "IRM"
  labName: string;
  clinic?: string;
  doctor?: string;
  indication?: string;
  techniqueDetails?: string;
  sections: NeckImagingReportSection[];
  overallConclusion: string;
}
