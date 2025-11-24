import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { itemImages } from './itemImages';

type Item = {
  _id: string;
  name: string;
  sprite_path: string;
  price: number;
  type: string;
};

type Props = {
  onSelectItem: (itemId: string) => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getItemsMobile(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items/all`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    let message = 'Error cargando items';
    try {
      const err = await res.json();
      if (err?.message) {
        message = Array.isArray(err.message)
          ? err.message.join(', ')
          : String(err.message);
      }
    } catch {}
    throw new Error(message);
  }

  return await res.json();
}

export default function ItemShop({ onSelectItem }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getItemsMobile();
        if (!alive) return;
        setItems(data);
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : 'Error cargando items'
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.itemList}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.card, styles.cardSkeleton]}>
              <View style={styles.label}>
                <View style={styles.skeletonLine} />
              </View>
              <View style={styles.imageBox}>
                <View style={styles.skeletonBox} />
              </View>
              <View style={styles.priceRow}>
                <View style={[styles.skeletonLine, { width: '40%' }]} />
                <View style={[styles.skeletonLine, { width: '20%' }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!items || items.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.emptyText}>No hay items disponibles</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const localSource = itemImages[item.sprite_path];

    return (
      <Pressable
        style={styles.card}
        onPress={() => onSelectItem(item._id)}
      >
        <View style={styles.label}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>

        <View style={styles.imageBox}>
          {localSource ? (
            <Image
              source={localSource}
              style={styles.img}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.skeletonBox} />
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.typeText}>{item.type}</Text>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.itemList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  itemList: {
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#CFD7AF',
    borderRadius: 16,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardSkeleton: {
    justifyContent: 'space-between',
  },
  label: {
    marginBottom: 8,
  },
  itemName: {
    fontFamily: 'Madimi',
    fontSize: 16,
  },
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 90,
  },
  img: {
    width: 72,
    height: 72,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: 'Madimi',
    fontSize: 14,
  },
  priceText: {
    fontFamily: 'Madimi',
    fontSize: 14,
  },
  skeletonBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#d4d4d4',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 8,
    backgroundColor: '#d4d4d4',
    marginBottom: 4,
  },
  errorText: {
    textAlign: 'center',
    fontFamily: 'Madimi',
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Madimi',
    fontSize: 16,
    marginTop: 20,
  },
});
