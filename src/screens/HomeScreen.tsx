// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { MOCK_CLASSES } from '../data/mockClasses';
import { ClassItem, Level } from '../types';
import { simulateBooking } from '../utils/simulateBooking';

// Toast native-only (guard for web)
let Toast: any = { show: (o: any) => console.log('Toast:', o) };
try {
  Toast = Platform.OS !== 'web' ? require('react-native-toast-message') : Toast;
} catch (e) {
  /* ignore for web */
}

/**
 * BookingBurst
 * Lightweight animated green check + expanding ring.
 * Visible only when `visible` is true.
 */
function BookingBurst({ visible = false }: { visible?: boolean }) {
  const scale = React.useRef(new Animated.Value(0)).current;
  const ring = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!visible) return;
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.timing(ring, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // reset for next time
      scale.setValue(0);
      ring.setValue(0);
      opacity.setValue(0);
    });
  }, [visible, scale, ring, opacity]);

  if (!visible) return null;

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.2] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Animated.View pointerEvents="none" style={[burstStyles.wrap, { opacity }]}>
      <Animated.View style={[burstStyles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.View style={[burstStyles.checkWrap, { transform: [{ scale }] }]}>
        <View style={burstStyles.check}>
          <Text style={burstStyles.checkTxt}>✓</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const burstStyles = StyleSheet.create({
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
    backgroundColor: '#16A34A', // success green
    opacity: 0.6,
  },
  checkWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  checkTxt: { color: 'white', fontWeight: '800', fontSize: 22 },
});

// Small polished Class Card used inside this screen
function PolishedClassCard({ item, onQuickBook }: { item: ClassItem; onQuickBook: (id: string) => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: '#e6f0ff' }}
        style={styles.card}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.level} · {item.instructor}</Text>
            <Text style={styles.cardSmall}>{item.center}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onQuickBook(item.id)}
          style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.quickBtnText}>{item.booked ? 'Booked' : 'Quick Book'}</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// Level chips component (kept local for styling control)
const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];

