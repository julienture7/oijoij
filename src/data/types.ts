// src/data/types.ts

/**
 * Represents a significant medical event or period in the patient's history.
 * Can encompass diagnoses, treatments, lab results, imaging, and symptoms for that time.
 */
export interface MedicalEvent {
  /** The year of the event, can be a specific year (number) or an age (string like "12 ans"). */
  year: number | string;
  /** The main title or name of the event (e.g., "Diagnostic initial", "Protocole X"). */
  title: string;
  /** A general description of the event. */
  description: string;
  /** Optional array of further details or bullet points related to the event. */
  details?: string[];
  /** Optional brief summary of lab findings relevant to this event or period. */
  labSummary?: string;
  /** Optional array of discoveries made during this event/period. */
  discoveries?: Array<{
    name: string;
    description: string;
    details?: string[];
    outcome?: string;
  }>;
  /** Optional array of treatments administered or attempted. */
  treatments?: Array<{
    name:string;
    /** Indicates if the treatment had a positive effect. `true` for positive, `false` for negative/no effect. */
    positive?: boolean;
    effects: string[];
    notes?: string;
  }>;
  /** Optional array of imaging results (scans, MRIs, etc.). */
  imaging?: Array<{
    /** Date of the imaging procedure (YYYY-MM-DD). */
    date: string;
    type: string; // e.g., Scanner, IRM
    location: string; // e.g., Rachis cervical
    clinic: string;
    indication: string;
    results: string[];
    conclusion: string;
  }>;
  /** Optional array of detailed lab reports associated with this event. */
  labResults?: LabReport[];
  /** Optional general notes or miscellaneous information. */
  notes?: string[];
  /** Optional array of current symptom entries, if relevant to a historical event context. */
  currentSymptoms?: CurrentSymptomEntry[];
}

/**
 * Represents a single laboratory report.
 */
export interface LabReport {
  /** Date the report was issued (YYYY-MM-DD). */
  reportDate: string;
  /** Name of the lab report (e.g., "Bilan sanguin complet", "Analyse de selles"). */
  reportName: string;
  /** Name of the laboratory that performed the tests. */
  labName: string;
  /** Optional name of the prescribing or validating doctor. */
  doctor?: string;
  /** Optional path to the original PDF scan of the report. Can be multiple paths separated by ';'. */
  filePath?: string;
  /** Array of sections contained within the lab report. */
  sections: LabSection[];
}

/**
 * Represents a section within a lab report (e.g., "Hématologie", "Biochimie Sanguine").
 */
export interface LabSection {
  /** Name of the lab section. */
  sectionName: string;
  /** Array of individual tests performed within this section. */
  tests: LabTest[];
  /** Optional summary statement for the section (e.g., "Absence de bactéries entéropathogènes"). */
  summary?: string;
}

/**
 * Represents an individual lab test and its result.
 */
export interface LabTest {
  /** Name of the test. */
  name: string;
  /** Value of the test result. Can be numerical, textual (e.g., "Négatif", "< 0.1"), or null. */
  value: string | number | null;
  /** Optional unit for the test value. */
  unit?: string;
  /** Optional reference range for the test (e.g., "4.0-11.0", "<5.0", "Négatif"). */
  referenceRange?: string;
  /** Optional status of the test result (e.g., "normal", "low", "high"). */
  status?: "normal" | "low" | "high" | "abnormal" | "positive" | "negative" | "borderline" | "significant";
  /** Optional comment or interpretation related to the test. */
  comment?: string;
  /** Optional array of sub-tests, for grouped tests like fatty acid profiles. */
  subTests?: LabTest[];
}

/**
 * Represents a collection of symptoms reported at a specific time or under a specific context.
 */
