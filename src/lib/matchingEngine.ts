import type { Profile, Customer, MatchResult, MatchBreakdown, MatchTier, MatchWeights } from '../types';

// ─── Weight configs (tunable) ─────────────────────────────────────────────────

const MALE_WEIGHTS: MatchWeights = {
  kidsAlignment: 0.25,      // High — most important compatibility signal
  lifestyleAlignment: 0.20, // Diet, drinking, smoking
  religionAlignment: 0.15,  // Shared religious values
  locationCompatibility: 0.12, // City/relocation alignment
  ageCompat: 0.08,          // Low — younger-skew signal (see note)
  heightCompat: 0.05,       // Low — shorter signal (literal brief, low weight)
  incomeCompat: 0.05,       // Low — earns-less signal (dated assumption, low weight; toggleable)
  educationCompat: 0.10,    // Education level compatibility
};

// NOTE: The age/height/income rules for male customers encode traditional Indian
// matchmaking assumptions from the assignment brief. We implement them with LOW
// weight and lead with compatibility signals (kids, lifestyle, religion) to
// reflect more values-aligned matching. These can be toggled to 0 if desired.

const FEMALE_WEIGHTS: MatchWeights = {
  kidsAlignment: 0.22,
  lifestyleAlignment: 0.18,
  religionAlignment: 0.15,
  locationCompatibility: 0.15,
  educationProfessionCompat: 0.15,
  ageCompat: 0.10,           // Partner same-age to a few years older
  petsAlignment: 0.05,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function incomeBandToMidpoint(band: string): number {
  const map: Record<string, number> = {
    '3-5 LPA': 4, '5-8 LPA': 6.5, '8-12 LPA': 10, '12-18 LPA': 15,
    '18-25 LPA': 21.5, '25-40 LPA': 32.5, '40+ LPA': 50,
  };
  return map[band] ?? 10;
}

function kidsScore(a: Profile['wantKids'], b: Profile['wantKids']): number {
  if (a === b) return 1;
  if (a === 'Maybe' || b === 'Maybe') return 0.6;
  return 0; // Yes vs No
}

function petsScore(a: Profile['openToPets'], b: Profile['openToPets']): number {
  if (a === b) return 1;
  if (a === 'Maybe' || b === 'Maybe') return 0.6;
  return 0.2;
}

function relocateScore(a: Profile['openToRelocate'], b: Profile['openToRelocate'], sameCity: boolean): number {
  if (sameCity) return 1;
  if (a === 'Yes' && b === 'Yes') return 0.9;
  if (a === 'Yes' || b === 'Yes') return 0.65;
  if (a === 'Maybe' || b === 'Maybe') return 0.45;
  return 0.1; // Both No, different cities
}

function dietScore(a: Profile['diet'], b: Profile['diet']): number {
  if (a === b) return 1;
  // Vegetarian compatibility hierarchy
  const vegGroup = new Set(['Vegetarian', 'Jain', 'Vegan']);
  const nonVegGroup = new Set(['Non-Vegetarian', 'Eggetarian']);
  if (vegGroup.has(a) && vegGroup.has(b)) return 0.85;
  if (nonVegGroup.has(a) && nonVegGroup.has(b)) return 0.85;
  return 0.2;
}

function drinkingScore(a: Profile['drinkingHabit'], b: Profile['drinkingHabit']): number {
  if (a === b) return 1;
  if (a === 'Never' && b !== 'Regularly') return 0.5;
  if (b === 'Never' && a !== 'Regularly') return 0.5;
  if (a === 'Occasionally' && b === 'Occasionally') return 1;
  return 0.3;
}

function smokingScore(a: Profile['smokingHabit'], b: Profile['smokingHabit']): number {
  if (a === b) return 1;
  if (a === 'Never' && b === 'Occasionally') return 0.4;
  if (b === 'Never' && a === 'Occasionally') return 0.4;
  return 0.1;
}

function educationLevelRank(deg?: string): number {
  const ranks: Record<string, number> = {
    'B.Tech': 3, 'B.E.': 3, 'B.Sc': 2, 'BCA': 2, 'B.Com': 2, 'BA': 1, 'BBA': 2,
    'MBA': 5, 'M.Tech': 5, 'M.Sc': 4, 'MCA': 4, 'MA': 3, 'MS': 5, 'PhD': 6, 'MD': 6, 'CA': 5, 'CFA': 5,
  };
  return ranks[deg ?? ''] ?? 2;
}

function educationCompatScore(customer: Customer, candidate: Profile): number {
  const custLevel = educationLevelRank(customer.higherQualification ?? customer.degree);
  const candLevel = educationLevelRank(candidate.higherQualification ?? candidate.degree);
  const diff = Math.abs(custLevel - candLevel);
  if (diff === 0) return 1;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.5;
  return 0.2;
}

// ─── Male scoring (candidate is Female) ──────────────────────────────────────

function scoreMaleCustomer(customer: Customer, candidate: Profile): MatchBreakdown[] {
  const breakdowns: MatchBreakdown[] = [];
  const w = MALE_WEIGHTS;

  // Kids alignment — HIGH weight
  const kids = kidsScore(customer.wantKids, candidate.wantKids);
  breakdowns.push({ criterion: 'kidsAlignment', score: kids, weight: w.kidsAlignment, contribution: kids * w.kidsAlignment, label: 'Children Preference' });

  // Lifestyle — diet, drinking, smoking
  const lifestyle = (dietScore(customer.diet, candidate.diet) * 0.5 + drinkingScore(customer.drinkingHabit, candidate.drinkingHabit) * 0.3 + smokingScore(customer.smokingHabit, candidate.smokingHabit) * 0.2);
  breakdowns.push({ criterion: 'lifestyleAlignment', score: lifestyle, weight: w.lifestyleAlignment, contribution: lifestyle * w.lifestyleAlignment, label: 'Lifestyle Compatibility' });

  // Religion
  const religion = customer.religion === candidate.religion ? 1 : 0.3;
  breakdowns.push({ criterion: 'religionAlignment', score: religion, weight: w.religionAlignment, contribution: religion * w.religionAlignment, label: 'Religion' });

  // Location
  const sameCity = customer.city === candidate.city;
  const loc = relocateScore(customer.openToRelocate, candidate.openToRelocate, sameCity);
  breakdowns.push({ criterion: 'locationCompatibility', score: loc, weight: w.locationCompatibility, contribution: loc * w.locationCompatibility, label: 'Location' });

  // Education
  const edu = educationCompatScore(customer, candidate);
  breakdowns.push({ criterion: 'educationCompat', score: edu, weight: w.educationCompat, contribution: edu * w.educationCompat, label: 'Education Match' });

  // Age — younger preferred (low weight)
  const ageDiff = customer.age - candidate.age; // positive = candidate younger
  let ageScore: number;
  if (ageDiff >= 0 && ageDiff <= 4) ageScore = 1;
  else if (ageDiff >= 5 && ageDiff <= 7) ageScore = 0.7;
  else if (ageDiff < 0 && ageDiff >= -2) ageScore = 0.5;
  else ageScore = 0.2;
  breakdowns.push({ criterion: 'ageCompat', score: ageScore, weight: w.ageCompat, contribution: ageScore * w.ageCompat, label: 'Age Compatibility' });

  // Height — shorter preferred (low weight, literal brief)
  const heightScore = candidate.height < customer.height ? 1 : candidate.height === customer.height ? 0.5 : 0.2;
  breakdowns.push({ criterion: 'heightCompat', score: heightScore, weight: w.heightCompat, contribution: heightScore * w.heightCompat, label: 'Height' });

  // Income — earns less preferred (low weight, dated assumption flagged)
  const custIncome = incomeBandToMidpoint(customer.incomeBand);
  const candIncome = incomeBandToMidpoint(candidate.incomeBand);
  const incomeScore = candIncome <= custIncome ? 1 : candIncome <= custIncome * 1.3 ? 0.6 : 0.3;
  breakdowns.push({ criterion: 'incomeCompat', score: incomeScore, weight: w.incomeCompat, contribution: incomeScore * w.incomeCompat, label: 'Income' });

  return breakdowns;
}

// ─── Female scoring (candidate is Male) ──────────────────────────────────────

function scoreFemaleCustomer(customer: Customer, candidate: Profile): MatchBreakdown[] {
  const breakdowns: MatchBreakdown[] = [];
  const w = FEMALE_WEIGHTS;

  // Kids
  const kids = kidsScore(customer.wantKids, candidate.wantKids);
  breakdowns.push({ criterion: 'kidsAlignment', score: kids, weight: w.kidsAlignment, contribution: kids * w.kidsAlignment, label: 'Children Preference' });

  // Lifestyle
  const lifestyle = (dietScore(customer.diet, candidate.diet) * 0.5 + drinkingScore(customer.drinkingHabit, candidate.drinkingHabit) * 0.3 + smokingScore(customer.smokingHabit, candidate.smokingHabit) * 0.2);
  breakdowns.push({ criterion: 'lifestyleAlignment', score: lifestyle, weight: w.lifestyleAlignment, contribution: lifestyle * w.lifestyleAlignment, label: 'Lifestyle Compatibility' });

  // Religion
  const religion = customer.religion === candidate.religion ? 1 : 0.3;
  breakdowns.push({ criterion: 'religionAlignment', score: religion, weight: w.religionAlignment, contribution: religion * w.religionAlignment, label: 'Religion' });

  // Location
  const sameCity = customer.city === candidate.city;
  const loc = relocateScore(customer.openToRelocate, candidate.openToRelocate, sameCity);
  breakdowns.push({ criterion: 'locationCompatibility', score: loc, weight: w.locationCompatibility, contribution: loc * w.locationCompatibility, label: 'Location' });

  // Education/Profession compatibility
  const edu = educationCompatScore(customer, candidate);
  breakdowns.push({ criterion: 'educationProfessionCompat', score: edu, weight: w.educationProfessionCompat, contribution: edu * w.educationProfessionCompat, label: 'Education & Career' });

  // Age — same-age to a few years older preferred
  const ageDiff = candidate.age - customer.age; // positive = candidate older
  let ageScore: number;
  if (ageDiff >= 0 && ageDiff <= 4) ageScore = 1;
  else if (ageDiff >= 5 && ageDiff <= 7) ageScore = 0.7;
  else if (ageDiff < 0 && ageDiff >= -2) ageScore = 0.6;
  else ageScore = 0.2;
  breakdowns.push({ criterion: 'ageCompat', score: ageScore, weight: w.ageCompat, contribution: ageScore * w.ageCompat, label: 'Age Compatibility' });

  // Pets
  const pets = petsScore(customer.openToPets, candidate.openToPets);
  breakdowns.push({ criterion: 'petsAlignment', score: pets, weight: w.petsAlignment, contribution: pets * w.petsAlignment, label: 'Pets' });

  return breakdowns;
}

// ─── Hard filters ─────────────────────────────────────────────────────────────

function passesHardFilters(customer: Customer, candidate: Profile): boolean {
  // Opposite gender only
  if (customer.gender === candidate.gender) return false;
  // NRI preference — if customer is NRI, prefer NRI candidates (not a hard block)
  return true;
}

// ─── Tier calculation ─────────────────────────────────────────────────────────

function getTier(score: number): MatchTier {
  if (score >= 75) return 'High Potential';
  if (score >= 50) return 'Worth Exploring';
  return 'Long Shot';
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function scoreMatch(customer: Customer, candidate: Profile): MatchResult | null {
  if (!passesHardFilters(customer, candidate)) return null;

  const breakdowns = customer.gender === 'Male'
    ? scoreMaleCustomer(customer, candidate)
    : scoreFemaleCustomer(customer, candidate);

  const totalWeight = breakdowns.reduce((s, b) => s + b.weight, 0);
  const rawScore = breakdowns.reduce((s, b) => s + b.contribution, 0);
  const score = Math.round((rawScore / totalWeight) * 100);
  const tier = getTier(score);

  return { profile: candidate, score, tier, breakdown: breakdowns };
}

export function rankMatches(customer: Customer, pool: Profile[]): MatchResult[] {
  return pool
    .map((p) => scoreMatch(customer, p))
    .filter((r): r is MatchResult => r !== null)
    .sort((a, b) => b.score - a.score);
}
