import Constants from "expo-constants";
import { Platform } from "react-native";

// Expo Go populates hostUri with the LAN IP of the dev machine — use it on all platforms
// so real Android devices can reach the server (10.0.2.2 only works inside the emulator).
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
const host = devHost ?? (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE = `http://${host}:3000`;