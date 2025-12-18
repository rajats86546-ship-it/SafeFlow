
import React from 'react';
import { 
  Users, 
  ShieldAlert, 
  Map as MapIcon, 
  Activity, 
  MessageSquare,
  ArrowRightLeft,
  Settings
} from 'lucide-react';
import { VenueSection, Incident } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
  { id: 'map', label: 'Venue Map', icon: <MapIcon className="w-5 h-5" /> },
  { id: 'incidents', label: 'Incidents', icon: <ShieldAlert className="w-5 h-5" /> },
  { id: 'flow', label: 'Flow Analysis', icon: <ArrowRightLeft className="w-5 h-5" /> },
  { id: 'ai-assistant', label: 'AI Safety Hub', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const MOCK_SECTIONS: VenueSection[] = [
  { id: 'A1', name: 'West Gate Entrance', occupancy: 480, capacity: 500, status: 'congested', flowRate: 45 },
  { id: 'B1', name: 'Grand Stand North', occupancy: 1200, capacity: 3000, status: 'normal', flowRate: 12 },
  { id: 'C1', name: 'Concourse A (Food)', occupancy: 920, capacity: 1000, status: 'congested', flowRate: 30 },
  { id: 'D1', name: 'East Gate Exit', occupancy: 200, capacity: 600, status: 'normal', flowRate: 80 },
  { id: 'E1', name: 'VIP Lounge', occupancy: 195, capacity: 200, status: 'critical', flowRate: 5 },
  { id: 'F1', name: 'Media Center', occupancy: 50, capacity: 100, status: 'normal', flowRate: 2 },
  { id: 'G1', name: 'South Bleachers', occupancy: 2800, capacity: 3000, status: 'congested', flowRate: 15 },
  { id: 'H1', name: 'Main Plaza', occupancy: 4500, capacity: 5000, status: 'normal', flowRate: 120 },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    type: 'medical',
    location: 'Section B12',
    severity: 'high',
    timestamp: '19:04',
    description: 'Spectator collapsed, suspected heat stroke. Medics dispatched.',
    status: 'responding'
  },
  {
    id: 'INC-002',
    type: 'security',
    location: 'West Gate Entrance',
    severity: 'medium',
    timestamp: '18:55',
    description: 'Ticket scanning hardware failure causing bottleneck.',
    status: 'active'
  },
  {
    id: 'INC-003',
    type: 'fire',
    location: 'Concourse A (Kitchen)',
    severity: 'low',
    timestamp: '18:30',
    description: 'Small grease fire contained by staff. Smoke cleared.',
    status: 'resolved'
  }
];
