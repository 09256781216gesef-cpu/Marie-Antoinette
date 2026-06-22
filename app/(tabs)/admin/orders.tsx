import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useOrders } from "../../../context/OrderContext";
import type { Order } from "../../../context/OrderContext";

// ─── Staff — Orders View ──────────────────────────────────────────────────────

export default function OrdersScreen() {
  const { orders, isLoaded, markDone, clearDone } = useOrders();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  function toggleDay(dateKey: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getTotal(order: Order) {
    return order.items.reduce((sum, item) => {
      const n = parseFloat(item.price.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }

  // ─── Group done orders by the date they were completed ────────────────────

  type DayGroup = { dateLabel: string; dateKey: string; orders: Order[] };

  function groupByDay(doneOrders: Order[]): DayGroup[] {
    const map: { [key: string]: DayGroup } = {};
    for (const order of doneOrders) {
      const ts = order.completedAt ?? order.timestamp;
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key])
        map[key] = { dateLabel: formatDate(ts), dateKey: key, orders: [] };
      map[key].orders.push(order);
    }
    // Most recent day first
    return Object.values(map).sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey),
    );
  }

  const dayGroups = groupByDay(done);

  // ─── Print ─────────────────────────────────────────────────────────────────

  async function printDay(group: DayGroup) {
    const grandTotal = group.orders.reduce((sum, o) => sum + getTotal(o), 0);

    const orderBlocks = group.orders
      .map((order) => {
        const completedTime = formatTime(order.completedAt ?? order.timestamp);
        const itemRows = order.items
          .map((item) => {
            const note = order.notes[item.id];
            return `
          <tr>
            <td style="padding:4px 0;">${item.name}</td>
            <td style="padding:4px 0;text-align:right;">${item.price}</td>
          </tr>
          ${note ? `<tr><td colspan="2" style="padding:2px 0 6px 12px;font-style:italic;color:#666;font-size:11px;">note: ${note}</td></tr>` : ""}
        `;
          })
          .join("");

        return `
        <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ddd;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-weight:bold;">${completedTime}</span>
            <span style="font-weight:bold;">PHP ${getTotal(order)}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">${itemRows}</table>
        </div>
      `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: monospace; padding: 28px; color: #111; }
            h1 { font-size: 22px; letter-spacing: 4px; text-transform: lowercase; margin-bottom: 4px; }
            .subtitle { font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
            .date { font-size: 15px; font-weight: bold; margin-bottom: 6px; }
            .count { font-size: 11px; color: #888; margin-bottom: 20px; }
            .grand-total { margin-top: 20px; font-size: 18px; font-weight: bold; border-top: 2px solid #111; padding-top: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>marie antoinette</h1>
          <div class="subtitle">daily transactions</div>
          <div class="date">${group.dateLabel}</div>
          <div class="count">${group.orders.length} order${group.orders.length !== 1 ? "s" : ""} completed</div>
          ${orderBlocks}
          <div class="grand-total">
            <span>grand total</span>
            <span>PHP ${grandTotal}</span>
          </div>
        </body>
      </html>
    `;

    return new Promise<void>((resolve) => {
      Alert.alert(
        "Save daily report",
        `${group.dateLabel}\n${group.orders.length} order${group.orders.length !== 1 ? "s" : ""} · PHP ${grandTotal}\n\nThis will generate a PDF you can save or share.`,
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve() },
          {
            text: "Create PDF",
            onPress: async () => {
              try {
                const { uri } = await Print.printToFileAsync({ html });
                await Sharing.shareAsync(uri, {
                  mimeType: "application/pdf",
                  UTI: "com.adobe.pdf",
                  dialogTitle: `marie antoinette — ${group.dateLabel}`,
                });
              } catch {}
              resolve();
            },
          },
        ],
      );
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* ── Pending ── */}
      <Text style={styles.sectionLabel}>
        pending {pending.length > 0 ? `— ${pending.length}` : ""}
      </Text>

      {pending.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>no pending orders</Text>
          <Text style={styles.emptyText}>
            confirmed orders from customers will appear here
          </Text>
        </View>
      ) : (
        pending.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderTime}>
                  {formatTime(order.timestamp)}
                </Text>
                <Text style={styles.orderCount}>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <Text style={styles.orderTotal}>PHP {getTotal(order)}</Text>
            </View>

            <View style={styles.divider} />

            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                {order.notes[item.id] ? (
                  <Text style={styles.itemNote}>
                    note: {order.notes[item.id]}
                  </Text>
                ) : null}
              </View>
            ))}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => markDone(order.id)}
            >
              <Text style={styles.doneButtonText}>mark as done</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* ── Completed grouped by day ── */}
      {dayGroups.length > 0 && (
        <>
          <View style={styles.doneSeparator}>
            <Text style={styles.sectionLabel}>completed</Text>
            <TouchableOpacity onPress={clearDone}>
              <Text style={styles.clearText}>clear all</Text>
            </TouchableOpacity>
          </View>

          {dayGroups.map((group) => {
            const dayTotal = group.orders.reduce(
              (sum, o) => sum + getTotal(o),
              0,
            );
            const isExpanded = expandedDays.has(group.dateKey);
            return (
              <View key={group.dateKey}>
                {/* Day header — tap to expand/collapse */}
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(group.dateKey)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayHeaderLeft}>
                    <Ionicons
                      name={isExpanded ? "chevron-down" : "chevron-forward"}
                      size={14}
                      color="#555"
                      style={styles.dayChevron}
                    />
                    <View>
                      <Text style={styles.dayLabel}>{group.dateLabel}</Text>
                      <Text style={styles.dayMeta}>
                        {group.orders.length} order
                        {group.orders.length !== 1 ? "s" : ""} · PHP {dayTotal}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.printButton}
                    onPress={() => printDay(group)}
                  >
                    <Text style={styles.printButtonText}>
                      print daily report
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Orders — only visible when expanded */}
                {isExpanded &&
                  group.orders.map((order) => (
                    <View key={order.id} style={styles.cardDone}>
                      <View style={styles.cardHeader}>
                        <View>
                          <Text style={styles.orderTimeDone}>
                            {formatTime(order.completedAt ?? order.timestamp)}
                          </Text>
                          <Text style={styles.completedLabel}>
                            completed{" "}
                            {order.completedAt
                              ? formatTime(order.completedAt)
                              : "—"}
                          </Text>
                        </View>
                        <Text style={styles.orderTotalDone}>
                          PHP {getTotal(order)}
                        </Text>
                      </View>
                      {order.items.map((item) => (
                        <Text key={item.id} style={styles.itemNameDone}>
                          {item.name}
                        </Text>
                      ))}
                    </View>
                  ))}
              </View>
            );
          })}
        </>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
    padding: 16,
  },
  sectionLabel: {
    fontSize: 10,
    color: "#555",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#555",
    fontSize: 14,
    marginBottom: 6,
    textTransform: "lowercase",
    letterSpacing: 0.5,
  },
  emptyText: {
    color: "#444",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderTime: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "300",
    letterSpacing: 1,
  },
  orderCount: {
    fontSize: 11,
    color: "#555",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginBottom: 12,
  },
  itemRow: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 11,
    color: "#555",
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 11,
    color: "#888",
    fontStyle: "italic",
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#333",
    marginTop: 2,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: "#2d6a2d",
    backgroundColor: "#1a3a1a",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    minHeight: 48,
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#6aaa6a",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  doneSeparator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  clearText: {
    fontSize: 11,
    color: "#555",
    letterSpacing: 0.5,
    textTransform: "lowercase",
    textDecorationLine: "underline",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  dayChevron: {
    marginRight: 10,
  },
  dayLabel: {
    fontSize: 13,
    color: "#ccc",
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  dayMeta: {
    fontSize: 10,
    color: "#555",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  printButton: {
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: "center",
  },
  printButtonText: {
    color: "#aaa",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  cardDone: {
    backgroundColor: "#2B5B09",
    borderWidth: 1,
    borderColor: "#222",
    padding: 14,
    marginBottom: 6,
  },
  orderTimeDone: {
    fontSize: 13,
    color: "#555",
  },
  completedLabel: {
    fontSize: 10,
    color: "#3a3a3a",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  orderTotalDone: {
    fontSize: 13,
    color: "#444",
  },
  itemNameDone: {
    fontSize: 12,
    color: "#3a3a3a",
    marginTop: 4,
  },
});
