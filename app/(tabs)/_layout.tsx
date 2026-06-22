import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTabletLayout } from "../../constants/layout";
import { useOrders } from "../../context/OrderContext";

export default function TabLayout() {
  const { isTablet } = useTabletLayout();
  const { pendingCount } = useOrders();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#538377",
          borderTopWidth: 1,
          borderTopColor: "#000",
          elevation: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cafe-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Cart tab hidden on tablet — the cart panel is inline in the menu split view */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarButton: isTablet ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
