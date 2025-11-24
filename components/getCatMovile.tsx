import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from 'jose';

export type CatDto = {
  _id: string;
  hat?: string;
  shirt?: string;
  accessory?: string;
  skin: string;
  background: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const APIURL = process.env.EXPO_PUBLIC_API_URL;

export async function getCatMobile(): Promise<CatDto | null> {
  const token = await SecureStore.getItemAsync('access_token');
  if (!token) return null;

  const payload = decodeJwt(token) as {
    sub?: string;
    userId?: string;
    id?: string;
  };

  const userId = payload.userId ?? payload.id ?? payload.sub ?? null;
  if (!userId) return null;

  const res = await fetch(`${APIURL}/pet/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to request cat');

  const data = await res.json();
  const cat: CatDto | null = Array.isArray(data) ? data[0] ?? null : data;
  return cat;
}
