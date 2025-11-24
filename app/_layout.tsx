import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Audio } from 'expo-av';
import '../global.css';
import { initBgm, stopBgm } from '../components/musicPlayer';

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (!mounted) return;
        await initBgm();
      } catch (e) {
        console.error('Error cargando música:', e);
      }
    })();

    return () => {
      mounted = false;
      stopBgm();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
