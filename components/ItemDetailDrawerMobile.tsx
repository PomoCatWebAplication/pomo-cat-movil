import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { itemImages } from './itemImages';

type Item = {
  _id: string;
  name: string;
  sprite_path: string;
  price: number;
  type: string;
  itemQuality?: string;
};

type Props = {
  itemId: string;
  onClose: () => void;
  userCoins: number;
  userId: string;
  onEquipped?: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function ItemDetailDrawerMobile({
  itemId,
  onClose,
  userCoins,
  userId,
  onEquipped,
}: Props) {
  const [item, setItem] = useState<Item | null>(null);
  const [owned, setOwned] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resItem = await fetch(`${API_URL}/items/${itemId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!resItem.ok) throw new Error('Error cargando item');
        const it: Item = await resItem.json();

        const inventory = await fetch(
          `${API_URL}/inventory/user/${userId}/item/${it._id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!alive) return;
        setItem(it);
        setOwned(inventory.ok);
      } catch (e: any) {
        if (!alive) return;
        setMsg(e?.message ?? 'Error cargando detalle');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [itemId, userId]);

  const action = owned ? 'equip' : 'buy';

  const onAction = () => {
    if (!item) return;
    setMsg(null);
    setPending(true);

    (async () => {
      try {
        if (action === 'buy') {
          const res = await fetch(
            `${API_URL}/shop/purchase/${item._id}/${userId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          );
          if (!res.ok) throw new Error('No se pudo comprar');
          setOwned(true);
          setMsg('¡Comprado! Ahora puedes equiparlo.');
          return;
        }

        type ItemType = 'HAT' | 'SHIRT' | 'ACCESSORY' | 'SKIN' | 'BACKGROUND';
        const t = item.type as ItemType;

        const patch: Record<string, string> = {};
        switch (t) {
          case 'HAT':
            patch.hat = item._id;
            break;
          case 'SHIRT':
            patch.shirt = item._id;
            break;
          case 'ACCESSORY':
            patch.accessory = item._id;
            break;
          case 'SKIN':
            patch.skin = item.sprite_path;
            break;
          case 'BACKGROUND':
            patch.background = item.sprite_path;
            break;
          default:
            throw new Error(`Tipo de ítem no soportado: ${item.type}`);
        }

        const res = await fetch(`${API_URL}/pet/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || 'No se pudo equipar');
        }
        setMsg('¡Equipado!');
        if (onEquipped) onEquipped();
      } catch (e: any) {
        setMsg(e?.message ?? 'Ocurrió un error');
      } finally {
        setPending(false);
      }
    })();
  };

  const localSource = item ? itemImages[item.sprite_path] : undefined;
  const blocked = !owned && !!item && userCoins < item.price;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={onClose} />
      <View style={styles.drawerCard}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {loading || !item ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>
              {msg ?? 'Cargando…'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.coinsText}>Tus monedas: {userCoins}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.imgFrame}>
                {localSource ? (
                  <Image
                    source={localSource}
                    style={styles.itemImg}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imgPlaceholder} />
                )}
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Tipo: </Text>
                  {item.type}
                </Text>
                {item.itemQuality && (
                  <Text style={styles.infoText}>
                    <Text style={styles.bold}>Calidad: </Text>
                    {item.itemQuality}
                  </Text>
                )}
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Precio: </Text>
                  {item.price} 🍅
                </Text>

                {blocked && (
                  <Text style={styles.errorMsg}>
                    No tienes suficientes monedas.
                  </Text>
                )}

                <Pressable
                  onPress={onAction}
                  disabled={pending || blocked}
                  style={[
                    styles.actionBtn,
                    owned ? styles.actionEquip : styles.actionBuy,
                    (pending || blocked) && styles.actionDisabled,
                  ]}
                >
                  <Text style={styles.actionText}>
                    {pending
                      ? owned
                        ? 'Equipando…'
                        : 'Comprando…'
                      : owned
                      ? 'Equipar'
                      : `Comprar por ${item.price} 🍅`}
                  </Text>
                </Pressable>

                {msg && <Text style={styles.msgText}>{msg}</Text>}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouchable: {
    position: 'absolute',
    inset: 0,
  },
  drawerCard: {
    width: '100%',
    backgroundColor: '#FFEFD7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeText: {
    fontSize: 18,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  coinsText: {
    opacity: 0.8,
  },
  body: {
    flexDirection: 'row',
    gap: 16,
  },
  imgFrame: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#CFD7AF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImg: {
    width: 100,
    height: 100,
  },
  imgPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#d4d4d4',
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
  },
  errorMsg: {
    color: '#f55',
    marginTop: 4,
  },
  actionBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  actionBuy: {
    backgroundColor: '#2563eb',
  },
  actionEquip: {
    backgroundColor: '#16a34a',
  },
  actionDisabled: {
    opacity: 0.7,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  msgText: {
    marginTop: 6,
  },
});
