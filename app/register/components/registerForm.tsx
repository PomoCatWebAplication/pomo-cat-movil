import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

type RegisterPayload = {
  userName: string;
  email: string;
  password: string;
};

export type UserDto = {
  _id: string;
  userName: string;
  email: string;
  coins: string;
  role: string;
  streak: string;
  __v: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

async function registerUser(user: RegisterPayload) {
  const newUser = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!newUser.ok) {
    let message = 'Register failed';
    try {
      const err = await newUser.json();
      if (err?.message) {
        message = Array.isArray(err.message)
          ? err.message.join(', ')
          : String(err.message);
      }
    } catch {}
    throw new Error(message);
  }

  const created = await newUser.json();
  const id =
    created?._id ??
    created?.id ??
    created?.user?._id ??
    created?.user?.id;

  const createUserCat = await fetch(`${API_URL}/pet/new/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!createUserCat.ok) {
    let message = 'Failed to register';
    const err = await createUserCat.json();
    if (err?.message) {
      message = Array.isArray(err.message)
        ? err.message.join(', ')
        : String(err.message);
    }
    throw new Error(message);
  }

  const createdUserSettings = await fetch(
    `${API_URL}/settings/user/${id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!createdUserSettings.ok) {
    let message = 'Failed to register';
    const err = await createdUserSettings.json();
    if (err?.message) {
      message = Array.isArray(err.message)
        ? err.message.join(', ')
        : String(err.message);
    }
    throw new Error(message);
  }

  return created;
}

export default function RegisterForm() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!userName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ userName, email, password });
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to register'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#6B7280"
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#6B7280"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#6B7280"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Confirm password"
        placeholderTextColor="#6B7280"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Register'}
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
