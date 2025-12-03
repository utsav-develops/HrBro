import React from 'react';
import {TouchableOpacity, View, StyleSheet, Dimensions} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import { useRoute, useNavigation} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-gesture-handler';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import Lucide from '@react-native-vector-icons/lucide';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Tools() {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const origin = route.params?.origin;

  const scale = useSharedValue(0.1);
  const translateX = useSharedValue(origin.x);
  const translateY = useSharedValue(origin.y);

  const navigation = useNavigation();



  React.useEffect(()=>{
    scale.value = withTiming(1, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250});
    translateY.value = withTiming(0, { duration: 250});
  },[]);

  const onClose = () => {
    scale.value = withTiming(0.1, { duration: 250 });
    translateX.value = withTiming(origin.x, { duration: 250 });
    translateY.value = withTiming(origin.y, { duration: 250 }, () => {
    });

    setTimeout(() => {
      navigation.setParams({openTools: true});

    }, 250);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
    ],
  }));

    return (
        <>
        <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={2}
            reducedTransparencyFallbackColor="white"
        />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
            style={[
                {
                padding:16,
                position:'absolute',
                backgroundColor:'rgba(255, 255, 255, 0.54)',
                width:'80%',
                borderRadius:10,
                justifyContent:'center'
            }, animStyle
            ]}>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:15,}}>

              <TouchableOpacity onPress = {() => {navigation.setParams({pageType : "Evaluate"}); onClose(); AsyncStorage.setItem('previousPage', 'Chat'); }} style={[styles.box,{backgroundColor:'#59bd93'}]}>
                  <Lucide name='book-open-check' size={60} color={'#e5e4e4'}/>
                  <Text style={styles.text}>Evaluate CV</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress = {() => {navigation.setParams({pageType : "Chat"}); onClose(); AsyncStorage.setItem('previousPage', 'Evaluate'); }} style={[styles.box,{backgroundColor:'#343e7b'}]}>
                  <Lucide name='keyboard' size={60} color={'#fbfbfb'}/>
                  <Text style={styles.text}>Chat AI</Text>
              </TouchableOpacity>
            </View>   
            <View style={{flexDirection:'row', justifyContent:'space-between',}}>
              <TouchableOpacity onPress = {() => {navigation.setParams({pageType : "Question"}); onClose(); AsyncStorage.setItem('previousPage', 'Evaluate'); }} style={[styles.box,{backgroundColor:'#F69B63'}]}>
                  <Lucide name='keyboard' size={60} color={'#fbfbfb'}/>
                  <Text style={styles.text}>Question Generator</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.box}></TouchableOpacity>
            </View>           
        </Animated.View>
        </>
    );

}

const styles = StyleSheet.create({
  box: {
    width:'45%', 
    aspectRatio:1, 
    padding:10,
    backgroundColor:'#343e7b',
    borderRadius:10,
    alignItems:'center',
    justifyContent:'space-evenly',
  },
  text:{
    fontSize:16,
    fontWeight: '500',
    fontFamily:'ui-monospace',
    textAlign:'center',
    color:'#fbfbfb'
  }
});