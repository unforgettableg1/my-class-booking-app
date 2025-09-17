// src/types/index.ts
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type ClassItem = {
  id: string;
  name: string;
  level: Level;
  instructor: string;
  center: string;
  booked?: boolean;
};
