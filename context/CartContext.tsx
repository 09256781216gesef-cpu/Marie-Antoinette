import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;
  originalId: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

type RawItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
};

type CartContextType = {
  cartItems: CartItem[];
  notes: { [key: string]: string };
  cartNote: string;
  isLoaded: boolean;
  addToCart: (item: RawItem) => Promise<void>;
  removeItem: (id: string) => void;
  updateNote: (id: string, text: string) => void;
  updateCartNote: (text: string) => void;
  confirmOrder: () => Promise<void>;
  clearCart: () => Promise<void>;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [cartNote, setCartNote] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from AsyncStorage on mount so a page reload doesn't lose the cart.
  useEffect(() => {
    (async () => {
      try {
        const itemsRaw = await AsyncStorage.getItem("cartItems");
        const notesRaw = await AsyncStorage.getItem("cartNotes");
        const cartNoteRaw = await AsyncStorage.getItem("cartNote");
        if (itemsRaw) setCartItems(JSON.parse(itemsRaw));
        if (notesRaw) setNotes(JSON.parse(notesRaw));
        if (cartNoteRaw) setCartNote(cartNoteRaw);
      } catch {}
      setIsLoaded(true);
    })();
  }, []);

  async function addToCart(item: RawItem) {
    const stamped: CartItem = {
      id: `${item.id}-${Date.now()}`,
      originalId: item.id,
      category: item.category,
      name: item.name,
      price: item.price,
      desc: item.desc,
    };
    const updated = [...cartItems, stamped];
    setCartItems(updated);
    await AsyncStorage.setItem("cartItems", JSON.stringify(updated)).catch(
      () => {},
    );
  }

  function removeItem(id: string) {
    const updatedItems = cartItems.filter((i) => i.id !== id);
    const updatedNotes = { ...notes };
    delete updatedNotes[id];
    setCartItems(updatedItems);
    setNotes(updatedNotes);
    AsyncStorage.setItem("cartItems", JSON.stringify(updatedItems)).catch(
      () => {},
    );
    AsyncStorage.setItem("cartNotes", JSON.stringify(updatedNotes)).catch(
      () => {},
    );
  }

  function updateNote(id: string, text: string) {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    AsyncStorage.setItem("cartNotes", JSON.stringify(updated)).catch(() => {});
  }

  function updateCartNote(text: string) {
    setCartNote(text);
    AsyncStorage.setItem("cartNote", text).catch(() => {});
  }

  // Snapshot the current cart to orderItems/orderNotes before navigating to summary.
  async function confirmOrder() {
    await AsyncStorage.setItem("orderItems", JSON.stringify(cartItems)).catch(
      () => {},
    );
    await AsyncStorage.setItem("orderNotes", JSON.stringify(notes)).catch(
      () => {},
    );
  }

  async function clearCart() {
    setCartItems([]);
    setNotes({});
    setCartNote("");
    await AsyncStorage.multiRemove([
      "cartItems",
      "cartNotes",
      "cartNote",
      "cartItems",
      "cartNotes",
      "orderItems",
      "orderNotes",
    ]).catch(() => {});
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        notes,
        cartNote,
        isLoaded,
        addToCart,
        removeItem,
        updateNote,
        updateCartNote,
        confirmOrder,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
