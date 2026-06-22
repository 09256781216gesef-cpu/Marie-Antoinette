import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { useMenu, type MenuItem } from "../../context/MenuContext";
import { useTabletLayout } from "../../constants/layout";
import CartPanel from "../../components/CartPanel";
import { Ionicons } from "@expo/vector-icons";

// ─── Menu Screen ─────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const {
    items: allItems,
    isLoaded: menuLoaded,
    fetchError,
    favorites,
    toggleFavorite,
  } = useMenu();
  const { isTablet } = useTabletLayout();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastItem, setToastItem] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleAddToCart(item: MenuItem) {
    try {
      await addToCart(item);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastItem(item.name);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {}
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (!menuLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.metaText}>loading marie antoinette menu...</Text>
      </View>
    );
  }

  // Featured items float to top; unavailable items hidden from customers.
  const availableItems = allItems.filter((i) => i.available);
  const listData = [
    ...availableItems.filter((i) => i.featured),
    ...availableItems.filter((i) => !i.featured),
  ];

  const numColumns = isTablet ? 2 : 1;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.splitContainer}>
      {/* Menu column */}
      <View style={styles.menuColumn}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>Marie Antoinette</Text>
          <Text style={[styles.heading, isTablet && styles.headingTablet]}>
            MENU
          </Text>
          <Text style={styles.subheading}>
            {availableItems.length} items available
          </Text>
        </View>

        {fetchError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              no internet connection — showing last saved menu
            </Text>
          </View>
        )}

        {listData.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.metaText}>no drinks available right now</Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            key={numColumns}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.list}
            columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.item,
                  isTablet && styles.itemTablet,
                  item.featured && styles.itemFeatured,
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.6}
                  onPress={() =>
                    router.push({
                      pathname: "/menu-detail",
                      params: { itemId: item.id },
                    })
                  }
                >
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemLabel}>{item.category}</Text>
                    <View style={styles.itemTopRowRight}>
                      {item.featured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>popular</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={
                            favorites.includes(item.id)
                              ? "heart"
                              : "heart-outline"
                          }
                          size={18}
                          color={
                            favorites.includes(item.id) ? "#538377" : "#bbb"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[styles.itemName, isTablet && styles.itemNameTablet]}
                  >
                    Le {item.name}
                  </Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </TouchableOpacity>

                <View style={styles.itemFooter}>
                  <Text
                    style={[
                      styles.itemPrice,
                      isTablet && styles.itemPriceTablet,
                    ]}
                  >
                    {item.price}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.cartButton,
                      isTablet && styles.cartButtonTablet,
                    ]}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text
                      style={[
                        styles.cartButtonText,
                        isTablet && styles.cartButtonTextTablet,
                      ]}
                    >
                      add to cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {toastVisible && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastItem} added to cart</Text>
          </View>
        )}
      </View>

      {/* Cart panel — tablet only */}
      {isTablet && <CartPanel />}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splitContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#B8D5D9",
  },
  menuColumn: {
    flex: 1,
    backgroundColor: "#B8D5D9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B8D5D9",
    padding: 24,
  },
  metaText: {
    marginTop: 12,
    fontSize: 12,
    color: "#999",
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  headerBlock: {
    backgroundColor: "#E3E7E7",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#4a6741",
  },
  label: {
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "lowercase",
  },
  heading: {
    fontFamily: "Cormorant Garamond SemiBold",
    fontSize: 28,
    fontWeight: "300",
    color: "#2B5B09",
    letterSpacing: 4,
  },
  headingTablet: {
    fontSize: 36,
  },
  subheading: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  item: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E3E7E7",
    padding: 16,
    backgroundColor: "#E3E7E7",
    fontFamily: "Cormorant Garamond SemiBold",
    flexDirection: "column",
    justifyContent: "space-between",
    shadowColor: "#1d1d23",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTablet: {
    padding: 20,
    borderRadius: 20,
  },
  itemFeatured: {
    borderColor: "#000",
    backgroundColor: "#fafaf8",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemTopRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemLabel: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  featuredBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Cormorant Garamond SemiBold",
    color: "#2B5B09",
    marginBottom: 8,
  },
  itemNameTablet: {
    fontSize: 19,
    marginBottom: 10,
  },
  itemDesc: {
    color: "#444",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderTopWidth: 1,
    borderTopColor: "#4a6741",
    paddingTop: 10,
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: "#4a6741",
    alignSelf: "center",
  },
  itemPriceTablet: {
    fontSize: 16,
  },
  cartButton: {
    fontFamily: "Cormorant Garamond SemiBold",
    borderWidth: 1,
    borderColor: "#2B5B09",
    backgroundColor: "#2B5B09",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonTablet: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  cartButtonTextTablet: {
    fontSize: 13,
  },
  toast: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
  errorBanner: {
    backgroundColor: "#c00",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBannerText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "lowercase",
  },
});
