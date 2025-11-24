import { Audio } from 'expo-av';

let bgmSound: Audio.Sound | null = null;
let currentVolume = 0.4;

export async function initBgm() {
  if (bgmSound) return bgmSound;

  const { sound } = await Audio.Sound.createAsync(
    require('../assets/vfx/music1.mp3'),
    {
      isLooping: true,
      volume: currentVolume,
    }
  );

  bgmSound = sound;
  await bgmSound.playAsync();
  return bgmSound;
}

export async function setBgmVolume(vol: number) {
  const clamped = Math.max(0, Math.min(1, vol));
  currentVolume = clamped;
  if (bgmSound) {
    await bgmSound.setVolumeAsync(clamped);
  }
}

export function getBgmVolume() {
  return currentVolume;
}

export async function stopBgm() {
  if (bgmSound) {
    await bgmSound.unloadAsync();
    bgmSound = null;
  }
}
