import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";
import { useTabletLayout } from "../../constants/layout";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Welcome / Kiosk Home Screen ─────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { isTablet } = useTabletLayout();
  const [profileName, setProfileName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("profileName")
      .then((v) => {
        if (v) setProfileName(v);
      })
      .catch(() => {});
  }, []);

  function startEdit() {
    setDraftName(profileName);
    setEditingName(true);
  }

  async function saveName() {
    const trimmed = draftName.trim();
    setProfileName(trimmed);
    setEditingName(false);
    await AsyncStorage.setItem("profileName", trimmed).catch(() => {});
  }

  return (
    <View style={styles.container}>
      {/* DESKTOP: logo on the left side */}
      {isTablet && (
        <View style={styles.desktopLogoWrapper}>
          <Image
            source={require("../../assets/images/antoinette marie lgoo.png")}
            style={styles.desktopLogo}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={[styles.inner, isTablet && styles.innerTablet]}>
        {/* Brand */}
        <View style={styles.brandBlock}>
          {/* MOBILE: logo above brand name */}
          {!isTablet && (
            <Image
              source={require("../../assets/images/antoinette marie lgoo.png")}
              style={styles.mobileLogo}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.brandName, isTablet && styles.brandNameTablet]}>
            MARIE ANTOINETTE
          </Text>
          <Text style={[styles.tagline, isTablet && styles.taglineTablet]}>
            FRENCH CAFE
          </Text>
        </View>

        {/* Prompt */}
        <Text style={[styles.prompt, isTablet && styles.promptTablet]}>
          Don't lose your head, grab a bite
        </Text>

        {/* Featured drinks hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>{"today's selection"}</Text>
          <Text style={styles.hintText}>
            ceremonial lattes · pure matcha · frappes · specials· French Sets
          </Text>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.startButton, isTablet && styles.startButtonTablet]}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text
            style={[
              styles.startButtonText,
              isTablet && styles.startButtonTextTablet,
            ]}
          >
            start ordering
          </Text>
        </TouchableOpacity>

        {/* Resume in-progress cart if one exists */}
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[styles.resumeButton, isTablet && styles.resumeButtonTablet]}
            onPress={() =>
              router.push(isTablet ? "/(tabs)/menu" : "/(tabs)/cart")
            }
          >
            <Text
              style={[
                styles.resumeButtonText,
                isTablet && styles.resumeButtonTextTablet,
              ]}
            >
              resume order — {cartItems.length} item
              {cartItems.length !== 1 ? "s" : ""} in cart
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.profileCorner}>
        <Text style={styles.profileLabel}>profile</Text>
        {editingName ? (
          <View style={styles.profileEditRow}>
            <TextInput
              style={styles.profileInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="enter your name..."
              placeholderTextColor="#bbb"
              autoFocus
              onSubmitEditing={saveName}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.profileSaveBtn} onPress={saveName}>
              <Text style={styles.profileSaveBtnText}>save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={startEdit} style={styles.profileNameRow}>
            <Text
              style={[
                styles.profileName,
                !profileName && styles.profileNamePlaceholder,
              ]}
            >
              {profileName || "tap to set your name"}
            </Text>
            <Text style={styles.profileEditHint}>edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B8D5D9",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 32,
  },
  innerTablet: {
    maxWidth: 640,
    paddingHorizontal: 64,
  },
  brandBlock: {
    marginBottom: 40,
  },
  brandName: {
    fontFamily: "Cormorant Garamond SemiBold",
    fontSize: 42,
    fontWeight: "200",
    color: "#4a6741",
    letterSpacing: 6,
    textTransform: "uppercase",
  },
  brandNameTablet: {
    fontFamily: "Cormorant Garamond SemiBold",
    fontSize: 64,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 13,
    color: "#999",
    letterSpacing: 6,
    marginTop: 4,
  },
  taglineTablet: {
    fontSize: 16,
    letterSpacing: 8,
    marginTop: 8,
  },
  prompt: {
    fontSize: 18,
    color: "#",
    fontWeight: "300",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  promptTablet: {
    fontSize: 24,
    marginBottom: 32,
  },
  hintBox: {
    borderWidth: 1,
    borderColor: "#2B5B09",
    borderStyle: "dashed",
    padding: 16,
    marginBottom: 32,
  },
  hintLabel: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    textTransform: "lowercase",
  },
  startButton: {
    backgroundColor: "#538377",
    borderWidth: 1,
    borderColor: "#538377",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  startButtonTablet: {
    paddingVertical: 22,
    minHeight: 68,
  },
  startButtonText: {
    color: "#E3E7E7",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "lowercase",
  },
  startButtonTextTablet: {
    fontSize: 18,
    letterSpacing: 3,
  },
  resumeButton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#tit",
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  resumeButtonTablet: {
    paddingVertical: 18,
    minHeight: 60,
  },
  resumeButtonText: {
    color: "#538377",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  resumeButtonTextTablet: {
    fontSize: 15,
    letterSpacing: 1.5,
  },
  desktopLogoWrapper: {
    position: "absolute",
    left: 10,
    top: "40%",
    transform: [{ translateY: -100 }],
  },
  desktopLogo: {
    width: 300,
    height: 300,
  },
  mobileLogo: {
    width: 200,
    height: 200,
    marginBottom: 16,
    alignSelf: "center",
  },
  profileCorner: {
    position: "absolute",
    borderColor: "#4a6741",
    backgroundColor: "#4a6741",
    borderWidth: 4,
    borderRadius: 20,
    top: 16,
    right: 16,
    zIndex: 10,
    alignItems: "flex-end",
    maxWidth: 170,
    padding: 8,
  },
  profileLabel: {
    fontSize: 9,
    color: "#fff",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  profileNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileName: {
    fontSize: 15,
    color: "#B8D5D9",
    fontWeight: 300,
    flex: 1,
  },
  profileNamePlaceholder: {
    color: "#bbb",
    fontStyle: "italic",
  },
  profileEditHint: {
    fontSize: 11,
    color: "#fff",
    letterSpacing: 1,
    textTransform: "lowercase",
    marginLeft: 12,
  },
  profileEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2B5B09",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: 300,
    color: "#000",
    maxWidth: 80,
  },
  profileSaveBtn: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#2B5B09",
    backgroundColor: "#2B5B09",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  profileSaveBtnText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
});
