import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from 'jose';

export type UserDto = {
  _id: string;
  userName: string;
  email: string;
  coins: string;
  role: string;
  streak: string;
  __v: string;
};

const APIURL = process.env.EXPO_PUBLIC_API_URL;

export async function meMobile(): Promise<UserDto | null> {
  const token = await SecureStore.getItemAsync('access_token');

  if (!token) return null;

  const payload = decodeJwt(token) as {
    sub?: string;
    userId?: string;
    id?: string;
  };

  const userId = payload.userId ?? payload.id ?? payload.sub ?? null;

  if (!userId) return null;

  const res = await fetch(`${APIURL}/auth/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const user: UserDto | null = Array.isArray(data) ? data[0] ?? null : data;

  return user;
}
