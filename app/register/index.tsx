  import { useFonts } from 'expo-font';
  import { StatusBar } from 'expo-status-bar';
  import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
  import { useRouter } from 'expo-router';
  import RegisterForm from './components/registerForm';



  export default function Register() {
    const [fontsLoaded] = useFonts({
        Madimi: require('../../assets/fonts/Madimi.ttf'),
    });

    const router = useRouter();

    return (
      <View className='
        flex-1
        bg-[#FFEFD7]
        items-center
        justify-center
      '>
        <StatusBar style='auto'/>

        <View style={styles.logo}>
          <Text style={styles.title}>PomoCat</Text>
          <Image
            alt="Tomate"
            source={require("../../assets/Tomate_coin.png")}
            style={styles.tomato}
          />
        </View>

        <View style={{ backgroundColor: '#CFD7AF', padding: 20, borderRadius: 10, width: '80%', height: '40%', justifyContent: 'center', alignContent: 'center'}}>

          <RegisterForm />

          <View style={{marginTop: 20, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => router.push('/logIn')}>
              <Text style={{fontFamily: 'Madimi'}} >Already have an account? Log in</Text>
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
