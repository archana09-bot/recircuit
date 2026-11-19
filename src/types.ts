export type HazardLevel = 'Safe to Handle' | 'Handle with Care' | 'High Caution';

export type EwasteCategory =
  | 'Cables & Chargers'
  | 'Mobile & Batteries'
  | 'Audio & Peripherals'
  | 'Networking & Power'
  | 'Small Appliances'
  | 'Computing & Boards';

export interface DiyMethod {
  title: string;
  effort: 'Quick (5 min)' | 'Project (20–30 min)' | 'Upcycle';
  toolsNeeded: string[];
  steps: string[];
  outcome: string;
}

export interface EwasteAnalysis {
  itemName: string;
  category: EwasteCategory;
  confidence: 'High' | 'Medium' | 'Low';
  hazardLevel: HazardLevel;
  summary: string;
  diyMethods: DiyMethod[];
  safeAtHomePrep: string[];
  safetyWarnings: string[];
  reusableParts: string[];
}

export interface CommunityPost {
  id: string;
  authorName: string;
  userNote?: string;
  imageUrl: string;
  createdAt: string;
  helpfulCount: number;
  analysis: EwasteAnalysis;
}

export interface SavedScanItem {
  id: string;
  imageUrl: string;
  createdAt: string;
  userNote?: string;
  completedSteps: string[];
  analysis: EwasteAnalysis;
}
