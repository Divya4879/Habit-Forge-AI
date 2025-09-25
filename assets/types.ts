// Fix: Import 'ComponentType' from 'react' to resolve the 'Cannot find namespace 'React'' error.
import type { ComponentType } from 'react';

export interface Habit {
  id: string;
  name: string;
  description: string;
  prompt_detail: string;
  background_detail: string;
  // Fix: Use 'ComponentType' directly as we are no longer referencing the 'React' namespace.
  icon: ComponentType<{ className?: string }>;
  isCustom?: boolean;
  recoveryHabitId?: string;
  isNegative?: boolean;
}

export interface Timeframe {
  id: string;
  name: string;
}

export interface ArtStyle {
  id: string;
  name: string;
}

export interface SavedComparison {
    id: string;
    baseAvatar: string;
    transformedAvatar: string;
    habitName: string;
    timeframeName: string;
    createdAt: string;
}

export interface HabitInsight {
    habitName: string;
    benefits: string[];
    challenges: string[];
    proTips: string[];
}
