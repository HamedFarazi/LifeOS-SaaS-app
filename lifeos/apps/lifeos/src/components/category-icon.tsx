import React from 'react';
import {
  Layers, Globe, Server, ShieldCheck, Shield, Wifi, Wallet,
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: string;
}

const MAP: Record<string, React.ElementType> = {
  layers:         Layers,
  globe:          Globe,
  server:         Server,
  'shield-check': ShieldCheck,
  shield:         Shield,
  wifi:           Wifi,
  wallet:         Wallet,
};

export function CategoryIcon({ icon, size = 18, color }: CategoryIconProps): React.JSX.Element {
  const Icon = MAP[icon] ?? Layers;
  return <Icon size={size} strokeWidth={1.8} color={color} />;
}
