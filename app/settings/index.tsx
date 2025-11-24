import { router } from 'expo-router';
import { View, Text, Pressable } from 'react-native';


export default function SettingsPage() {
    return (
        <View className='
            bg-black
            flex-1
            justify-center
            items-center
        '>
            <Text className="text-white">Settings Page</Text>

            <Pressable onPress={() => {router.push('/')}}>
                <Text className="text-white">Log out</Text>
            </Pressable>
        </View>
    );
}