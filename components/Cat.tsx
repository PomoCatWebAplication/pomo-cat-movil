import { View, Image } from 'react-native';

export function Cat() {

    return (
        <View id="Cat" >
            <Image 
                source={require('../assets/images/cats/defaultCat.png')} 
                style={{ width: 150, height: 190 }} 
            />
        </View>
    );
}