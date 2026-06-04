import type { Matchmaker } from '../types';

export const MATCHMAKERS: Matchmaker[] = [
  {
    id: 'mm1',
    name: 'Priya Sharma',
    email: 'priya@tdc.com',
    password: 'tdc@2024',
    assignedCustomerIds: ['c1', 'c2', 'c3'],
  },
  {
    id: 'mm2',
    name: 'Rahul Verma',
    email: 'rahul@tdc.com',
    password: 'tdc@2024',
    assignedCustomerIds: ['c4', 'c5'],
  },
];

export const DEMO_CREDENTIALS = { email: 'priya@tdc.com', password: 'tdc@2024' };
