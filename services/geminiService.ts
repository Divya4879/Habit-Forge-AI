import type { Habit, Timeframe, HabitInsight } from '../types';

// This is a generic fetch handler to reduce boilerplate
const fetchApi = async (endpoint: string, body: object) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.json();
        // Use a more specific error message from the server if available
        throw new Error(err.error || `Request failed at endpoint: ${endpoint}`);
    }

    return response.json();
};


export const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const [header, data] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        resolve({ base64: data, mimeType });
    };
    reader.onerror = error => reject(error);
  });
};

export const createAvatar = async (base64Data: string, mimeType: string, style: string): Promise<string> => {
    const data = await fetchApi('/api/create-avatar', { base64Data, mimeType, style });
    return data.imageUrl;
};

export const visualizeHabit = async (avatarBase64WithHeader: string, habits: Habit[], timeframe: Timeframe, habitType: 'positive' | 'negative'): Promise<string> => {
    const data = await fetchApi('/api/visualize-habit', { avatarBase64WithHeader, habits, timeframe, habitType });
    return data.imageUrl;
};

export const analyzeCustomHabit = async (habitName: string): Promise<Omit<Habit, 'icon' | 'id'>> => {
    return fetchApi('/api/analyze-custom-habit', { habitName });
};

export const getHabitInsights = async (habit: Habit): Promise<HabitInsight> => {
    return fetchApi('/api/get-habit-insights', { habit });
};

export const getActionableTip = async (habit: Habit): Promise<string> => {
    const data = await fetchApi('/api/get-actionable-tip', { habit });
    return data.tip;
};
