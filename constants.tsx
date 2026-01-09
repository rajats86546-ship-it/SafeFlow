
import React from 'react';
import { 
  Users, 
  ShieldAlert, 
  Map as MapIcon, 
  Activity, 
  MessageSquare,
  ArrowRightLeft,
  Settings,
  Camera,
  Radar
} from 'lucide-react';
import { VenueSection, Incident } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
  { id: 'tracking', label: 'Live Tracking', icon: <Radar className="w-5 h-5 text-blue-400" /> },
  { id: 'surveillance', label: 'Surveillance', icon: <Camera className="w-5 h-5" /> },
  { id: 'map', label: 'Venue Map', icon: <MapIcon className="w-5 h-5" /> },
  { id: 'incidents', label: 'Incidents', icon: <ShieldAlert className="w-5 h-5" /> },
  { id: 'flow', label: 'Flow Analysis', icon: <ArrowRightLeft className="w-5 h-5" /> },
  { id: 'ai-assistant', label: 'AI Safety Hub', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const MOCK_SECTIONS: VenueSection[] = [
  { id: 'A1', name: 'West Gate Entrance', occupancy: 0, capacity: 500, status: 'normal', flowRate: 0, gateType: 'entrance' },
  { id: 'B1', name: 'Grand Stand North', occupancy: 0, capacity: 3000, status: 'normal', flowRate: 0, gateType: 'zone' },
  { id: 'C1', name: 'Concourse A (Food)', occupancy: 0, capacity: 1000, status: 'normal', flowRate: 0, gateType: 'zone' },
  { id: 'D1', name: 'East Gate Exit', occupancy: 0, capacity: 600, status: 'normal', flowRate: 0, gateType: 'exit' },
  { id: 'E1', name: 'VIP Lounge', occupancy: 0, capacity: 200, status: 'normal', flowRate: 0, gateType: 'zone' },
  { id: 'F1', name: 'Media Center', occupancy: 0, capacity: 100, status: 'normal', flowRate: 0, gateType: 'zone' },
  { id: 'G1', name: 'South Bleachers', occupancy: 0, capacity: 3000, status: 'normal', flowRate: 0, gateType: 'zone' },
  { id: 'H1', name: 'Main Plaza', occupancy: 0, capacity: 5000, status: 'normal', flowRate: 0, gateType: 'zone' },
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
  }
];
