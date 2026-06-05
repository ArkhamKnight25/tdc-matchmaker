import { Heart, Info } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../data/auth';

export function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Settings</h1>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-3">Demo Credentials</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-400 w-20">Email:</span>
              <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-800 text-xs">{DEMO_CREDENTIALS.email}</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-400 w-20">Password:</span>
              <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-800 text-xs">{DEMO_CREDENTIALS.password}</code>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>A second matchmaker account exists: <strong>rahul@tdc.com</strong> / <strong>tdc@2024</strong> — assigned to different clients (Vikram, Rohan).</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-3">AI Integration</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Match explanations and personalized intros are generated via an AI proxy at <code className="bg-stone-100 px-1 rounded text-xs">/api/ai</code>.
            A deterministic fallback ensures the demo works offline — explanations are built from match breakdown data when the AI endpoint is unavailable.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 className="text-sm font-bold text-stone-700 mb-3">Matching Engine Assumptions</h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            The assignment brief specified age/height/income signals for male customers ("younger, shorter, earns less"). These are implemented with <strong>intentionally low weights</strong> (5–8%) to reflect that they encode dated assumptions. Compatibility signals — kids alignment, lifestyle, religion, location — carry significantly higher weights (12–25%).
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Female customer matching emphasizes education/profession compatibility, shared values, and lifestyle alignment. All weights are defined as a tunable object in <code className="bg-stone-100 px-1 rounded text-xs">src/lib/matchingEngine.ts</code> and can be adjusted per-deployment.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9b1c5a] flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-stone-800">TDC Matchmaker Dashboard</div>
            <div className="text-xs text-stone-400">Built for The Date Crew internship assignment</div>
          </div>
        </div>
      </div>
    </div>
  );
}