export interface CurrentSymptomEntry {
  /** Category or title for the symptom entry (e.g., "Symptomes actuel (18/05/2025)"). */
  category: string;
  /** Optional date associated with the symptom entry (YYYY-MM-DD or descriptive). */
  date?: string;
  /** Array of symptoms. */
  symptoms: Array<{
    /** Description of the symptom. */
    description: string;
    /** Optional further details about the symptom (e.g., specific values for "Taux glycémie a jeun 1,25-1,30"). */
    details?: string;
  }>;
}

/**
 * Represents a summary of a Biomesight gut microbiome report.
 */
export interface BiomesightSummary {
  /** Date of the Biomesight report (YYYY-MM-DD). */
  reportDate: string;
  /** Gut wellness score with its value and qualitative status. */
  gutWellnessScore: {
    value: number;
    status: string; // e.g., "NEEDS IMPROVEMENT"
  };
  /** Overall diversity score as a percentage. */
  diversity: number;
  /** Score for probiotics as a percentage. */
  probiotics: number;
  /** Score for commensal bacteria as a percentage. */
  commensals: number;
  /** Score for pathobionts as a percentage. */
  pathobionts: number;
  /** Optional array of key bacteria with their details. */
  keyBacteria?: Array<{
    name: string;
    percentile?: number;
    value: string; // e.g. "0.013%"
    range?: string; // e.g. "(0.02-3.0%)"
    interpretation?: string; // e.g. "Low"
    score?: string; // e.g. "65.0%"
  }>;
  /** Optional dietary and probiotic recommendations. */
  recommendations?: {
    foodToAdd?: string[];
    foodToReduce?: string[];
    probioticsToAdd?: string[];
  }
}

/**
 * Represents an individual food sensitivity test (typically IgG).
 */
export interface FoodSensitivityTest {
  /** Name of the food item. */
  foodName: string;
  /** Measured value of the sensitivity. */
  value: number;
  /** Unit for the value (e.g., "µg/ml"). */
  unit: string;
  /** Qualitative reaction level derived from the value. */
  reactionLevel: "low" | "moderate" | "high" | "none";
}

/**
 * Represents a category of food items tested for IgG sensitivity.
 */
export interface IgGSensitivityCategory {
  /** Name of the food category (e.g., "CÉRÉALES GLUTEN", "FRUITS"). */
  name: string;
  /** Array of food sensitivity tests within this category. */
  items: FoodSensitivityTest[];
}

/**
 * Represents an individual IgE sensitivity test item (can be food or other allergen).
 */
export interface IgESensitivityItem {
  /** Name of the food item (if applicable). */
  foodName?: string;
  /** Name of the allergen (if not a food item, e.g., for environmental allergens). */
  allergenName?: string;
  /** Measured value, often an EAST class for IgE tests. */
  value: number;
  /** Unit for the value (e.g., "Classe EAST", "kU/l"). */
  unit: string;
  /** Interpretation of the result provided by the lab. */
  interpretation: string;
}

/**
 * Represents a category of items tested for IgE sensitivity.
 */
export interface IgESensitivityCategory {
  /** Name of the IgE category (e.g., "Aliments (IgE)", "Acariens (IgE)"). */
  name: string;
  /** Array of IgE sensitivity test items within this category. */
  items: IgESensitivityItem[];
}

/**
 * Represents a comprehensive food sensitivities report, including both IgG and IgE results.
 */
export interface FoodSensitivitiesReport {
  /** IgG sensitivity test results. */
  iggSensitivities: {
    reportDate: string; // YYYY-MM-DD
    labName: string;
    technique: string;
    candidaAlbicans: string; // e.g., "sérologie positive"
    categories: IgGSensitivityCategory[];
  };
  /** IgE sensitivity (allergy) test results. */
  igeSensitivities: {
    reportDate: string; // YYYY-MM-DD
    labName: string;
    technique: string;
    /** Result for CCD (Cross-reactive Carbohydrate Determinants) marker. */
    ccdMarqueurCarbohydrates: {
      interpretation: string;
      value: number;
      unit: string;
    };
    categories: IgESensitivityCategory[];
  };
}


/**
 * Represents the patient's general profile information.
 */
