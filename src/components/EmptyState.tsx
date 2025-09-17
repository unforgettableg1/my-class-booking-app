// src/components/EmptyState.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = { onClear: () => void };

export default function EmptyState({ onClear }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No classes match your filters</Text>
      <Text style={styles.sub}>Try clearing filters to see all available classes.</Text>
      <Pressable onPress={onClear} style={styles.btn}><Text style={{ color: 'white' }}>Clear Filters</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 32 },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { color: '#666', marginVertical: 8 },
  btn: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8, marginTop: 10 }
});
