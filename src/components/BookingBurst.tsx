// src/components/BookingBurst.tsx
import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, Easing, Text } from 'react-native';
import THEME from '../theme';

export default function BookingBurst({ visible = false }: { visible?: boolean }) {
  const scale = React.useRef(new Animated.Value(0)).current;
  const ring = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1)), useNativeDriver: true }),
      Animated.timing(ring, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true })
      ])
    ]).start(() => {
      // reset for next time
      scale.setValue(0);
      ring.setValue(0);
      opacity.setValue(0);
    });
  }, [visible]);

  if (!visible) return null;

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.2] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity }]}>
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.View style={[styles.checkWrap, { transform: [{ scale }] }]}>
        <View style={styles.check}>
          <Text style={styles.checkTxt}>✓</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.success,
    opacity: 0.6,
  },
  checkWrap: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  check: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.colors.success, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  checkTxt: { color: 'white', fontWeight: '800', fontSize: 22 }
});
