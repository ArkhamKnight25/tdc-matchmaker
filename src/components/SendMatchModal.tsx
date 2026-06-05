import { useState, useEffect } from 'react';
import { X, Send, Loader2, Mail } from 'lucide-react';
import type { Customer, Profile, MatchResult } from '../types';
import { getMatchIntro } from '../lib/aiService';
import { Avatar } from './ui/Avatar';
import { TierBadge } from './ui/TierBadge';

interface Props {
  customer: Customer;
  candidate: Profile;
  matchResult: MatchResult;
  onClose: () => void;
  onSend: (intro: string) => void;
}

export function SendMatchModal({ customer, candidate, matchResult, onClose, onSend }: Props) {
  const [intro, setIntro] = useState(matchResult.aiIntro ?? '');
  const [loadingIntro, setLoadingIntro] = useState(!matchResult.aiIntro);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!matchResult.aiIntro) {
      setLoadingIntro(true);
      getMatchIntro(customer, candidate).then((text) => {
        setIntro(text);
        setLoadingIntro(false);
      });
    }
  }, []);

  async function handleSend() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    onSend(intro);
    setSending(false);
  }

  const custName = `${customer.firstName} ${customer.lastName}`;
  const candName = `${candidate.firstName} ${candidate.lastName}`;
  const subject = `TDC Introduction: ${custName} × ${candName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#9b1c5a]" />
            <h2 className="text-base font-bold text-stone-800">Send Match Introduction</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Email preview header */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-400 w-14 text-xs font-medium">To:</span>
              <span className="font-medium text-stone-800">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-400 w-14 text-xs font-medium">CC:</span>
              <span className="font-medium text-stone-800">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm border-t border-stone-200 pt-2 mt-2">
              <span className="text-stone-400 w-14 text-xs font-medium">Subject:</span>
              <span className="font-medium text-stone-800">{subject}</span>
            </div>
          </div>

          {/* Match cards */}
          <div className="grid grid-cols-2 gap-3">
            {[{ profile: customer, label: 'Your Client' }, { profile: candidate, label: 'Suggested Match' }].map(({ profile, label }) => (
              <div key={profile.id} className="bg-white border border-stone-100 rounded-xl p-3">
                <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mb-2">{label}</div>
                <div className="flex items-center gap-2.5">
                  <Avatar name={`${profile.firstName} ${profile.lastName}`} size="sm" />
                  <div>
                    <div className="text-sm font-semibold text-stone-800">{profile.firstName} {profile.lastName}</div>
                    <div className="text-xs text-stone-400">{profile.age} · {profile.city} · {profile.designation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Match score */}
          <div className="flex items-center gap-3">
            <TierBadge tier={matchResult.tier} score={matchResult.score} />
            {matchResult.aiExplanation && <p className="text-sm text-stone-600 italic flex-1">{matchResult.aiExplanation}</p>}
          </div>

          {/* Editable intro */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Introduction Message (editable)</label>
            {loadingIntro ? (
              <div className="flex items-center gap-2 py-8 justify-center text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Generating personalized introduction…</span>
              </div>
            ) : (
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-stone-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loadingIntro}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#9b1c5a] hover:bg-[#7d1748] rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send Introduction'}
          </button>
        </div>
      </div>
    </div>
  );
}
