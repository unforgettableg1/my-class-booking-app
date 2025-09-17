// src/components/ClassCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import THEME from '../theme';
import { ClassItem } from '../types';

type Props = {
  item: ClassItem;
  onQuickBook: (id: string) => void;
  disabled?: boolean;
};

export default function ClassCard({ item, onQuickBook, disabled }: Props) {
  // simple press scale animation
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: '#e6f0ff' }}
        style={styles.card}
        accessibilityLabel={`Class ${item.name}`}
      >
        <View style={styles.meta}>
          <View style={styles.left}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
              <Text style={styles.metaText}>{item.level} · {item.instructor}</Text>
              <Text style={styles.centerText}>{item.center}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => !disabled && onQuickBook(item.id)}
          style={({ pressed }) => [
            styles.bookBtn,
            item.booked && styles.bookedBtn,
            pressed && !disabled && { opacity: 0.85 },
            disabled && { opacity: 0.6 }
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !!disabled, selected: !!item.booked }}
        >
          <Text style={[styles.bookTxt, item.booked && styles.bookedTxt]}>
            {item.booked ? 'Booked' : 'Quick Book'}
          </Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: THEME.spacing.md,
    justifyContent: 'space-between',
    elevation: 3,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: '#E8F6FF', alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { color: THEME.colors.primary, fontWeight: '800', fontSize: 20 },
  title: { fontWeight: '700', fontSize: 16, color: THEME.colors.text },
  metaText: { color: THEME.colors.muted, marginTop: 4 },
  centerText: { color: '#94A3B8', marginTop: 4 },
  bookBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  bookedBtn: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: '#E6EEF9',
  },
  bookTxt: { color: 'white', fontWeight: '700' },
  bookedTxt: { color: THEME.colors.muted, fontWeight: '700' },
});
