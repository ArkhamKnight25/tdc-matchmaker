import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import type { Profile, Gender } from '../types';
import poolProfiles from '../data/pool-profiles.json';

const POOL = poolProfiles as unknown as Profile[];

export function PoolProfilesPage() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<Gender | 'All'>('All');
  const [cityFilter, setCityFilter] = useState('All');

  const cities = useMemo(() => ['All', ...Array.from(new Set(POOL.map((p) => p.city))).sort()], []);

  const filtered = useMemo(() => {
    let list = POOL;
    if (search) list = list.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()));
    if (genderFilter !== 'All') list = list.filter((p) => p.gender === genderFilter);
    if (cityFilter !== 'All') list = list.filter((p) => p.city === cityFilter);
    return list;
  }, [search, genderFilter, cityFilter]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Profile Pool</h1>
        <p className="text-sm text-stone-500 mt-1">{POOL.length} profiles available for matching</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
          />
        </div>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value as Gender | 'All')} className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]">
          <option value="All">All genders</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]">
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="divide-y divide-stone-50">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide bg-stone-50">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Career</div>
            <div className="col-span-2">Values</div>
            <div className="col-span-2">Lifestyle</div>
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">No profiles found.</div>
          ) : (
            filtered.map((profile) => {
              const name = `${profile.firstName} ${profile.lastName}`;
              return (
                <div key={profile.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-stone-50 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar name={name} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-stone-800">{name}</div>
                      <div className="text-xs text-stone-400">{profile.age} · {profile.gender}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-stone-600">{profile.city}</div>
                  <div className="col-span-2 text-xs text-stone-500">{profile.designation}<br /><span className="text-stone-400">{profile.incomeBand}</span></div>
                  <div className="col-span-2 text-xs text-stone-500">{profile.religion}<br /><span className="text-stone-400">{profile.diet}</span></div>
                  <div className="col-span-2 text-xs text-stone-500">Kids: {profile.wantKids}<br /><span className="text-stone-400">Relocate: {profile.openToRelocate}</span></div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
