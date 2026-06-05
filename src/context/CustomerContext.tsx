import { createContext, useContext, useState, type ReactNode } from 'react';
import { CUSTOMERS } from '../data/customers';
import type { Customer, Note, TimelineEvent } from '../types';

interface CustomerContextType {
  customers: Customer[];
  getCustomer: (id: string) => Customer | undefined;
  addNote: (customerId: string, text: string) => void;
  addTimelineEvent: (customerId: string, event: Omit<TimelineEvent, 'id'>) => void;
  updateJourneyStage: (customerId: string, stage: Customer['journeyStage']) => void;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

const STORAGE_KEY = 'tdc_customers';

function loadCustomers(): Customer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return CUSTOMERS;
}

function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  function update(updater: (prev: Customer[]) => Customer[]) {
    setCustomers((prev) => {
      const next = updater(prev);
      saveCustomers(next);
      return next;
    });
  }

  function getCustomer(id: string) {
    return customers.find((c) => c.id === id);
  }

  function addNote(customerId: string, text: string) {
    const note: Note = { id: `n${Date.now()}`, text, createdAt: new Date().toISOString() };
    update((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, notes: [note, ...c.notes] } : c))
    );
  }

  function addTimelineEvent(customerId: string, event: Omit<TimelineEvent, 'id'>) {
    const full: TimelineEvent = { id: `t${Date.now()}`, ...event };
    update((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, timeline: [...c.timeline, full] } : c))
    );
  }

  function updateJourneyStage(customerId: string, stage: Customer['journeyStage']) {
    update((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, journeyStage: stage } : c))
    );
  }

  return (
    <CustomerContext.Provider value={{ customers, getCustomer, addNote, addTimelineEvent, updateJourneyStage }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be inside CustomerProvider');
  return ctx;
}
