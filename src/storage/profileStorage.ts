// src/storage/profileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const PROFILE_KEY = 'profile_name_v1';

export const saveName = async (name: string) => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, name);
  } catch (e) {
    console.warn('Failed saving name', e);
  }
};

export const loadName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PROFILE_KEY);
  } catch (e) {
    console.warn('Failed loading name', e);
    return null;
  }
};
