import { Stack, useNavigation } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

// ─── Admin PIN ────────────────────────────────────────────────────────────────

const ADMIN_PIN = '1234';
const ROWS = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','del']];

export default function AdminLayout() {
  const navigation = useNavigation();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  // Lock admin when the tab loses focus (customer navigates away)
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      setIsUnlocked(false);
      setPin('');
      setShake(false);
    });
    return unsub;
  }, [navigation]);

  function pressKey(digit: string) {
    if (shake) return;
    const next = pin + digit;
    if (next.length > 4) return;
    setPin(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setTimeout(() => {
          setIsUnlocked(true);
          setPin('');
        }, 150);
      } else {
        setShake(true);
        setTimeout(() => {
          setPin('');
          setShake(false);
        }, 700);
      }
    }
  }

  function pressDelete() {
    if (!shake) setPin((p) => p.slice(0, -1));
  }

  // ─── PIN Screen ─────────────────────────────────────────────────────────────

  if (!isUnlocked) {
    return (
      <View style={styles.screen}>
        <Text style={styles.brand}>fnshedrink</Text>
        <Text style={styles.title}>STAFF ACCESS</Text>
        <Text style={styles.subtitle}>enter pin to continue</Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
                shake && styles.dotError,
              ]}
            />
          ))}
        </View>

        {shake && <Text style={styles.errorText}>incorrect — try again</Text>}
        {!shake && <Text style={styles.errorPlaceholder}> </Text>}

        <View style={styles.keypad}>
          {ROWS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ki) =>
                key === '' ? (
                  <View key={ki} style={styles.keyEmpty} />
                ) : (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.key, key === 'del' && styles.keyDel]}
                    onPress={() => (key === 'del' ? pressDelete() : pressKey(key))}
                    activeOpacity={0.5}
                  >
                    <Text style={[styles.keyText, key === 'del' && styles.keyDelText]}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ─── Admin Stack ─────────────────────────────────────────────────────────────

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '400', fontSize: 13, color: '#fff' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'STAFF — MENU ITEMS' }} />
      <Stack.Screen name="edit" options={{ title: 'EDIT ITEM' }} />
      <Stack.Screen name="orders" options={{ title: 'ORDERS' }} />
    </Stack>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  brand: {
    fontSize: 13,
    color: '#444',
    letterSpacing: 2,
    textTransform: 'lowercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#555',
    letterSpacing: 1,
    textTransform: 'lowercase',
    marginBottom: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  dotError: {
    borderColor: '#c06060',
    backgroundColor: '#c06060',
  },
  errorText: {
    fontSize: 11,
    color: '#c06060',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
    marginBottom: 28,
  },
  errorPlaceholder: {
    fontSize: 11,
    marginBottom: 28,
  },
  keypad: {
    gap: 10,
    marginTop: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  key: {
    width: 80,
    height: 72,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyDel: {
    borderColor: '#2a2a2a',
    backgroundColor: '#161616',
  },
  keyEmpty: {
    width: 80,
    height: 72,
  },
  keyText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
  },
  keyDelText: {
    color: '#555',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
});
