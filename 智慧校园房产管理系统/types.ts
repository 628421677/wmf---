export type BuildingType = 'teaching' | 'dorm' | 'admin' | 'facility';

export interface PipeNode {
  id: string;
  coordinates: { x: number; y: number }[];
  status: 'normal' | 'warning' | 'critical';
  material: string;
  diameter: number;
  depth: number;
  installDate: string;
  connectedBuildingIds: string[];
  flowRate: number;
  lastMaintain: string;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  status: 'active' | 'maintenance' | 'closed';
  coordinates: { x: number; y: number };
  
  // Property Attributes
  totalArea: number; // sqm
  floorCount: number;
  buildYear: number;
  occupancyRate: number; // 0-100 percentage
  rooms?: number;
  
  // Management Info
  manager: string;
  lastSafetyCheck: string;
  energyUsage: number; // Daily kWh
  
  connectedPipeId?: string;
  keyEquipment?: string[];
}

export interface WorkOrder {
  id: string;
  targetId: string;
  type: 'repair' | 'cleaning' | 'security' | 'renovation';
  status: 'pending' | 'processing' | 'completed';
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Alert {
  id: string;
  message: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  category: 'security' | 'fire' | 'energy' | 'capacity';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}