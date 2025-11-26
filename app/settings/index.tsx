import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { meMobile, type UserDto } from '../../components/Me';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';

import ShopIcon from '../../assets/images/icons/shopping-cart.svg';
import CalendarIcon from '../../assets/images/icons/calendar-regular-full.svg';
import HomerIcon from '../../assets/images/icons/home.svg';
import SettingsIcon from '../../assets/images/icons/settings.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { getBgmVolume, initBgm, setBgmVolume } from '../../components/musicPlayer';
import * as SecureStore from 'expo-secure-store';

type VolumeKey = 'music' | 'sfx';

const VOLUME_CONTROLS: { key: VolumeKey; label: string; hint: string }[] = [
  { key: 'music', label: 'Música', hint: 'Melodías de fondo durante tus sesiones.' },
  { key: 'sfx', label: 'SFX', hint: 'Efectos de sonido.' },
];

const LANGUAGES: { id: 'es' | 'en'; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [volumes, setVolumes] = useState<Record<VolumeKey, number>>({
    music: getBgmVolume() * 100,
    sfx: 45,
  });
  const [volumeEnabled, setVolumeEnabled] = useState<Record<VolumeKey, boolean>>({
    music: true,
    sfx: true,
  });
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [token, setToken] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const firstRenderRef = useRef(true);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('access_token');
        if (active) setToken(storedToken ?? null);

        const userData = await meMobile();
        if (!active) return;
        if (userData) {
          setUser(userData);
          setCoins(parseInt(userData.coins));

          if (API_URL && storedToken) {
            const res = await fetch(`${API_URL}/settings/user/${userData._id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storedToken}`,
              },
            });

            if (res.ok) {
              const data: { musicVolume?: number; sfxVolume?: number; lenguage?: 'es' | 'en' } = await res.json();
              const musicVol = data.musicVolume ?? 60;
              const sfxVol = data.sfxVolume ?? 45;
              setVolumes({ music: musicVol, sfx: sfxVol });
              setVolumeEnabled({ music: musicVol > 0, sfx: sfxVol > 0 });
              setLanguage(data.lenguage ?? 'es');
              await applyVolumeChanges('music', musicVol);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function applyVolumeChanges(key: VolumeKey, value: number) {
    if (key === 'music') {
      await initBgm();
      await setBgmVolume(value / 100);
    }
  }

  useEffect(() => {
    const effectiveMusic = volumeEnabled.music ? volumes.music : 0;
    void applyVolumeChanges('music', effectiveMusic);
  }, [volumeEnabled.music, volumes.music]);

  useEffect(() => {
    void initBgm();
  }, []);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (!user || !token || !API_URL) return;

    const musicOut = volumeEnabled.music ? volumes.music : 0;
    const sfxOut = volumeEnabled.sfx ? volumes.sfx : 0;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetch(`${API_URL}/settings/user/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          musicVolume: musicOut,
          sfxVolume: sfxOut,
          lenguage: language,
        }),
      }).catch(() => {});
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [API_URL, language, token, user, volumeEnabled, volumes]);

  return (
    <SafeAreaView
      className="
        flex-1
        bg-[#FFEFD7]
      "
    >
      <ScrollView className="flex-1 bg-[#FFEFD7] px-4 py-6">
        <View
          id="coins"
          className="flex-start self-start mb-4 w-auto"
        >
          <View
            className="bg-[#d4dbb2] p-4 w-auto rounded-lg ml-1 flex-row items-center justify-between"
          >
            <Text style={{ fontFamily: 'Madimi' }}>Coins: {coins}</Text>

            <Image
              source={require('../../assets/images/coin.png')}
              style={{ width: 20, height: 20, marginLeft: 8 }}
            />
          </View>
        </View>

        <View className="bg-[#FFEFD7] rounded-3xl p-6 shadow-lg">
          <View className="mb-6">
            <Text style={{ fontFamily: 'Madimi', fontSize: 32, color: '#4b2a1c' }}>Configuración</Text>
            <Text style={{ fontFamily: 'Madimi', fontSize: 16, color: '#7a5033', marginTop: 6 }}>
              Personaliza la forma en que la app suena y te acompaña.
            </Text>
          </View>

          <View className="bg-[#fff6ec] rounded-2xl p-4 mb-4">
            <View className="mb-4">
              <Text style={{ fontFamily: 'Madimi', fontSize: 22, color: '#5a3423' }}>Audio</Text>
              <Text style={{ fontFamily: 'Madimi', fontSize: 14, color: '#a17353', marginTop: 2 }}>
                Ajusta cada pista según tu preferencia.
              </Text>
            </View>

            {VOLUME_CONTROLS.map(({ key, label, hint }) => {
              const enabled = volumeEnabled[key];
              const value = volumes[key];

              return (
                <View key={key} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Madimi', fontSize: 16, color: '#4b2a1c' }}>{label}</Text>
                      <Text style={{ fontFamily: 'Madimi', fontSize: 13, color: '#c18459' }}>{hint}</Text>
                    </View>

                    <View className="items-end">
                      <Text style={{ fontFamily: 'Madimi', fontSize: 16, color: '#7a5132' }}>{value}%</Text>
                      <Pressable
                        className="mt-1"
                        onPress={async () => {
                          setVolumeEnabled((prev) => {
                            const nextEnabled = !prev[key];
                            const next = { ...prev, [key]: nextEnabled } as Record<VolumeKey, boolean>;
                            const output = nextEnabled ? volumes[key] : 0;
                            void applyVolumeChanges(key, output);
                            return next;
                          });
                        }}
                      >
                        <View
                          className="w-14 h-8 rounded-full"
                          style={{
                            backgroundColor: enabled ? '#d1fae5' : '#e2e8f0',
                            borderColor: enabled ? '#34d399' : '#cbd5f5',
                            borderWidth: 1,
                          }}
                        >
                          <View
                            className="w-4 h-4 rounded-full"
                            style={{
                              marginTop: 6,
                              marginLeft: enabled ? 24 : 6,
                              backgroundColor: enabled ? '#047857' : '#94a3b8',
                            }}
                          />
                        </View>
                      </Pressable>
                    </View>
                  </View>

                  <Slider
                    disabled={!enabled}
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={value}
                    onValueChange={(next) => {
                      setVolumes((prev) => ({ ...prev, [key]: next }));
                      void applyVolumeChanges(key, enabled ? next : 0);
                    }}
                    minimumTrackTintColor={enabled ? '#34d399' : '#cbd5f5'}
                    maximumTrackTintColor={enabled ? '#d1fae5' : '#e2e8f0'}
                    thumbTintColor={enabled ? '#047857' : '#94a3b8'}
                  />
                </View>
              );
            })}
          </View>

          <View className="bg-[#fff6ec] rounded-2xl p-4">
            <View className="mb-3">
              <Text style={{ fontFamily: 'Madimi', fontSize: 22, color: '#5a3423' }}>Idioma</Text>
              <Text style={{ fontFamily: 'Madimi', fontSize: 14, color: '#a17353', marginTop: 2 }}>
                Selecciona cómo se muestran los textos.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {LANGUAGES.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setLanguage(option.id)}
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    backgroundColor: language === option.id ? 'rgba(76, 42, 26, 0.16)' : 'rgba(76, 42, 26, 0.08)',
                    shadowColor: '#6a3b20',
                    shadowOpacity: language === option.id ? 0.2 : 0,
                    shadowRadius: language === option.id ? 8 : 0,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  <Text style={{ fontFamily: 'Madimi', fontSize: 16, color: '#4b2a1c' }}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

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
