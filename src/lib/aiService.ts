import type { Customer, Profile, MatchResult } from '../types';

// ─── Deterministic fallbacks ──────────────────────────────────────────────────

function buildFallbackExplanation(customer: Customer, candidate: Profile, result: MatchResult): string {
  const highlights: string[] = [];
  const kidsB = result.breakdown.find((b) => b.criterion === 'kidsAlignment');
  if (kidsB && kidsB.score >= 0.8) highlights.push('shared view on children');
  if (customer.city === candidate.city) highlights.push(`both based in ${customer.city}`);
  else if (customer.openToRelocate === 'Yes' || candidate.openToRelocate === 'Yes') highlights.push('relocation flexibility aligns');
  const lifestyleB = result.breakdown.find((b) => b.criterion === 'lifestyleAlignment');
  if (lifestyleB && lifestyleB.score >= 0.8) highlights.push('compatible lifestyle choices');
  if (customer.religion === candidate.religion) highlights.push(`shared ${customer.religion} faith`);
  const eduB = result.breakdown.find((b) => b.criterion.includes('education'));
  if (eduB && eduB.score >= 0.8) highlights.push('complementary educational backgrounds');
  const tierLabel = result.tier === 'High Potential' ? 'Strong match' : result.tier === 'Worth Exploring' ? 'Good potential' : 'Worth a conversation';
  const highlightStr = highlights.length > 0 ? ` — ${highlights.slice(0, 3).join(', ')}.` : '.';
  return `${tierLabel}${highlightStr}`;
}

function buildFallbackIntro(customer: Customer, candidate: Profile): string {
  const custName = `${customer.firstName} ${customer.lastName}`;
  const candName = `${candidate.firstName} ${candidate.lastName}`;
  const location = customer.city === candidate.city
    ? `Both are based in ${customer.city}`
    : `${custName} is in ${customer.city} and ${candName} is in ${candidate.city}`;
  return `Hi! We're excited to introduce ${custName} to ${candName}. ${location}. ${custName} is a ${customer.designation} at ${customer.currentCompany}, and ${candName} is a ${candidate.designation} at ${candidate.currentCompany}. They share compatible values around family, lifestyle, and life goals. We believe this could be a wonderful connection — we encourage both to have an open, relaxed conversation and see where it leads!`;
}

// ─── Proxy call → /api/ai (server holds the key) ─────────────────────────────

async function callAI(prompt: string, fallback: string): Promise<string> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`proxy ${res.status}`);
    const data = await res.json();
    return data.text || fallback;
  } catch {
    return fallback;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getMatchExplanation(customer: Customer, candidate: Profile, result: MatchResult): Promise<string> {
  const fallback = buildFallbackExplanation(customer, candidate, result);
  const topCriteria = result.breakdown
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((b) => `${b.label}: ${Math.round(b.score * 100)}%`)
    .join(', ');

  const prompt = `You are a professional matchmaker writing a brief match explanation for an internal dashboard. Write 1-2 sentences only. Be warm, specific, professional. Do not start with "I".

Customer: ${customer.firstName} ${customer.lastName}, ${customer.age}yo, ${customer.gender}, ${customer.city}, ${customer.designation} at ${customer.currentCompany}, wants kids: ${customer.wantKids}, diet: ${customer.diet}, religion: ${customer.religion}
Candidate: ${candidate.firstName} ${candidate.lastName}, ${candidate.age}yo, ${candidate.city}, ${candidate.designation} at ${candidate.currentCompany}, wants kids: ${candidate.wantKids}, diet: ${candidate.diet}, religion: ${candidate.religion}
Match score: ${result.score}/100 (${result.tier}). Top criteria: ${topCriteria}

Explain why this is a ${result.tier} match in 1-2 sentences.`;

  return callAI(prompt, fallback);
}

export async function getMatchIntro(customer: Customer, candidate: Profile): Promise<string> {
  const fallback = buildFallbackIntro(customer, candidate);

  const prompt = `You are a warm, professional matchmaker. Write a personalized introduction email paragraph (3-4 sentences) introducing ${candidate.firstName} to ${customer.firstName}. Keep it personal, hopeful, and professional. No clichés.

${customer.firstName}: ${customer.age}yo, ${customer.designation} at ${customer.currentCompany}, ${customer.city}, hobbies: ${customer.hobbies.join(', ')}
${candidate.firstName}: ${candidate.age}yo, ${candidate.designation} at ${candidate.currentCompany}, ${candidate.city}, hobbies: ${candidate.hobbies.join(', ')}`;

  return callAI(prompt, fallback);
}
