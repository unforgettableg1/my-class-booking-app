// src/components/FilterChips.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Level } from '../types';

type Props = {
  selected: Level | null;
  onSelect: (l: Level | null) => void;
};

const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];

export default function FilterChips({ selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {LEVELS.map((l) => (
        <Pressable
          key={l}
          onPress={() => onSelect(selected === l ? null : l)}
          style={[styles.chip, selected === l && styles.chipSelected]}
        >
          <Text style={selected === l ? styles.chipTextSelected : styles.chipText}>{l}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginTop: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  chipSelected: { backgroundColor: '#E6F0FF', borderColor: '#0066FF' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#0066FF', fontWeight: '600' }
});