function LevelChips({ selected, onSelect }: { selected: Level | null; onSelect: (l: Level | null) => void }) {
  return (
    <View style={styles.chipsRow}>
      {LEVELS.map((l) => (
        <Pressable
          key={l}
          onPress={() => onSelect(selected === l ? null : l)}
          style={({ pressed }) => [
            styles.chip,
            selected === l && styles.chipSelected,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={selected === l ? styles.chipTextSelected : styles.chipText}>{l}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [levelFilter, setLevelFilter] = useState<Level | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [instructorModalVisible, setInstructorModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  // which id just succeeded (used to show burst)
  const [lastSuccessId, setLastSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setClasses(MOCK_CLASSES);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const instructors = useMemo(() => {
    const set = new Set<string>();
    MOCK_CLASSES.forEach(c => set.add(c.instructor));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return classes.filter(c => {
      if (levelFilter && c.level !== levelFilter) return false;
      if (instructorFilter && c.instructor !== instructorFilter) return false;
      if (search && !`${c.name} ${c.instructor} ${c.center}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [classes, levelFilter, instructorFilter, search]);

  const handleQuickBook = async (id: string) => {
    // optimistic update
    setClasses(prev => prev.map(c => c.id === id ? { ...c, booked: true } : c));

    const result = await simulateBooking(700);
    if (!result.success) {
      // rollback
      setClasses(prev => prev.map(c => c.id === id ? { ...c, booked: false } : c));
      Toast.show ? Toast.show({ type: 'error', text1: 'Booking failed', text2: 'Please try again.' }) : console.log('Booking failed');
    } else {
      // success: toast + burst animation on that card
      setLastSuccessId(id);
      Toast.show ? Toast.show({ type: 'success', text1: 'Booked', text2: 'Your quick booking succeeded.' }) : console.log('Booked');
      // clear after the animation completes so it can re-trigger later
      setTimeout(() => setLastSuccessId(null), 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Find a class</Text>
          <Text style={styles.subHeading}>Choose a level, instructor or search</Text>
        </View>

        <Pressable style={styles.headerIcon} android_ripple={{ color: '#e6f0ff' }}>
          <Feather name="bell" size={20} color="#0B5FFF" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color="#999" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search classes, instructors, centers..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={18} color="#999" />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <LevelChips selected={levelFilter} onSelect={setLevelFilter} />

      <View style={styles.filterRow}>
        <Pressable style={styles.filterButton} onPress={() => setInstructorModalVisible(true)}>
          <MaterialIcons name="person-outline" size={18} color="#0B5FFF" />
          <Text style={styles.filterBtnText}>{instructorFilter ?? 'All instructors'}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
        </Pressable>

        {(levelFilter || instructorFilter || search) ? (
          <Pressable onPress={() => { setLevelFilter(null); setInstructorFilter(null); setSearch(''); }} style={styles.clearText}>
            <Text style={{ color: '#0B5FFF' }}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No classes match</Text>
          <Text style={styles.emptySub}>Try removing filters or broadening your search.</Text>
          <Pressable style={styles.clearFiltersBtn} onPress={() => { setLevelFilter(null); setInstructorFilter(null); setSearch(''); }}>
            <Text style={{ color: 'white' }}>Clear filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View>
              <PolishedClassCard item={item} onQuickBook={handleQuickBook} />
              {/* show burst when this id was last successful */}
              {lastSuccessId === item.id && <BookingBurst visible={true} />}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Instructor modal */}
      <Modal transparent visible={instructorModalVisible} animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose instructor</Text>
            <TouchableOpacity onPress={() => { setInstructorFilter(null); setInstructorModalVisible(false); }} style={styles.modalRow}>
              <Text style={styles.modalRowText}>All instructors</Text>
            </TouchableOpacity>
            {instructors.map(i => (
              <TouchableOpacity key={i} onPress={() => { setInstructorFilter(i); setInstructorModalVisible(false); }} style={styles.modalRow}>
                <Text style={styles.modalRowText}>{i}</Text>
              </TouchableOpacity>
            ))}
            <Pressable onPress={() => setInstructorModalVisible(false)} style={styles.modalClose}>
              <Text style={{ color: '#0B5FFF' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB', paddingHorizontal: 16, paddingTop: 14 },
  heading: { fontSize: 22, fontWeight: '800', color: '#051129' },
  subHeading: { color: '#64748B', marginTop: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerIcon: { backgroundColor: '#E6F0FF', padding: 10, borderRadius: 10 },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, elevation: 1 },
  searchInput: { marginLeft: 8, flex: 1, paddingVertical: 0 },

  chipsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#fff' },
  chipSelected: { backgroundColor: '#E6F0FF', borderColor: '#0B5FFF' },
  chipText: { color: '#0B1B2C' },
  chipTextSelected: { color: '#0B5FFF', fontWeight: '700' },

  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, flex: 1, elevation: 1 },
  filterBtnText: { marginLeft: 8, flex: 1 },

  clearText: { marginLeft: 12 },

  cardContainer: { marginHorizontal: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 12, marginVertical: 8, justifyContent: 'space-between', elevation: 3 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#E8F0FF', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#0B5FFF', fontWeight: '800', fontSize: 20 },
  cardTitle: { fontWeight: '700', fontSize: 16 },
  cardMeta: { color: '#64748B', marginTop: 4 },
  cardSmall: { color: '#94A3B8', marginTop: 4 },

  quickBtn: { backgroundColor: '#0B5FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  quickBtnText: { color: 'white', fontWeight: '700' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  empty: { marginTop: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { color: '#64748B', marginTop: 8 },
  clearFiltersBtn: { marginTop: 12, backgroundColor: '#0B5FFF', padding: 10, borderRadius: 10 },

  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modal: { backgroundColor: 'white', padding: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  modalTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8 },
  modalRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalRowText: { fontSize: 15 },
  modalClose: { marginTop: 12, alignSelf: 'flex-end' },
});
