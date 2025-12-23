import { ThemeOption } from './types';

export const THEME_OPTIONS: ThemeOption[] = [
  { name: 'Indigo', color: 'indigo', hex: '#6366f1' },
  { name: 'Rose', color: 'rose', hex: '#f43f5e' },
  { name: 'Emerald', color: 'emerald', hex: '#10b981' },
  { name: 'Amber', color: 'amber', hex: '#f59e0b' },
  { name: 'Violet', color: 'violet', hex: '#8b5cf6' },
  { name: 'Sky', color: 'sky', hex: '#0ea5e9' },
];

export const DEFAULT_AVATAR = "https://picsum.photos/200/200";

export const GREETINGS = [
  "Selamat Pagi",
  "Selamat Siang",
  "Selamat Sore",
  "Selamat Malam"
];

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return GREETINGS[0];
  if (hour < 15) return GREETINGS[1];
  if (hour < 18) return GREETINGS[2];
  return GREETINGS[3];
};