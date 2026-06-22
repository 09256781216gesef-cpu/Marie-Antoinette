import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";

// ─── Inline cart panel shown alongside the menu on tablet ────────────────────

export default function CartPanel() {
  const router = useRouter();
  const { cartItems, notes, isLoaded, removeItem, updateNote, clearCart } =
    useCart();
  const { placeOrder } = useOrders();
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const total = cartItems.reduce((sum, item) => {
    const num = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  async function handleConfirm() {
    await placeOrder(cartItems, notes);
    await clearCart();
    router.push("/order-summary");
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="small"
          color="#000"
          style={{ marginTop: 40 }}
        />
      </View>
    );
  }

  // ─── Unified render — header is always the same height ────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>marie antoinette</Text>
        <Text style={styles.headerTitle}>CART</Text>
        <Text style={styles.headerCount}>
          {cartItems.length === 0
            ? "no items yet"
            : `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}`}
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyLabel}>status</Text>
            <Text style={styles.emptyText}>
              select a drink from the menu to begin your order
            </Text>
          </View>
        )}
        {cartItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardLabel}>selected drink</Text>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.category} · {item.price}
            </Text>

            <TouchableOpacity
              style={styles.noteToggle}
              onPress={() =>
                setExpandedNoteId(expandedNoteId === item.id ? null : item.id)
              }
            >
              <Text style={styles.noteToggleText}>
                {expandedNoteId === item.id
                  ? "– special instructions"
                  : "+ special instructions"}
              </Text>
            </TouchableOpacity>

            {expandedNoteId === item.id && (
              <TextInput
                style={styles.noteInput}
                value={notes[item.id] || ""}
                onChangeText={(text) => updateNote(item.id, text)}
                placeholder="e.g. extra sugar, no ice..."
                placeholderTextColor="#bbb"
                multiline
              />
            )}

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.removeButtonText}>remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>total</Text>
          <Text style={styles.totalText}>PHP {total}</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>
            confirm order ({cartItems.length} item
            {cartItems.length !== 1 ? "s" : ""})
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 1,
    borderLeftColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  headerLabel: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "lowercase",
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: "Cormorant Garamond SemiBold",
    fontWeight: "300",
    letterSpacing: 4,
    color: "#2B5B09",
  },
  headerCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  emptyBox: {
    margin: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    padding: 16,
  },
  emptyLabel: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
  },
  scroll: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#C1D590",
    margin: 12,
    marginBottom: 0,
    padding: 12,
    backgroundColor: "#C1D590",
  },
  cardLabel: {
    fontSize: 9,
    color: "#2B5B09",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    fontFamily: "Cormorant Garamond SemiBold",
    fontWeight: "400",
    color: "#2B5B09",
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: "#666",
    marginBottom: 10,
  },
  noteToggle: {
    borderWidth: 1,
    borderColor: "#538377",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 6,
    minHeight: 40,
    justifyContent: "center",
  },
  noteToggleText: {
    fontSize: 11,
    color: "#000",
    letterSpacing: 0.3,
    textTransform: "lowercase",
  },
  noteInput: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    padding: 10,
    fontSize: 12,
    color: "#000",
    backgroundColor: "#fff",
    textAlignVertical: "top",
    marginBottom: 6,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#2B5000",
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#000",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  totalBox: {
    marginHorizontal: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2B5B09",
    borderRadius: 20,
    padding: 12,
  },
  totalLabel: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 20,
    color: "#2B5B09",
    fontWeight: "300",
  },
  confirmButton: {
    backgroundColor: "#2B5B09",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2B5B09",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 10,
    minHeight: 52,
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
});
