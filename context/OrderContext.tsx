import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from './CartContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  timestamp: number;
  completedAt?: number;
  items: CartItem[];
  notes: { [key: string]: string };
  status: 'pending' | 'done';
};

type OrderContextType = {
  orders: Order[];
  pendingCount: number;
  isLoaded: boolean;
  placeOrder: (items: CartItem[], notes: { [key: string]: string }) => Promise<void>;
  markDone: (orderId: string) => Promise<void>;
  clearDone: () => Promise<void>;
  seedYesterdayOrders: () => Promise<void>;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('orderQueue');
        if (raw) setOrders(JSON.parse(raw));
      } catch {}
      setIsLoaded(true);
    })();
  }, []);

  async function persist(updated: Order[]) {
    setOrders(updated);
    await AsyncStorage.setItem('orderQueue', JSON.stringify(updated)).catch(() => {});
  }

  async function placeOrder(items: CartItem[], notes: { [key: string]: string }) {
    const order: Order = {
      id: `order-${Date.now()}`,
      timestamp: Date.now(),
      items,
      notes,
      status: 'pending',
    };
    await persist([order, ...orders]);
  }

  async function markDone(orderId: string) {
    await persist(orders.map((o) => (o.id === orderId ? { ...o, status: 'done', completedAt: Date.now() } : o)));
  }

  async function clearDone() {
    await persist(orders.filter((o) => o.status !== 'done'));
  }

  async function seedYesterdayOrders() {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const seed: Order[] = [
      {
        id: `seed-${yesterday}-1`,
        timestamp: yesterday - 3 * 60 * 60 * 1000,
        completedAt: yesterday - 3 * 60 * 60 * 1000 + 5 * 60 * 1000,
        items: [
          { id: 'seed-a', originalId: '1', category: 'Latte', name: 'Ceremonial Matcha Latte', price: 'PHP 180', desc: '' },
          { id: 'seed-b', originalId: '3', category: 'Frappe', name: 'Iced Matcha Frappe', price: 'PHP 195', desc: '' },
        ],
        notes: { 'seed-a': 'less sugar', 'seed-b': '' },
        status: 'done',
      },
      {
        id: `seed-${yesterday}-2`,
        timestamp: yesterday - 2 * 60 * 60 * 1000,
        completedAt: yesterday - 2 * 60 * 60 * 1000 + 4 * 60 * 1000,
        items: [
          { id: 'seed-c', originalId: '7', category: 'Pure', name: 'Koicha', price: 'PHP 220', desc: '' },
        ],
        notes: {},
        status: 'done',
      },
      {
        id: `seed-${yesterday}-3`,
        timestamp: yesterday - 1 * 60 * 60 * 1000,
        completedAt: yesterday - 1 * 60 * 60 * 1000 + 3 * 60 * 1000,
        items: [
          { id: 'seed-d', originalId: '5', category: 'Special', name: 'Strawberry Matcha', price: 'PHP 210', desc: '' },
          { id: 'seed-e', originalId: '6', category: 'Latte', name: 'Brown Sugar Matcha', price: 'PHP 185', desc: '' },
        ],
        notes: { 'seed-e': 'extra brown sugar' },
        status: 'done',
      },
    ];
    await persist([...seed, ...orders]);
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <OrderContext.Provider value={{ orders, pendingCount, isLoaded, placeOrder, markDone, clearDone, seedYesterdayOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
