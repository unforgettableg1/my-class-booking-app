// app.txs
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';

// Toast is native-only; guard for web
const Toast = Platform.OS !== 'web' ? require('react-native-toast-message').default : () => null;

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
      {Platform.OS !== 'web' && <Toast />}
    </>
  );
}