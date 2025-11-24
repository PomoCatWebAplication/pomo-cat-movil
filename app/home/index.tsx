import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Cat, type CatDto } from '../../components/Cat';
import { useFonts } from 'expo-font';
import { meMobile, type UserDto } from '../../components/Me';
import { getCatMobile } from '../../components/getCatMovile';

import SettingsIcon from '../../assets/images/icons/settings.svg';
import CloseIcon from '../../assets/images/icons/close.svg';
import PlayIcon from '../../assets/images/icons/play-solid-full.svg';
import PauseIcon from '../../assets/images/icons/pause.svg';
import StopIcon from '../../assets/images/icons/stop.svg';
import ShopIcon from '../../assets/images/icons/shopping-cart.svg';
import CalendarIcon from '../../assets/images/icons/calendar-regular-full.svg';
import HomerIcon from '../../assets/images/icons/home.svg';

import { TimerSlider } from './components/TimerSlider';
import { router } from 'expo-router';

const ms = (min: number) => min * 60 * 1000;

const formatMMSS = (msv: number) => {
  const total = Math.ceil(msv / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Home() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const u = await meMobile();
        if (!active) return;
        if (!u) {
          setError('No se pudo obtener el usuario');
        } else {
          setUser(u);
        }
      } catch (e) {
        if (!active) return;
        setError(
          e instanceof Error ? e.message : 'Error al cargar el usuario'
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const [catUrl, setCatUrl] = useState<CatDto | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const cat = await getCatMobile();
        if (!active) return;
        setCatUrl(cat);
      } catch (e) {
        if (!active) return;
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setCoins(parseInt(user.coins));
    }
  }, [user]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const addCoins = useCallback(
    async (amount: number) => {
      if (!user?._id || !API_URL) return;

      try {
        await fetch(`${API_URL}/auth/sum-coins/${user._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: amount }),
        });
      } catch (e) {
        console.error('Error sum-coins', e);
      }
    },
    [user?._id, API_URL]
  );

  const buttonClass =
    'bg-[#FFEFD7] px-4 py-2 rounded-lg shadow-md h-10 items-center justify-center w-100';
  const [fontsLoaded] = useFonts({
    'Madimi-Regular': require('../../assets/fonts/Madimi.ttf'),
  });

  const [study, setStudy] = useState(25);
  const [rest, setRest] = useState(5);
  const [phase, setPhase] = useState('study');
  const [timeLeft, setTimeLeft] = useState(ms(25));
  const [running, setRunning] = useState(false);
  const [isPause, setPause] = useState(false);
  const [advance, setAdvance] = useState(false);

  const pauseref = useRef(isPause);
  const phaseref = useRef<'study' | 'rest'>('study');
  const endAtRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const studyElapsedRef = useRef(0); // acumula ms de estudio para coins

  useEffect(() => {
    pauseref.current = isPause;
  }, [isPause]);

  useEffect(() => {
    phaseref.current = phase as 'study' | 'rest';
  }, [phase]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedulePhase = useCallback(
    (nextPhase: 'study' | 'rest') => {
      setPhase(nextPhase);
      phaseref.current = nextPhase;
      const duration = nextPhase === 'study' ? ms(study) : ms(rest);
      endAtRef.current = Date.now() + duration;
      setTimeLeft(duration);
    },
    [study, rest]
  );

  const tick = useCallback(() => {
    if (pauseref.current) return;
    if (endAtRef.current == null) return;

    // Contar tiempo de estudio para coins
    if (phaseref.current === 'study') {
      studyElapsedRef.current += 1000; // tick cada 1s

      if (studyElapsedRef.current >= 30000) {
        studyElapsedRef.current -= 30000;
        setCoins((prev) => prev + 1);
        void addCoins(1);
      }
    }

    const remaining = Math.max(0, endAtRef.current - Date.now());
    setTimeLeft(remaining);

    if (remaining === 0) {
      Vibration.vibrate(1000);

      const current = phaseref.current;
      const next = current === 'study' ? 'rest' : 'study';
      schedulePhase(next);
    }
  }, [schedulePhase, addCoins]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  const start = useCallback(() => {
    clear();
    setRunning(true);
    setPause(false);
    pauseref.current = false;
    studyElapsedRef.current = 0;
    schedulePhase('study');
    timerRef.current = setInterval(tick, 1000);
  }, [clear, schedulePhase, tick]);

  const pauseTimer = useCallback(() => {
    if (!running) return;
    setPause(true);
    pauseref.current = true;
  }, [running]);

  const resumeTimer = useCallback(() => {
    if (!running) return;
    setPause(false);
    pauseref.current = false;
    tick();
  }, [running, tick]);

  const stop = useCallback(() => {
    clear();
    endAtRef.current = null;
    setRunning(false);
    setPause(false);
    setPhase('study');
    setTimeLeft(ms(study));
    studyElapsedRef.current = 0;
  }, [clear, study]);

  const Short = () => {
    setStudy(25);
    setRest(5);
    if (!running) {
      setPhase('study');
      setTimeLeft(ms(25));
    }
  };

  const Medium = () => {
    setStudy(30);
    setRest(10);
    if (!running) {
      setPhase('study');
      setTimeLeft(ms(30));
    }
  };

  const Long = () => {
    setStudy(45);
    setRest(10);
    if (!running) {
      setPhase('study');
      setTimeLeft(ms(45));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFEFD7]">
      <View
        className="
          flex-1 
          items-center 
          justify-start 
          bg-[#FFEFD7]
          pt-5
        "
      >
        <StatusBar style="dark" />

        <View
          id="coins"
          className="
            flex-start 
            self-start 
            mb-2
            w-auto
          "
        >
          <View
            className="
              bg-[#d4dbb2]
              p-4 
              w-auto
              rounded-lg
              mb-4
              ml-4
              flex-row
              items-center
              justify-between
            "
          >
            <Text style={{ fontFamily: 'Madimi' }}>Coins: {coins}</Text>

            <Image
              source={require('../../assets/images/coin.png')}
              style={{ width: 20, height: 20, marginLeft: 8 }}
            />
          </View>
        </View>

        <View
          id="controller"
          className="
            w-11/12 max-w-md
            h-60
            items-center 
            justify-center 
            bg-[#d4dbb2] 
            rounded-xl
            mb-2
            mt-0
          "
        >
          <View
            className="
              w-80 
              items-center
            "
          >
            {running && (
              <>
                <Text className="text-xl font-semibold">
                  {phase === 'study' ? 'Study' : 'Rest'}
                </Text>

                <Text className="text-3xl font-bold mt-2">
                  {formatMMSS(timeLeft)}
                </Text>
              </>
            )}

            {!running && (
              <View
                className="
                  w-80 
                  h-20
                  flex-row 
                  items-center 
                  justify-around
                  mt-3
                "
              >
                <View
                  className="
                    flex-col 
                    items-center 
                    justify-center
                  "
                >
                  <Text style={{ fontFamily: 'Madimi', fontSize: 24 }}>
                    Study
                  </Text>
                  <Text>{study} min</Text>
                </View>

                <View
                  className="
                    flex-col 
                    items-center 
                    justify-center
                  "
                >
                  <Text style={{ fontFamily: 'Madimi', fontSize: 24 }}>
                    Rest
                  </Text>
                  <Text>{rest} min</Text>
                </View>
              </View>
            )}
          </View>

          {!running && (
            <View
              id="Buttons"
              className="
                flex-row 
                items-center 
                justify-around 
                mt-5
                w-80
              "
            >
              <Pressable className={buttonClass} onPress={Short}>
                <Text>Short</Text>
              </Pressable>

              <Pressable className={buttonClass} onPress={Medium}>
                <Text>Medium</Text>
              </Pressable>

              <Pressable className={buttonClass} onPress={Long}>
                <Text>Long</Text>
              </Pressable>
            </View>
          )}

          <View
            className="
              flex-row 
              items-center 
              justify-around 
              mt-4
              w-80
            "
          >
            {!running && (
              <Pressable className={buttonClass} onPress={start}>
                <PlayIcon width={24} height={24} />
              </Pressable>
            )}

            {running && !isPause && (
              <Pressable className={buttonClass} onPress={pauseTimer}>
                <PauseIcon width={24} height={24} />
              </Pressable>
            )}

            {running && isPause && (
              <Pressable className={buttonClass} onPress={resumeTimer}>
                <PlayIcon width={24} height={24} />
              </Pressable>
            )}

            {running && (
              <Pressable className={buttonClass} onPress={stop}>
                <StopIcon width={24} height={24} />
              </Pressable>
            )}
          </View>
        </View>

        <View id="AdvanceController" className="mb-10">
          {advance && !running ? (
            <View className="bg-[#d4dbb2] p-2 rounded-xl">
              <Pressable
                className="
                  mb-2
                  self-end
                  items-end
                  bg-[#FFEFD7]
                  px-2
                  py-1
                  rounded-lg
                "
                onPress={() => setAdvance(false)}
              >
                <CloseIcon width={24} height={24} />
              </Pressable>

              <View className="items-center justify-center flex-row gap-5">
                <TimerSlider
                  label="Study Duration"
                  value={study}
                  onChange={setStudy}
                />
                <TimerSlider
                  label="Rest Duration"
                  value={rest}
                  onChange={setRest}
                />
              </View>
            </View>
          ) : (
            <Pressable
              className={buttonClass}
              onPress={() => setAdvance(true)}
            >
              <SettingsIcon width={24} height={24} />
            </Pressable>
          )}
        </View>

        <View
          id="Cat"
          className="
            items-center 
            justify-center
            flex-1
          "
        >
          <Cat catUrl={catUrl?.skin} />
        </View>

        <View
          id="navigation"
          className="
            w-11/12 max-w-md
            bg-[#d4dbb2]
            p-4
            rounded-xl
            mt-20
            mb-5
            flex-row
            items-center
            justify-center
            sticky
            gap-20
          "
        >
          <Pressable
            onPress={() => {
              router.push('/home');
            }}
          >
            <HomerIcon width={30} height={30} />
          </Pressable>

          <Pressable
            onPress={() => {
              router.push('/calendar');
            }}
          >
            <CalendarIcon width={30} height={30} />
          </Pressable>

          <Pressable
            onPress={() => {
              router.push('/shop');
            }}
          >
            <ShopIcon width={30} height={30} />
          </Pressable>

          <Pressable
            onPress={() => {
              router.push('/settings');
            }}
          >
            <SettingsIcon width={30} height={30} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
