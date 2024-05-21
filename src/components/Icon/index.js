import { icons } from 'lucide-react';
import React from 'react';

export default function Icon({ name, color, size }) {
    const LucideIcon = icons[name];

    return <LucideIcon color={color} size={size} />
}
