
export interface VenueSection {
  id: string;
  name: string;
  occupancy: number;
  capacity: number;
  status: 'normal' | 'congested' | 'critical';
  flowRate: number; // people per minute
}

export interface Incident {
  id: string;
  type: 'medical' | 'fire' | 'security' | 'structural';
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  status: 'active' | 'responding' | 'resolved';
}

export interface AIResponse {
  priority: string;
  actions: string[];
  suggestedRoute?: string;
  riskAssessment: string;
}
