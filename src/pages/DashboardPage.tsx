import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import { StatusPill } from '../components/ui/StatusPill';
import { Avatar } from '../components/ui/Avatar';
import type { JourneyStage, Customer } from '../types';

const STAGES: JourneyStage[] = ['New', 'Profile Verified', 'Matching', 'Intro Sent', 'On Hold', 'Matched'];

type SortKey = 'name' | 'age' | 'stage' | 'lastContact';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-stone-800">{value}</div>
        <div className="text-xs text-stone-500">{label}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { matchmaker } = useAuth();
  const { customers } = useCustomers();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<JourneyStage | 'All'>('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const myCustomers = customers.filter((c) => c.assignedMatchmakerId === matchmaker?.id);

  const cities = useMemo(() => ['All', ...Array.from(new Set(myCustomers.map((c) => c.city)))], [myCustomers]);

  const filtered = useMemo(() => {
    let list = myCustomers;
    if (search) list = list.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()));
    if (stageFilter !== 'All') list = list.filter((c) => c.journeyStage === stageFilter);
    if (cityFilter !== 'All') list = list.filter((c) => c.city === cityFilter);

    const stageOrder: Record<JourneyStage, number> = { 'New': 0, 'Profile Verified': 1, 'Matching': 2, 'Intro Sent': 3, 'On Hold': 4, 'Matched': 5 };
    list = [...list].sort((a, b) => {
      let diff = 0;
      if (sortKey === 'name') diff = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortKey === 'age') diff = a.age - b.age;
      else if (sortKey === 'stage') diff = stageOrder[a.journeyStage] - stageOrder[b.journeyStage];
      else if (sortKey === 'lastContact') diff = a.lastContactDate.localeCompare(b.lastContactDate);
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [myCustomers, search, stageFilter, cityFilter, sortKey, sortAsc]);

  const stats = useMemo(() => ({
    total: myCustomers.length,
    active: myCustomers.filter((c) => ['Matching', 'Intro Sent'].includes(c.journeyStage)).length,
    awaiting: myCustomers.filter((c) => ['New', 'Profile Verified'].includes(c.journeyStage)).length,
    matched: myCustomers.filter((c) => c.journeyStage === 'Matched').length,
  }), [myCustomers]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    return (
      <button onClick={() => toggleSort(k)} className={`text-xs px-2 py-1 rounded-md transition-colors ${sortKey === k ? 'bg-[#9b1c5a] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
        {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
      </button>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Good morning, {matchmaker?.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-stone-500 mt-1">Here's a snapshot of your clients today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label="Total Clients" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Active" value={stats.active} color="bg-amber-50 text-amber-600" />
        <StatCard icon={Clock} label="Awaiting Action" value={stats.awaiting} color="bg-purple-50 text-purple-600" />
        <StatCard icon={CheckCircle2} label="Matched" value={stats.matched} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as JourneyStage | 'All')}
            className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
          >
            <option value="All">All stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
          >
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <SortBtn k="name" label="Name" />
            <SortBtn k="age" label="Age" />
            <SortBtn k="stage" label="Stage" />
            <SortBtn k="lastContact" label="Recent" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No clients match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide bg-stone-50">
              <div className="col-span-4">Client</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Background</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Last Contact</div>
            </div>
            {filtered.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} onClick={() => navigate(`/customers/${customer.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerRow({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  const name = `${customer.firstName} ${customer.lastName}`;
  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-12 gap-3 px-4 py-3.5 hover:bg-[#fdf2f7] transition-colors text-left group"
    >
      <div className="col-span-4 flex items-center gap-3">
        <Avatar name={name} size="md" verified={customer.isVerified} />
        <div>
          <div className="text-sm font-semibold text-stone-800 group-hover:text-[#9b1c5a]">{name}</div>
          <div className="text-xs text-stone-400">{customer.age} · {customer.gender} · {customer.maritalStatus}</div>
        </div>
      </div>
      <div className="col-span-2 flex items-center text-sm text-stone-600">{customer.city}</div>
      <div className="col-span-2 flex items-center text-xs text-stone-500">{customer.religion} · {customer.diet}</div>
      <div className="col-span-2 flex items-center"><StatusPill stage={customer.journeyStage} /></div>
      <div className="col-span-2 flex items-center text-xs text-stone-400">{customer.lastContactDate}</div>
    </button>
  );
}
