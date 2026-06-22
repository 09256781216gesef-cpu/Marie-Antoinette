import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuProvider } from '../context/MenuContext';
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';

export default function RootLayout() {
  return (
    <MenuProvider>
      <CartProvider>
        <OrderProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#000',
              headerTitleStyle: { fontWeight: '400', fontSize: 13 },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="order-summary" options={{ title: 'ORDER SUMMARY' }} />
            <Stack.Screen name="menu-detail" options={{ title: 'ORDER' }} />
          </Stack>

          <StatusBar style="dark" />
        </OrderProvider>
      </CartProvider>
    </MenuProvider>
  );
}
