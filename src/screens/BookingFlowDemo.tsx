// src/screens/BookingFlowDemo.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import THEME from '../theme';
import ClassCard from '../components/ClassCard';
import BookingBurst from '../components/BookingBurst';
import { MOCK_CLASSES } from '../data/mockClasses';
import { ClassItem } from '../types';

// Toast guard for web
let Toast: any = { show: (o: any) => console.log('Toast:', o) };
try { Toast = require('react-native-toast-message'); } catch (e) { /* web fallback */ }

export default function BookingFlowDemo() {
  // use the first mock class as demo target
  const demoClass: ClassItem = { ...MOCK_CLASSES[0] };

  // local classes state so we can optimistic/rollback on demo
  const [local, setLocal] = useState<ClassItem>(demoClass);
  const [lastSuccess, setLastSuccess] = useState<boolean>(false);

  const optimisticBook = () => {
    setLocal(prev => ({ ...prev, booked: true }));
  };

  const rollback = () => {
    setLocal(prev => ({ ...prev, booked: false }));
  };

  function showSuccessToast() {
    if (Toast && typeof Toast.show === 'function') {
      Toast.show({ type: 'success', text1: 'Booked successfully', text2: 'Demo success' });
    } else {
      console.log('Booked successfully (demo)');
    }
  }
  function showErrorToast() {
    if (Toast && typeof Toast.show === 'function') {
      Toast.show({ type: 'error', text1: 'Booking failed', text2: 'Demo failure' });
    } else {
      console.log('Booking failed (demo)');
    }
  }

  // Force a successful booking (demo)
  const forceSuccess = async () => {
    optimisticBook();
    // simulate network latency
    setTimeout(() => {
      // success path
      showSuccessToast();
      setLastSuccess(true);
      // clear animation flag
      setTimeout(() => setLastSuccess(false), 900);
    }, 700);
  };

  // Force a failed booking (demo)
  const forceFailure = async () => {
    optimisticBook();
    setTimeout(() => {
      // failure path: rollback + toast
      rollback();
      showErrorToast();
      Alert.alert('Demo: Forced failure', 'Booking was rolled back (demo).');
    }, 700);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Booking Flow Demo</Text>
      <Text style={styles.subtitle}>Use these buttons to force a success or failure so you can demo both flows.</Text>

      <View style={{ marginTop: 18 }}>
        <View>
          <ClassCard item={local} onQuickBook={() => { /* keep disabled in demo */ }} />
          {lastSuccess && <BookingBurst visible={true} />}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={[styles.btn, { backgroundColor: THEME.colors.primary }]} onPress={forceSuccess}>
          <Text style={styles.btnText}>Force Success</Text>
        </Pressable>

        <Pressable style={[styles.btn, { backgroundColor: THEME.colors.danger }]} onPress={forceFailure}>
          <Text style={styles.btnText}>Force Failure</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.note}>Notes: “Force Success” shows optimistic booking → success toast + burst. “Force Failure” shows optimistic booking → rollback + error toast.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: THEME.colors.bg },
  title: { fontSize: 20, fontWeight: '800', color: THEME.colors.text },
  subtitle: { color: THEME.colors.muted, marginTop: 6 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  btnText: { color: 'white', fontWeight: '700' },
  note: { color: THEME.colors.muted, fontSize: 13 },
});