export interface PatientProfile {
  name: string;
  /** Date of birth (YYYY-MM-DD). */
  dob: string;
  sex: string;
  /** Optional contact information. */
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}


/**
 * Represents a COVID-19 lab report.
 */
export interface CovidLabReport {
  reportName: string;
  /** Date of the examination (YYYY-MM-DD). */
  examinationDate: string;
  /** Time of sampling (HH:MM). */
  samplingTime: string;
  labName: string;
  procedureType: string;
  sampleType: string;
  doctor: string;
  referenceNumber?: string;
  sections: Array<{
    sectionName: string;
    findings: string[];
    /** Overall result for the section, if applicable (e.g., "Positive", "Negative"). */
    overallResult?: string;
  }>;
  techniqueDetails?: string;
  additionalNotes?: string[];
  overallConclusion?: string;
}

/**
 * Patient details specific to a Dysautonomia lab report.
 */
export interface DysautonomiaLabReportPatientDetails {
  name: string;
  /** Date of birth (DD/MM/YYYY). Note: format differs from other DOBs. */
  dob: string;
  /** Address provided to the lab for this specific report. */
  addressProvidedToLab?: string;
}

/**
 * Represents a Dysautonomia (autonomic nervous system) exploration report.
 */
export interface DysautonomiaLabReport {
  reportName: string;
  /** Date of the examination (YYYY-MM-DD). */
  examinationDate: string;
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
    pressionArterielleCentrale_mmHg?: {
      systolique: string;
      diastolique: string;
      moyenne: string;
      pulsee: string;
    };
    vitesseOndeDePouls_ms?: {
      carotideFemorale: string;
      carotideRadiale: string;
      indexAugmentation?: string;
      pressionCentralePulsee?: string;
      ageArteriel?: string;
    };
  };
  interpretation: {
    quality: string;
    generalFindings: string;
    keyResults: string[];
  };
  overallConclusion: string;
  signature: string;
}


/**
 * Extends LabReport for microbiome-specific data, if any top-level fields differ.
 * Currently, most microbiome data fits the generic LabReport structure.
 */
export interface MicrobiomeLabReport extends LabReport {
  // Microbiome specific fields can be added if they are top-level
}

/**
 * Patient details specific to a Mycotoxin lab report.
 */
export interface MycotoxinLabReportPatientDetails {
  name: string;
  /** Date of birth (YYYY-MM-DD). */
  dob: string;
  sex: string;
}

/**
 * Represents a mycotoxin profile lab report.
 */
export interface MycotoxinLabReport {
  /** Date the report was issued (YYYY-MM-DD). */
  reportDate: string;
  reportName: string;
  labName: string;
  doctor: string;
  /** Date of sample collection (YYYY-MM-DD). */
  samplingDate: string;
  patientDetails: MycotoxinLabReportPatientDetails;
  /** Creatinine value at the time of testing, often used for urine normalization. */
  creatinineValue: string; // e.g., "0.70 mg/dL"
  /** Array of sections, re-using the generic LabSection type. */
  sections: LabSection[];
  /** Key-value pairs of interpretive information for detected toxins. */
  interpretiveInformation: Record<string, string>;
  /** Optional overall conclusion for the report. */
  overallConclusion?: string;
  /** Optional comments from the lab. */
  labComments?: string[];
}

/**
 * Represents a section within a neck imaging report.
 */
export interface NeckImagingReportSection {
  sectionName: string;
  findings: string[];
}

/**
 * Represents a neck imaging report (Scanner or IRM).
 */
export interface NeckImagingReport {
  /** Date of the report (YYYY-MM-DD). */
  reportDate: string;
  reportName: string;
  /** Type of procedure (e.g., "Scanner", "IRM"). */
  procedureType: string;
  labName: string;
  clinic?: string;
  doctor?: string;
  indication?: string;
  techniqueDetails?: string;
  sections: NeckImagingReportSection[];
  overallConclusion: string;
}
