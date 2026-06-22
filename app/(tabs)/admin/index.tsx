import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMenu } from '../../../context/MenuContext';
import { useOrders } from '../../../context/OrderContext';

// ─── Admin — Menu Item List ───────────────────────────────────────────────────

export default function AdminScreen() {
  const router = useRouter();
  const { items, isLoaded, removeItem, toggleAvailable, toggleFeatured } = useMenu();
  const { pendingCount } = useOrders();

  function confirmRemove(id: string, name: string) {
    Alert.alert(
      'Remove item',
      `Remove "${name}" from the menu permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>

      <View style={styles.staffBanner}>
        <Text style={styles.staffBannerText}>staff access only — not visible to customers</Text>
      </View>

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => router.push('/(tabs)/admin/orders')}
      >
        <Text style={styles.ordersButtonText}>view orders</Text>
        {pendingCount > 0 && (
          <View style={styles.ordersBadge}>
            <Text style={styles.ordersBadgeText}>{pendingCount} pending</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(tabs)/admin/edit')}
      >
        <Text style={styles.addButtonText}>+ add new item</Text>
      </TouchableOpacity>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>no items yet. tap "+ add new item" to create one.</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={[styles.card, !item.available && styles.cardUnavailable]}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={[styles.cardName, !item.available && styles.cardNameFaded]}>
                  {item.name}
                </Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
              <View style={styles.badgeGroup}>
                {item.featured && (
                  <View style={styles.badgeFeatured}>
                    <Text style={styles.badgeText}>popular</Text>
                  </View>
                )}
                <View style={[styles.badge, item.available ? styles.badgeOn : styles.badgeOff]}>
                  <Text style={styles.badgeText}>{item.available ? 'available' : 'unavailable'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionEdit}
                onPress={() => router.push({ pathname: '/(tabs)/admin/edit', params: { id: item.id } })}
              >
                <Text style={styles.actionEditText}>edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionFeature, item.featured && styles.actionFeatureActive]}
                onPress={() => toggleFeatured(item.id)}
              >
                <Text style={[styles.actionFeatureText, item.featured && styles.actionFeatureTextActive]}>
                  {item.featured ? '★ featured' : '☆ feature'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionToggle, item.available ? styles.actionToggleOff : styles.actionToggleOn]}
                onPress={() => toggleAvailable(item.id)}
              >
                <Text style={styles.actionToggleText}>
                  {item.available ? 'mark unavailable' : 'mark available'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRemove}
                onPress={() => confirmRemove(item.id, item.name)}
              >
                <Text style={styles.actionRemoveText}>remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  contentContainer: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  staffBanner: {
    backgroundColor: '#222',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  staffBannerText: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 16,
    marginBottom: 8,
    minHeight: 52,
  },
  ordersButtonText: {
    color: '#aaa',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  ordersBadge: {
    backgroundColor: '#2d6a2d',
    borderWidth: 1,
    borderColor: '#3a8a3a',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ordersBadgeText: {
    color: '#6aaa6a',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#111',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  emptyBox: {
    margin: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
  },
  cardUnavailable: {
    borderColor: '#2a2a2a',
    backgroundColor: '#161616',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardCategory: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
    marginBottom: 4,
  },
  cardNameFaded: {
    color: '#555',
  },
  cardPrice: {
    fontSize: 13,
    color: '#888',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  badgeFeatured: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#888',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeOn: {
    backgroundColor: '#1a3a1a',
    borderWidth: 1,
    borderColor: '#2d6a2d',
  },
  badgeOff: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#6a2d2d',
  },
  badgeText: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionFeature: {
    borderWidth: 1,
    borderColor: '#555',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  actionFeatureActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  actionFeatureText: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  actionFeatureTextActive: {
    color: '#111',
  },
  actionEdit: {
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  actionEditText: {
    color: '#ccc',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  actionToggle: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionToggleOff: {
    borderColor: '#6a2d2d',
    backgroundColor: '#2a1a1a',
  },
  actionToggleOn: {
    borderColor: '#2d6a2d',
    backgroundColor: '#1a3a1a',
  },
  actionToggleText: {
    color: '#aaa',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
  actionRemove: {
    borderWidth: 1,
    borderColor: '#6a2d2d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  actionRemoveText: {
    color: '#c06060',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
});
