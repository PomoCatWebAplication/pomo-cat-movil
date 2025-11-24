import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import RegisterForm from './components/registerForm';



export default function App() {
  const [fontsLoaded] = useFonts({
    Madimi: require("../../assets/fonts/Madimi.ttf"),
  })
  return (
    <View style={styles.container}>
      <StatusBar style='auto'/>

      <View style={styles.logo}>
        <Text style={styles.title}>PomoCat</Text>
        <Image
          alt="Tomate"
          source={require("../../assets/Tomate_coin.png")}
          style={styles.tomato}
        />
      </View>

      <View>
        <RegisterForm />

        <View style={{marginTop: 20, alignItems: 'center'}}>
          <Pressable onPress={() => router.push('/logIn')}>
            <Text>Don't have an account? Register now</Text>
          </Pressable>
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CFD7AF",
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    display: "contents",
    alignItems: "center",
    marginBottom: 40,
  },

  title: {
    fontSize: 48,
    fontFamily: 'Madimi',
    marginBottom: 20,
    zIndex: 2,
  },

  tomato: {
    width: 120,
    height: 100,
    position: "relative",
    left: 50,
    top: -60,
    zIndex: 1,

  },

});
