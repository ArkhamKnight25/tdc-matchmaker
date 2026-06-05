import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, MapPin, Phone, Mail, Heart, Users, BookOpen,
  Briefcase, ChevronDown, ChevronUp, Sparkles, Clock, Plus, Send
} from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { StatusPill } from '../components/ui/StatusPill';
import { Avatar } from '../components/ui/Avatar';

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-[#9b1c5a]" />}
        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | string[] }) {
  if (!value && value !== 0) return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <div>
      <div className="text-xs text-stone-400 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-stone-800">{display}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>;
}

function cmToFtIn(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"  (${cm} cm)`;
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, addNote, addTimelineEvent } = useCustomers();
  const [showExtended, setShowExtended] = useState(false);
  const [noteText, setNoteText] = useState('');

  const customer = getCustomer(id!);

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        <p>Customer not found.</p>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`;

  function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote(customer!.id, noteText.trim());
    addTimelineEvent(customer!.id, { type: 'note', description: noteText.trim(), createdAt: new Date().toISOString() });
    setNoteText('');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#9b1c5a] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} size="xl" verified={customer.isVerified} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-800">{fullName}</h1>
                {customer.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-stone-500 mt-1">{customer.age} · {customer.gender} · {customer.maritalStatus} · {customer.city}, {customer.country}</div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StatusPill stage={customer.journeyStage} />
                <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" />Last contact: {customer.lastContactDate}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
            <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
            <button
              onClick={() => navigate(`/customers/${customer.id}/matches`)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9b1c5a] hover:bg-[#7d1748] rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find Matches
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: biodata */}
        <div className="lg:col-span-2 space-y-4">
          {/* Identity */}
          <Section title="Identity" icon={Users}>
            <FieldGrid>
              <Field label="First Name" value={customer.firstName} />
              <Field label="Last Name" value={customer.lastName} />
              <Field label="Gender" value={customer.gender} />
              <Field label="Date of Birth" value={customer.dateOfBirth} />
              <Field label="Age" value={`${customer.age} years`} />
              <Field label="Height" value={cmToFtIn(customer.height)} />
              <Field label="Physical Status" value={customer.physicalStatus} />
            </FieldGrid>
          </Section>

          {/* Location */}
          <Section title="Location" icon={MapPin}>
            <FieldGrid>
              <Field label="Country" value={customer.country} />
              <Field label="City" value={customer.city} />
              <Field label="Open to Relocate" value={customer.openToRelocate} />
              <Field label="NRI Status" value={customer.nriStatus} />
            </FieldGrid>
          </Section>

          {/* Contact */}
          <Section title="Contact" icon={Phone}>
            <FieldGrid>
              <Field label="Email" value={customer.email} />
              <Field label="Phone" value={customer.phone} />
            </FieldGrid>
          </Section>

          {/* Education & Career */}
          <Section title="Education & Career" icon={BookOpen}>
            <FieldGrid>
              <Field label="Undergraduate College" value={customer.undergraduateCollege} />
              <Field label="Degree" value={customer.degree} />
              <Field label="Field of Study" value={customer.fieldOfStudy} />
              <Field label="Higher Qualification" value={customer.higherQualification} />
              <Field label="Current Company" value={customer.currentCompany} />
              <Field label="Designation" value={customer.designation} />
              <Field label="Annual Income" value={customer.incomeBand} />
            </FieldGrid>
          </Section>

          {/* Background */}
          <Section title="Background" icon={Heart}>
            <FieldGrid>
              <Field label="Marital Status" value={customer.maritalStatus} />
              <Field label="Religion" value={customer.religion} />
              <Field label="Caste" value={customer.caste} />
              <Field label="Mother Tongue" value={customer.motherTongue} />
              <Field label="Languages Known" value={customer.languagesKnown} />
              <Field label="Siblings" value={customer.siblings} />
              <Field label="Family Type" value={customer.familyType} />
              <Field label="Father's Occupation" value={customer.fatherOccupation} />
              <Field label="Mother's Occupation" value={customer.motherOccupation} />
            </FieldGrid>
          </Section>

          {/* Preferences */}
          <Section title="Lifestyle & Preferences" icon={Briefcase}>
            <FieldGrid>
              <Field label="Want Kids" value={customer.wantKids} />
              <Field label="Open to Pets" value={customer.openToPets} />
              <Field label="Diet" value={customer.diet} />
              <Field label="Drinking" value={customer.drinkingHabit} />
              <Field label="Smoking" value={customer.smokingHabit} />
              <Field label="Hobbies" value={customer.hobbies} />
            </FieldGrid>
            {customer.partnerExpectations && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="text-xs text-stone-400 mb-1">Partner Expectations</div>
                <p className="text-sm text-stone-700 leading-relaxed italic">"{customer.partnerExpectations}"</p>
              </div>
            )}
          </Section>

          {/* Extended Profile (toggle) */}
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <button
              onClick={() => setShowExtended(!showExtended)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9b1c5a]" />
                Extended Profile (Indian Matchmaking Fields)
              </span>
              {showExtended ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </button>
            {showExtended && (
              <div className="px-5 pb-5 border-t border-stone-100">
                <p className="text-xs text-stone-400 py-3 italic">These fields reflect culturally-relevant details gathered during the intake process. They are used to inform matching with appropriate sensitivity.</p>
                <FieldGrid>
                  <Field label="Sub-Caste / Gotra" value={customer.subCaste ?? '—'} />
                  <Field label="Manglik / Horoscope" value={customer.manglik} />
                  <Field label="Mother Tongue" value={customer.motherTongue} />
                  <Field label="Family Type" value={customer.familyType} />
                  <Field label="Father's Occupation" value={customer.fatherOccupation} />
                  <Field label="Mother's Occupation" value={customer.motherOccupation} />
                  <Field label="Drinking Habit" value={customer.drinkingHabit} />
                  <Field label="Smoking Habit" value={customer.smokingHabit} />
                  <Field label="NRI Status" value={customer.nriStatus} />
                  <Field label="Physical Status" value={customer.physicalStatus} />
                </FieldGrid>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notes + Timeline */}
        <div className="space-y-4">
          {/* Notes panel */}
          <Section title="Matchmaker Notes" icon={BookOpen}>
            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a call note, observation…"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#9b1c5a]/30 focus:border-[#9b1c5a]"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="mt-2 flex items-center gap-1.5 w-full justify-center py-2 text-xs font-semibold bg-[#9b1c5a] text-white rounded-lg hover:bg-[#7d1748] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {customer.notes.length === 0 && <p className="text-xs text-stone-400 text-center py-4">No notes yet.</p>}
              {customer.notes.map((note) => (
                <div key={note.id} className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-stone-700">{note.text}</p>
                  <div className="text-[10px] text-stone-400 mt-1">{new Date(note.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline" icon={Clock}>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {customer.timeline.length === 0 && <p className="text-xs text-stone-400 text-center py-4">No activity yet.</p>}
              {[...customer.timeline].reverse().map((event) => (
                <div key={event.id} className="flex gap-2.5">
                  <div className="shrink-0 mt-1">
                    {event.type === 'intro_sent' ? <Send className="w-3.5 h-3.5 text-purple-500" /> :
                     event.type === 'stage_change' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
                     <Clock className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-xs text-stone-700">{event.description}</p>
                    <div className="text-[10px] text-stone-400 mt-0.5">{new Date(event.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
