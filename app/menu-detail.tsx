import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { useMenu } from "../context/MenuContext";
import { useTabletLayout } from "../constants/layout";
import CartPanel from "../components/CartPanel";

// ─── Drink Detail Screen ──────────────────────────────────────────────────────
// Full expo-router route — no NavigationIndependentTree needed.
// On tablet the cart panel stays visible on the right, same as the menu screen.

export default function MenuDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { items } = useMenu();
  const { addToCart } = useCart();
  const router = useRouter();
  const { isTablet } = useTabletLayout();

  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const item = items.find((i) => i.id === itemId);

  // ─── Item not found (deleted while browsing) ───────────────────────────────

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>
          this drink is no longer available
        </Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>back to menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Add to cart ───────────────────────────────────────────────────────────

  async function handleAddToCart() {
    try {
      await addToCart(item!);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {}
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={{ title: "ORDER" }} />

      <View style={styles.split}>
        {/* Detail pane */}
        <View style={styles.detailPane}>
          <Text style={styles.label}>marie antoinette order</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={[styles.name, isTablet && styles.nameTablet]}>
            {item.name}
          </Text>

          <View style={styles.priceBox}>
            <Text style={styles.metaLabel}>price</Text>
            <Text style={[styles.price, isTablet && styles.priceTablet]}>
              {item.price}
            </Text>
          </View>

          <View style={styles.descBox}>
            <Text style={styles.metaLabel}>description</Text>
            <Text style={[styles.desc, isTablet && styles.descTablet]}>
              {item.desc}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isTablet && styles.primaryButtonTablet,
            ]}
            activeOpacity={0.7}
            onPress={handleAddToCart}
          >
            <Text
              style={[
                styles.primaryButtonText,
                isTablet && styles.primaryButtonTextTablet,
              ]}
            >
              add to cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backButton, isTablet && styles.backButtonTablet]}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.backButtonText,
                isTablet && styles.backButtonTextTablet,
              ]}
            >
              back to menu
            </Text>
          </TouchableOpacity>

          {toastVisible && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{item.name} added to cart</Text>
            </View>
          )}
        </View>

        {/* Cart panel stays visible on tablet even on the detail screen */}
        {isTablet && <CartPanel />}
      </View>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  notFoundText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textTransform: "lowercase",
    letterSpacing: 0.5,
  },
  backLink: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backLinkText: {
    color: "#000",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  split: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  detailPane: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "lowercase",
  },
  category: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  name: {
    fontSize: 26,
    fontFamily: "Cormorant Garamond SemiBold",
    fontWeight: "300",
    color: "#000",
    letterSpacing: 1,
    marginBottom: 24,
  },
  nameTablet: {
    fontSize: 34,
    marginBottom: 32,
  },
  priceBox: {
    borderWidth: 1,
    borderColor: "#2B5B09",
    padding: 16,
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    color: "#000",
    fontWeight: "300",
  },
  priceTablet: {
    fontSize: 26,
  },
  descBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    padding: 16,
    marginBottom: 24,
  },
  desc: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  descTablet: {
    fontSize: 16,
    lineHeight: 26,
  },
  primaryButton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#2B5B09",
    backgroundColor: "#2B5B09",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonTablet: {
    paddingVertical: 20,
    minHeight: 64,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  primaryButtonTextTablet: {
    fontSize: 16,
    letterSpacing: 2,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  backButtonTablet: {
    paddingVertical: 18,
    minHeight: 60,
  },
  backButtonText: {
    color: "#000",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  backButtonTextTablet: {
    fontSize: 16,
    letterSpacing: 2,
  },
  toast: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  toastText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "lowercase",
  },
});
