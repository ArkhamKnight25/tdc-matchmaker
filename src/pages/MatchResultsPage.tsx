import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { rankMatches } from '../lib/matchingEngine';
import { getMatchExplanation } from '../lib/aiService';
import { TierBadge } from '../components/ui/TierBadge';
import { Avatar } from '../components/ui/Avatar';
import { SendMatchModal } from '../components/SendMatchModal';
import { useToast } from '../components/ui/Toast';
import type { MatchResult, MatchTier, Profile } from '../types';
import poolProfiles from '../data/pool-profiles.json';

const POOL = poolProfiles as unknown as Profile[];
const TIER_ORDER: MatchTier[] = ['High Potential', 'Worth Exploring', 'Long Shot'];

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-stone-400 w-28 shrink-0">{label}</div>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#9b1c5a] rounded-full transition-all duration-500"
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
      <div className="text-xs text-stone-500 w-8 text-right">{Math.round(score * 100)}%</div>
    </div>
  );
}

function MatchCard({ result, onSend }: { result: MatchResult; onSend: (r: MatchResult) => void }) {
  const [expanded, setExpanded] = useState(false);
  const name = `${result.profile.firstName} ${result.profile.lastName}`;

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Profile info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar name={name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-800 text-sm">{name}</div>
              <div className="text-xs text-stone-400 mt-0.5">{result.profile.age} · {result.profile.city} · {result.profile.designation}</div>
              <div className="text-xs text-stone-400">{result.profile.currentCompany} · {result.profile.incomeBand}</div>
            </div>
          </div>

          {/* Score */}
          <div className="shrink-0">
            <TierBadge tier={result.tier} score={result.score} />
          </div>
        </div>

        {/* AI explanation */}
        {result.isLoadingAI ? (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating AI insight…</span>
          </div>
        ) : result.aiExplanation ? (
          <p className="mt-3 text-xs text-stone-600 bg-[#fdf2f7] border border-[#f4cfe1] rounded-lg px-3 py-2 italic">
            <Sparkles className="w-3 h-3 inline mr-1 text-[#9b1c5a]" />
            {result.aiExplanation}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#9b1c5a] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Score breakdown
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onSend(result)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#9b1c5a] hover:bg-[#7d1748] rounded-lg transition-colors"
          >
            <Send className="w-3 h-3" />
            Send Match
          </button>
        </div>
      </div>

      {/* Breakdown */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-stone-50 space-y-1.5">
          {result.breakdown
            .sort((a, b) => b.weight - a.weight)
            .map((b) => (
              <ScoreBar key={b.criterion} score={b.score} label={b.label} />
            ))}
          <div className="mt-3 grid grid-cols-3 text-xs text-stone-400 gap-2">
            <div><span className="text-stone-600 font-medium">{result.profile.religion}</span><br />Religion</div>
            <div><span className="text-stone-600 font-medium">{result.profile.diet}</span><br />Diet</div>
            <div><span className="text-stone-600 font-medium">{result.profile.wantKids}</span><br />Wants Kids</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, addTimelineEvent, updateJourneyStage } = useCustomers();
  const { showToast } = useToast();

  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<MatchTier | 'All'>('All');
  const [modalResult, setModalResult] = useState<MatchResult | null>(null);

  const customer = getCustomer(id!);

  useEffect(() => {
    if (!customer) return;
    setLoading(true);

    const ranked = rankMatches(customer, POOL);
    // Mark all as loading AI
    const withLoading = ranked.map((r) => ({ ...r, isLoadingAI: true }));
    setResults(withLoading);
    setLoading(false);

    // Load AI explanations progressively (batched to avoid overwhelming)
    const topN = ranked.slice(0, 20); // Only fetch AI for top 20
    topN.forEach((r, i) => {
      setTimeout(async () => {
        const explanation = await getMatchExplanation(customer, r.profile, r);
        setResults((prev) =>
          prev.map((pr) =>
            pr.profile.id === r.profile.id ? { ...pr, aiExplanation: explanation, isLoadingAI: false } : pr
          )
        );
      }, i * 100); // stagger
    });

    // Mark remaining as not loading
    setTimeout(() => {
      setResults((prev) =>
        prev.map((r, i) => (i >= 20 ? { ...r, isLoadingAI: false } : r))
      );
    }, 100);
  }, [id]);

  function handleSend(result: MatchResult) {
    setModalResult(result);
  }

  function handleConfirmSend(_intro: string) {
    if (!customer || !modalResult) return;
    const candName = `${modalResult.profile.firstName} ${modalResult.profile.lastName}`;

    addTimelineEvent(customer.id, {
      type: 'intro_sent',
      description: `Intro sent to ${candName} on ${new Date().toLocaleDateString('en-IN')}`,
      createdAt: new Date().toISOString(),
      relatedProfileId: modalResult.profile.id,
      relatedProfileName: candName,
    });
    addTimelineEvent(customer.id, {
      type: 'stage_change',
      description: 'Stage advanced to Intro Sent',
      createdAt: new Date().toISOString(),
    });
    updateJourneyStage(customer.id, 'Intro Sent');
    showToast(`Introduction sent to ${candName} successfully!`);
    setModalResult(null);
  }

  if (!customer) return <div className="p-6 text-stone-400">Customer not found.</div>;

  const displayed = tierFilter === 'All' ? results : results.filter((r) => r.tier === tierFilter);
  const tierCounts = Object.fromEntries(TIER_ORDER.map((t) => [t, results.filter((r) => r.tier === t).length]));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <button onClick={() => navigate(`/customers/${id}`)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#9b1c5a] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to {customer.firstName}'s Profile
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#9b1c5a]" />
            Match Results
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {results.length} candidates scored for {customer.firstName} {customer.lastName}
          </p>
        </div>
      </div>

      {/* Algorithm note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800">
        <strong>Matching logic note:</strong> For {customer.gender === 'Male' ? 'male' : 'female'} clients, this engine weights{' '}
        {customer.gender === 'Male'
          ? 'children alignment (25%), lifestyle compatibility (20%), and religion (15%) most heavily. Age/height/income are intentionally low-weight signals.'
          : 'children alignment (22%), lifestyle (18%), location (15%), and education/profession (15%) most heavily.'}
        {' '}All weights are tunable.
      </div>

      {/* Tier filter */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Running matching algorithm…</span>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {(['All', ...TIER_ORDER] as const).map((t) => {
              const count = t === 'All' ? results.length : tierCounts[t];
              return (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    tierFilter === t
                      ? 'bg-[#9b1c5a] text-white border-[#9b1c5a]'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-[#9b1c5a]'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {displayed.slice(0, 30).map((result) => (
              <MatchCard key={result.profile.id} result={result} onSend={handleSend} />
            ))}
            {displayed.length === 0 && (
              <div className="text-center py-12 text-stone-400">No matches in this tier.</div>
            )}
            {displayed.length > 30 && (
              <p className="text-center text-xs text-stone-400 py-2">Showing top 30 of {displayed.length}</p>
            )}
          </div>
        </>
      )}

      {/* Send Modal */}
      {modalResult && (
        <SendMatchModal
          customer={customer}
          candidate={modalResult.profile}
          matchResult={modalResult}
          onClose={() => setModalResult(null)}
          onSend={handleConfirmSend}
        />
      )}
    </div>
  );
}
