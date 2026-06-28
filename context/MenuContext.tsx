import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import matchaData from "../server/data/matcha.json";
import { API_BASE } from "../constants/api";
import NetInfo from "@react-native-community/netinfo";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  desc: string;
  available: boolean;
  featured: boolean;
};

type MenuContextType = {
  items: MenuItem[];
  isLoaded: boolean;
  fetchError: boolean;
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  addItem: (
    item: Omit<MenuItem, "id" | "available" | "featured">,
  ) => Promise<void>;
  updateItem: (
    id: string,
    changes: Partial<Omit<MenuItem, "id">>,
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleAvailable: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
};

// ─── Seed data (first launch) ─────────────────────────────────────────────────

const SEED_ITEMS: MenuItem[] = matchaData.drinks.map((d) => ({
  id: String(d.id),
  category: d.category,
  name: d.name,
  price: `PHP ${d.price}`,
  desc: d.description,
  available: true,
  featured: false,
}));

function apiDrinkToMenuItem(d: any): MenuItem {
  return {
    id: String(d.id),
    category: d.category,
    name: d.name,
    price: `PHP ${d.price}`,
    desc: d.description,
    available: true,
    featured: false,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const MenuContext = createContext<MenuContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const checkConnectionAndFetch = async () => {
      // 1. Load favorites
      try {
        const favsRaw = await AsyncStorage.getItem("favorites");
        if (favsRaw) setFavorites(JSON.parse(favsRaw));
      } catch {}

      // 2. Load cached menu items
      let localItems: MenuItem[] | null = null;
      try {
        const raw = await AsyncStorage.getItem("menuItems");
        if (raw) {
          const parsed: MenuItem[] = JSON.parse(raw);
          localItems = parsed.map((i) => ({
            ...i,
            featured: i.featured ?? false,
          }));
        }
      } catch {}

      // 3. Try to fetch fresh data from the API
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE}/api/matcha`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error("non-200");

        const data = await res.json();
        const apiItems: MenuItem[] = data.map(apiDrinkToMenuItem);

        if (localItems) {
          const merged = apiItems.map((apiItem) => {
            const cached = (localItems as MenuItem[]).find(
              (c) => c.id === apiItem.id,
            );
            return cached
              ? {
                  ...apiItem,
                  available: cached.available,
                  featured: cached.featured,
                }
              : apiItem;
          });
          const customItems = (localItems as MenuItem[]).filter(
            (c) => !apiItems.find((a) => a.id === c.id),
          );
          const final = [...merged, ...customItems];
          setItems(final);
          await AsyncStorage.setItem("menuItems", JSON.stringify(final)).catch(
            () => {},
          );
        } else {
          setItems(apiItems);
          await AsyncStorage.setItem(
            "menuItems",
            JSON.stringify(apiItems),
          ).catch(() => {});
        }

        setFetchError(false);
      } catch {
        // 4. No server / no WiFi — show cached or seed data + error banner
        setFetchError(true);
        if (localItems) {
          setItems(localItems as MenuItem[]);
        } else {
          setItems(SEED_ITEMS);
          await AsyncStorage.setItem(
            "menuItems",
            JSON.stringify(SEED_ITEMS),
          ).catch(() => {});
        }
      }

      setIsLoaded(true);
    };

    // Run once when the app first loads
    checkConnectionAndFetch();

    // Re-run automatically whenever connectivity changes (reconnects, disconnects)
    const unsubscribe = NetInfo.addEventListener(() => {
      checkConnectionAndFetch();
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  async function persist(updated: MenuItem[]) {
    setItems(updated);
    await AsyncStorage.setItem("menuItems", JSON.stringify(updated)).catch(
      () => {},
    );
  }
  async function toggleFavorite(id: string) {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated)).catch(
      () => {},
    );
  }

  async function addItem(
    item: Omit<MenuItem, "id" | "available" | "featured">,
  ) {
    await persist([
      ...items,
      { ...item, id: `custom-${Date.now()}`, available: true, featured: false },
    ]);
  }

  async function updateItem(
    id: string,
    changes: Partial<Omit<MenuItem, "id">>,
  ) {
    await persist(items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  async function removeItem(id: string) {
    await persist(items.filter((i) => i.id !== id));
  }

  async function toggleAvailable(id: string) {
    await persist(
      items.map((i) => (i.id === id ? { ...i, available: !i.available } : i)),
    );
  }

  async function toggleFeatured(id: string) {
    await persist(
      items.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i)),
    );
  }

  return (
    <MenuContext.Provider
      value={{
        items,
        isLoaded,
        fetchError,
        favorites,
        toggleFavorite,
        addItem,
        updateItem,
        removeItem,
        toggleAvailable,
        toggleFeatured,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
