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
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { useTabletLayout } from "../../constants/layout";

// ─── Cart Screen (phone) ──────────────────────────────────────────────────────
// On tablet, this screen is not shown — the cart panel is inline in the menu.

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    notes,
    cartNote,
    isLoaded,
    removeItem,
    updateNote,
    updateCartNote,
    clearCart,
  } = useCart();
  const { placeOrder } = useOrders();
  const { isTablet } = useTabletLayout();
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  async function handleConfirm() {
    await placeOrder(cartItems, notes);
    await clearCart();
    router.push("/order-summary");
  }

  const total = cartItems.reduce((sum, item) => {
    const num = parseFloat(item.price.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // ─── Empty ─────────────────────────────────────────────────────────────────

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>marie antoinette</Text>
          <Text style={[styles.title, isTablet && styles.titleTablet]}>
            CART
          </Text>
        </View>

        <View style={styles.emptyBox}>
          <Text style={styles.placeholderLabel}>status</Text>
          <Text style={styles.placeholderText}>
            choose a drink from the menu to start an order
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isTablet && styles.buttonTablet]}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text
            style={[styles.buttonText, isTablet && styles.buttonTextTablet]}
          >
            open menu
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Cart list ─────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator>
      <View style={styles.headerBlock}>
        <Text style={styles.label}>marie antoinette</Text>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>CART</Text>
        <Text style={styles.itemCountLabel}>
          {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · PHP{" "}
          {total}
        </Text>
      </View>

      {cartItems.map((item) => (
        <View
          key={item.id}
          style={[styles.card, isTablet && styles.cardTablet]}
        >
          <Text style={styles.cardLabel}>selected drink</Text>
          <Text
            style={[styles.cardItemName, isTablet && styles.cardItemNameTablet]}
          >
            {item.name}
          </Text>
          <Text style={styles.cardItemMeta}>
            {item.category} · {item.price}
          </Text>

          <TouchableOpacity
            style={styles.instructionButton}
            onPress={() =>
              setExpandedNoteId(expandedNoteId === item.id ? null : item.id)
            }
          >
            <Text style={styles.instructionButtonText}>
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

      <TouchableOpacity
        style={styles.addMoreButton}
        onPress={() => router.push("/(tabs)/menu")}
      >
        <Text style={styles.addMoreButtonText}>+ add more drinks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.confirmButton, isTablet && styles.confirmButtonTablet]}
        onPress={handleConfirm}
      >
        <Text
          style={[
            styles.confirmButtonText,
            isTablet && styles.confirmButtonTextTablet,
          ]}
        >
          confirm order ({cartItems.length} item
          {cartItems.length !== 1 ? "s" : ""})
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>order note</Text>
          <Text style={styles.cartNoteHint}>
            add a note for the whole order (stays saved between sessions)
          </Text>
          <TextInput
            style={styles.noteInput}
            value={cartNote}
            onChangeText={updateCartNote}
            placeholder="e.g. all drinks for table 3, please make it fast..."
            placeholderTextColor="#bbb"
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.addMoreButton}
          onPress={() => router.push("/(tabs)/menu")}
        ></TouchableOpacity>
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
    borderRadius: 20,
  },
  label: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "lowercase",
  },
  title: {
    fontFamily: "Cormorant Garamond SemiBold",
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: 4,
    color: "#000",
  },
  titleTablet: {
    fontSize: 36,
    fontFamily: "Cormorant Garamond SemiBold",
  },
  itemCountLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    padding: 16,
    margin: 20,
    marginBottom: 12,
  },
  placeholderLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#000",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#C1D590",
  },
  cardTablet: {
    padding: 20,
  },
  cardLabel: {
    fontSize: 10,
    color: "#538377",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardItemName: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginBottom: 4,
  },
  cardItemNameTablet: {
    fontSize: 22,
  },
  cardItemMeta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  instructionButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  instructionButtonText: {
    fontSize: 12,
    borderRadius: 20,
    color: "#538377",
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  noteInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    fontSize: 13,
    color: "#000",
    backgroundColor: "#fff",
    textAlignVertical: "top",
    marginBottom: 8,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#000",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  addMoreButton: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "dashed",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  addMoreButtonText: {
    color: "#000",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  confirmButton: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 32,
    minHeight: 56,
    justifyContent: "center",
  },
  confirmButtonTablet: {
    paddingVertical: 22,
    minHeight: 68,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  confirmButtonTextTablet: {
    fontSize: 16,
    letterSpacing: 2,
  },
  button: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#4a6741",
    backgroundColor: "#4a6741",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonTablet: {
    paddingVertical: 20,
    minHeight: 64,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  buttonTextTablet: {
    fontSize: 16,
    letterSpacing: 2,
  },
  cartNoteHint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
    lineHeight: 17,
  },
});
