// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  Keyboard,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { loadName, saveName } from '../storage/profileStorage';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [name, setName] = useState('User Name');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadName();
        if (saved) {
          setName(saved);
          setTempName(saved);
        }
      } catch (e) {
        console.warn('Error loading name', e);
      } finally {
        setLoadingName(false);
      }
    })();
  }, []);

  const onStartEditing = () => {
    setTempName(name);
    setEditing(true);
  };

  const onCancel = () => {
    setTempName(name);
    setEditing(false);
    Keyboard.dismiss();
  };

  const onSave = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Please enter a valid name.');
      return;
    }
    try {
      await saveName(trimmed);
      setName(trimmed);
      setEditing(false);
      Keyboard.dismiss();
      Toast.show && Toast.show({ type: 'success', text1: 'Profile saved', text2: 'Your name was updated.' });
    } catch (e) {
      console.warn('Failed to save name', e);
      Toast.show && Toast.show({ type: 'error', text1: 'Save failed', text2: 'Unable to save.' });
    }
  };

  if (loadingName) {
    return (
      <View style={styles.center}><Text>Loading...</Text></View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        {/* Circular avatar wrapper */}
        <View style={styles.avatarWrap}>
          <Image source={require('../../assets/placeholder-avatar.png')} style={styles.avatar} />
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          {editing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={styles.input}
                placeholder="Your name"
                returnKeyType="done"
                onSubmitEditing={onSave}
              />
              <Pressable onPress={onSave} style={styles.saveBtn}><Text style={{ color: 'white', fontWeight: '700' }}>Save</Text></Pressable>
              <Pressable onPress={onCancel} style={{ marginLeft: 8 }}><Text style={{ color: '#666' }}>Cancel</Text></Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{name}</Text>
              <Pressable onPress={onStartEditing} style={{ marginLeft: 10 }} accessibilityLabel="Edit name">
                <MaterialIcons name="edit" size={18} color="#0B5FFF" />
              </Pressable>
            </View>
          )}

          <Text style={styles.small}>+91 7070018xxx</Text>
        </View>
      </View>

      {/* Stats card */}
      <View style={styles.card}>
        <Text style={{ fontWeight: '800', fontSize: 16 }}>Account</Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Bangalore</Text>
            <Text style={styles.statLabel}>City</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Sep 16, 2025</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={{ marginTop: 16 }}>
        <Pressable style={styles.actionRow} android_ripple={{ color: '#f1f7ff' }}>
          <MaterialIcons name="credit-card" size={20} color="#0B5FFF" />
          <Text style={styles.actionText}>Payment methods</Text>
        </Pressable>

        <Pressable style={styles.actionRow} android_ripple={{ color: '#f1f7ff' }}>
          <MaterialIcons name="help-outline" size={20} color="#0B5FFF" />
          <Text style={styles.actionText}>Help & feedback</Text>
        </Pressable>

        <Pressable style={[styles.actionRow, { marginTop: 12 }]} android_ripple={{ color: '#ffececec' }}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 88; // outer wrap
const INNER_AVATAR = 80; // image size (should be <= AVATAR_SIZE)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB', paddingHorizontal: 16, paddingTop: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },

  /* *** CIRCULAR AVATAR STYLES *** */
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',

    // subtle shadow / elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatar: {
    width: INNER_AVATAR,
    height: INNER_AVATAR,
    borderRadius: INNER_AVATAR / 2, // makes the image circular
    resizeMode: 'cover',
  },

  name: { fontSize: 20, fontWeight: '800', color: '#051129' },
  small: { color: '#64748B', marginTop: 6 },

  input: { borderWidth: 1, borderColor: '#E6EEF9', padding: 10, borderRadius: 10, minWidth: 160, backgroundColor: 'white' },
  saveBtn: { backgroundColor: '#0B5FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 8 },

  card: { backgroundColor: 'white', borderRadius: 14, padding: 14, elevation: 3 },
  row: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontWeight: '800', fontSize: 16, color: '#051129' },
  statLabel: { color: '#64748B', marginTop: 6 },

  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 12, marginTop: 12, elevation: 1 },
  actionText: { marginLeft: 12, fontWeight: '600' },
});
