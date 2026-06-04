export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed' | 'Separated';
export type JourneyStage = 'New' | 'Profile Verified' | 'Matching' | 'Intro Sent' | 'On Hold' | 'Matched';
export type WantsKids = 'Yes' | 'No' | 'Maybe';
export type OpenToPets = 'Yes' | 'No' | 'Maybe';
export type OpenToRelocate = 'Yes' | 'No' | 'Maybe';
export type Diet = 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan' | 'Jain';
export type FamilyType = 'Nuclear' | 'Joint' | 'Extended';
export type Manglik = 'Yes' | 'No' | "Doesn't Matter";
export type DrinkingHabit = 'Never' | 'Occasionally' | 'Regularly';
export type SmokingHabit = 'Never' | 'Occasionally' | 'Regularly';
export type NRIStatus = 'Indian Resident' | 'NRI' | 'OCI' | 'PIO';
export type MatchTier = 'High Potential' | 'Worth Exploring' | 'Long Shot';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  height: number; // cm
  country: string;
  city: string;
  openToRelocate: OpenToRelocate;
  email: string;
  phone: string;
  undergraduateCollege: string;
  degree: string;
  fieldOfStudy: string;
  higherQualification?: string;
  currentCompany: string;
  designation: string;
  incomeBand: string; // e.g. "10-15 LPA"
  maritalStatus: MaritalStatus;
  languagesKnown: string[];
  siblings: number;
  caste?: string;
  subCaste?: string;
  religion: string;
  motherTongue: string;
  manglik: Manglik;
  diet: Diet;
  familyType: FamilyType;
  fatherOccupation: string;
  motherOccupation: string;
  drinkingHabit: DrinkingHabit;
  smokingHabit: SmokingHabit;
  wantKids: WantsKids;
  openToPets: OpenToPets;
  hobbies: string[];
  partnerExpectations: string;
  nriStatus: NRIStatus;
  physicalStatus: 'No Disability' | 'Differently Abled';
  photoUrl?: string;
}

export interface Customer extends Profile {
  assignedMatchmakerId: string;
  journeyStage: JourneyStage;
  isVerified: boolean;
  lastContactDate: string;
  notes: Note[];
  timeline: TimelineEvent[];
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  type: 'note' | 'intro_sent' | 'stage_change' | 'call';
  description: string;
  createdAt: string;
  relatedProfileId?: string;
  relatedProfileName?: string;
}

export interface MatchResult {
  profile: Profile;
  score: number;
  tier: MatchTier;
  breakdown: MatchBreakdown[];
  aiExplanation?: string;
  aiIntro?: string;
  isLoadingAI?: boolean;
}

export interface MatchBreakdown {
  criterion: string;
  score: number; // 0-1
  weight: number;
  contribution: number; // score * weight, normalized
  label: string;
}

export interface MatchWeights {
  [key: string]: number;
}

export interface Matchmaker {
  id: string;
  name: string;
  email: string;
  password: string;
  assignedCustomerIds: string[];
}
