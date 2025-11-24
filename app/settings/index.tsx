import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { meMobile, type UserDto } from '../../components/Me';
import { View, Text, Pressable } from 'react-native';

import LogOutIcon from '../../assets/images/icons/logOut.svg';
import ShopIcon from '../../assets/images/icons/shopping-cart.svg';
import CalendarIcon from '../../assets/images/icons/calendar-regular-full.svg';
import HomerIcon from '../../assets/images/icons/home.svg';
import SettingsIcon from '../../assets/images/icons/settings.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatDto, getCatMobile } from '../../components/getCatMovile';
import { Cat } from '../../components/Cat';
import Slider from '@react-native-community/slider';
import { getBgmVolume, setBgmVolume } from '../../components/musicPlayer';

export default function SettingsPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [catUrl, setCatUrl] = useState<CatDto | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [volume, setVolume] = useState<number>(getBgmVolume());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const userData = await meMobile();
        if (!active) return;
        if (userData) {
          setUser(userData);
          setCoins(parseInt(userData.coins));
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
  }, []);

  const handleVolumeChange = async (v: number) => {
    setVolume(v);
    await setBgmVolume(v);
  };

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#FFEFD7]
      "
    >
      <View
        className="
          flex-1
          bg-[#FFEFD7]
          items-center
          justify-center
        "
      >
        <View
          id="card"
          className="
            bg-[#CFD7AF]
            w-4/5
            h-3/4
            rounded-lg
            items-center
            pt-6
          "
        >
          <Text
            style={{
              fontFamily: 'Madimi',
              fontSize: 24,
              marginBottom: 20,
            }}
          >
            {user?.userName}
          </Text>

          <Text
            style={{
              fontFamily: 'Madimi',
              fontSize: 18,
              marginBottom: 20,
            }}
          >
            Coins: {coins}
          </Text>

          <View
            className="
              flex-row
              items-center
              justify-center
              mt-10
              gap-4
              mb-10
            "
          >
            <Text
              style={{
                fontFamily: 'Madimi',
                fontSize: 18,
              }}
            >
              Log out
            </Text>

            <Pressable onPress={() => { router.push('/'); }}>
              <LogOutIcon width={30} height={30} />
            </Pressable>
          </View>

          <View
            className="
              w-4/5
              items-center
              mb-10
            "
          >
            <Text
              style={{
                fontFamily: 'Madimi',
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Music volume: {Math.round(volume * 100)}%
            </Text>

            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#435C3D"
              maximumTrackTintColor="#A3A3A3"
              thumbTintColor="#435C3D"
            />
          </View>

          <View id="cat">
            <Cat catUrl={catUrl?.skin || 'default'} />
          </View>
        </View>
      </View>

      <View
        id="navigation"
        className="
          w-11/12 max-w-md
          bg-[#d4dbb2]
          p-4
          rounded-xl
          mb-5
          mx-auto
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
    </SafeAreaView>
  );
}
