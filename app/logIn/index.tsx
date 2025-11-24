  import { useFonts } from 'expo-font';
  import { StatusBar } from 'expo-status-bar';
  import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
  import { Link, useRouter } from 'expo-router';
  import LoginForm from './login-form/loginForm'



  export default function login() {
    const [fontsLoaded] = useFonts({
      Madimi: require('../../assets/fonts/Madimi.ttf'),
    })

    const router = useRouter();

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
          <LoginForm />

          <View style={{marginTop: 20, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text>Don't have an account? Register now</Text>
            </TouchableOpacity>
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
