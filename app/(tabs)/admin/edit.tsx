import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useMenu } from '../../../context/MenuContext';

// ─── Admin — Add / Edit Item ──────────────────────────────────────────────────

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, addItem, updateItem } = useMenu();

  const isEditing = !!id;
  const existing = isEditing ? items.find((i) => i.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [price, setPrice] = useState(
    existing ? existing.price.replace(/[^0-9.]/g, '') : ''
  );
  const [desc, setDesc] = useState(existing?.desc ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || !category.trim() || !price.trim() || !desc.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields before saving.');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid price', 'Enter a valid price (numbers only, e.g. 180).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        price: `PHP ${priceNum}`,
        desc: desc.trim(),
      };
      if (isEditing && id) {
        await updateItem(id, payload);
      } else {
        await addItem(payload);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'EDIT ITEM' : 'ADD ITEM' }} />

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>drink name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ceremonial Matcha Latte"
            placeholderTextColor="#555"
            selectionColor="#fff"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Latte, Pure, Frappe, Special"
            placeholderTextColor="#555"
            selectionColor="#fff"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>price (PHP)</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencyPrefix}>PHP</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={price}
              onChangeText={setPrice}
              placeholder="180"
              placeholderTextColor="#555"
              keyboardType="numeric"
              selectionColor="#fff"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={desc}
            onChangeText={setDesc}
            placeholder="Describe the drink..."
            placeholderTextColor="#555"
            multiline
            textAlignVertical="top"
            selectionColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'saving...' : isEditing ? 'save changes' : 'add to menu'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 15,
    padding: 14,
    minHeight: 52,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    color: '#555',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#333',
    borderRightWidth: 0,
    backgroundColor: '#1a1a1a',
    minHeight: 52,
    textAlignVertical: 'center',
  },
  priceInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#111',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
