import { Text, View, Pressable, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

type LoginPayload = {
  email: string;
  password: string;
};

const APIURL = process.env.EXPO_PUBLIC_API_URL;

async function auth(data: LoginPayload) {
  const user = await fetch(`${APIURL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!user.ok) {
    let message = 'Login failed';
    try {
      const err = await user.json();
      if (err?.message) {
        message = Array.isArray(err.message)
          ? err.message.join(', ')
          : String(err.message);
      }
    } catch {}
    throw new Error(message);
  }

  return await user.json();
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await auth({ email, password });
      const token: string | undefined =
        result?.access_token || result?.token || result?.accessToken;

      if (!token) {
        throw new Error('Token no recibido');
      }

      await SecureStore.setItemAsync('access_token', token);

      router.push('/home');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6B7280"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Log in'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 288,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3F3F3F',
    paddingHorizontal: 16,
    fontFamily: 'Madimi',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#435C3D',
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Madimi',
    color: '#ffffff',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Madimi',
    marginBottom: 4,
  },
});
