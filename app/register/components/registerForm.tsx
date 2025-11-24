import { StyleSheet, Text, View, Image, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function RegisterForm() {

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
        router.push('/home');
    };

    return (
        <View>
            <TextInput
                placeholder="Email"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
            />
            <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </Pressable>
        </View>
    )
}


const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
    },
});