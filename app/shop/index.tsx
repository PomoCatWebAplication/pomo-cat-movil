// app/shop/index.tsx
import { View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemShop from '../../components/getItems';
import { Cat } from '../../components/Cat';
import { type UserDto, meMobile } from '../../components/Me';
import { CatDto, getCatMobile } from '../../components/getCatMovile';
import { useRouter } from 'expo-router';
import { ItemDetailDrawerMobile } from '../../components/ItemDetailDrawerMobile';

import ShopIcon from '../../assets/images/icons/shopping-cart.svg';
import CalendarIcon from '../../assets/images/icons/calendar-regular-full.svg';
import HomerIcon from '../../assets/images/icons/home.svg';
import SettingsIcon from '../../assets/images/icons/settings.svg';

export default function ShopPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [catUrl, setCatUrl] = useState<CatDto | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const userData = await meMobile();
        if (!active) return;
        if (userData) setUser(userData);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cat = await getCatMobile();
        if (!active) return;
        if (cat) setCatUrl(cat);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const userCoins = user ? parseInt(user.coins) : 0;
  const userId = user?._id ?? '';

  return (
    <SafeAreaView
      className="
        flex-1 
        bg-[#FFEFD7]
        items-center
        justify-center
      "
    >
      <View
        id="cat"
        className="
          items-center
          justify-center
          mt-4
        "
      >
        <Cat catUrl={catUrl?.skin || 'default'} />
      </View>

      <View
        className="
          flex-1  
          w-full
          rounded-t-3xl
          mt-4
          overflow-hidden
          items-center
          bg-[#d4dbb2]
        "
      >
        <ItemShop onSelectItem={setSelectedItemId} />
      </View>

      <View
        id="navigation"
        className="
          w-11/12 max-w-md
          bg-[#d4dbb2]
          p-4
          rounded-xl
          mt-4
          mb-5
          flex-row
          items-center
          justify-center
          gap-20
        "
      >
        <Pressable onPress={() => { router.push('/home'); }}>
          <HomerIcon width={30} height={30} />
        </Pressable>

        <Pressable onPress={() => { router.push('/calendar'); }}>
          <CalendarIcon width={30} height={30} />
        </Pressable>

        <Pressable onPress={() => { router.push('/shop'); }}>
          <ShopIcon width={30} height={30} />
        </Pressable>

        <Pressable onPress={() => { router.push('/settings'); }}>
          <SettingsIcon width={30} height={30} />
        </Pressable>
      </View>

      {selectedItemId && userId !== '' && (
        <ItemDetailDrawerMobile
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
          userCoins={userCoins}
          userId={userId}
          onEquipped={() => {
            setSelectedItemId(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </SafeAreaView>
  );
}
