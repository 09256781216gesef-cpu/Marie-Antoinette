import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go populates hostUri with the LAN IP of the dev machine.
// Android emulator cannot reach the host via LAN, so it uses the loopback alias instead.
// NOTE: hostUri is undefined in production/standalone builds — the local server will be unreachable.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const host = Platform.OS === 'android' ? '10.0.2.2' : (devHost ?? 'localhost');

export const API_BASE = `http://${host}:3000`;
