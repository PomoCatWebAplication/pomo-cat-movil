import React from 'react';
import { View, Image } from 'react-native';


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


const images: Record<string, any> = {
    "/cats/tabbyCat.png": require("../assets/images/cats/tabbyCat.png"),
    "/cats/cowCat.png": require("../assets/images/cats/cowCat.png"),
    "/cats/orangeTabbyCat.png": require("../assets/images/cats/orangeTabbyCat.png"),
    "/cats/defaultCat.png": require("../assets/images/cats/defaultCat.png"),
};

export function Cat(CatProps: { catUrl?: string }) {
    
    const url = images[CatProps.catUrl || ''];

    return (
        <View id="Cat" >
            <Image 
                source={url} 
                style={{ width: 155, height: 210 }} 
            />
        </View>
    );
}