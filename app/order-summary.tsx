import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useTabletLayout } from "../constants/layout";

// ─── Order Summary Screen ────────────────────────────────────────────────────

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { orders, isLoaded } = useOrders();
  const { isTablet } = useTabletLayout();

  const order = orders[0];
  const items = order?.items ?? [];
  const notes = order?.notes ?? {};

  const total = items.reduce((sum, item) => {
    const num = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  async function startNewOrder() {
    await clearCart();
    router.replace("/(tabs)/" as any);
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>marie antoinette</Text>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>
          SUMMARY
        </Text>
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.metaLabel}>status</Text>
        <Text style={styles.statusText}>ready for counter confirmation</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.metaLabel}>total</Text>
        <Text style={[styles.totalText, isTablet && styles.totalTextTablet]}>
          PHP {total}
        </Text>
      </View>

      {items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.summaryCard, isTablet && styles.summaryCardTablet]}
        >
          <Text style={styles.summaryLabel}>drink #{index + 1}</Text>
          <Text
            style={[styles.summaryName, isTablet && styles.summaryNameTablet]}
          >
            {item.name}
          </Text>
          <Text style={styles.summaryMeta}>
            {item.category} · {item.price}
          </Text>
          {notes[item.id] ? (
            <View style={styles.summaryNoteBox}>
              <Text style={styles.summaryNoteLabel}>special instructions</Text>
              <Text style={styles.summaryNoteText}>{notes[item.id]}</Text>
            </View>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.primaryButton, isTablet && styles.primaryButtonTablet]}
        onPress={startNewOrder}
      >
        <Text
          style={[
            styles.primaryButtonText,
            isTablet && styles.primaryButtonTextTablet,
          ]}
        >
          new order
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.outlineButton, isTablet && styles.outlineButtonTablet]}
        onPress={() => router.push("/(tabs)/menu")}
      >
        <Text
          style={[
            styles.outlineButtonText,
            isTablet && styles.outlineButtonTextTablet,
          ]}
        >
          back to menu
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "lowercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    fontFamily: "Cormorant Garamond SemiBold",
    letterSpacing: 4,
    color: "#2B5B09",
  },
  titleTablet: {
    fontSize: 36,
  },
  statusBox: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  totalBox: {
    borderWidth: 1,
    borderColor: "#2B5B09",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Cormorant Garamond SemiBold",
  },
  totalText: {
    fontSize: 22,
    color: "#2B5B09",
    fontWeight: "300",
  },
  totalTextTablet: {
    fontSize: 28,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  summaryCardTablet: {
    padding: 20,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: "400",
    color: "#2B5B09",
    marginBottom: 4,
  },
  summaryNameTablet: {
    fontSize: 20,
  },
  summaryMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  summaryNoteBox: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
    marginTop: 4,
  },
  summaryNoteLabel: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryNoteText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: "#2B5B09",
    borderRadius: 20,
    backgroundColor: "#2B5B09",
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    minHeight: 56,
    justifyContent: "center",
  },
  primaryButtonTablet: {
    paddingVertical: 22,
    minHeight: 68,
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
  outlineButton: {
    borderWidth: 1,
    borderColor: "#2B5B09",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 40,
    minHeight: 52,
    justifyContent: "center",
  },
  outlineButtonTablet: {
    paddingVertical: 18,
    minHeight: 60,
  },
  outlineButtonText: {
    color: "#000",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  outlineButtonTextTablet: {
    fontSize: 16,
    letterSpacing: 2,
  },
});
