/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { useState, useRef } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, Text, useColorScheme, View, TouchableOpacity, } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Lucide from '@react-native-vector-icons/lucide';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Pages
import Splash from './src/views/Splash';
import Dashboard from './src/views/Dashboard';
import Tools from './src/components/tools';
import Evaluate from './src/views/Evaluate';
import { pageState } from './src/config/constant';

const Stack = createNativeStackNavigator();

function RootStack() {
  const headerButtonRef = useRef(null);
  const [origin, setOrigin] = useState({x: 0, y: 0});
  const navigation = useNavigation();

  const openTools = () => {
    headerButtonRef.current?.measure((x, y, width, height, px, py) => {
      setOrigin({x,y});
      navigation.setParams({openTools: true, origin: {x: px,y: py}});
    });
  };

  return (
    <Stack.Navigator initialRouteName="Splash" >
      <Stack.Screen name="Home"
        component={Dashboard} 
         options={({ navigation }: NativeStackScreenProps<any>) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={ async () => {
              const Page = pageState.prevPage;
              pageState.headerTitle = Page;
              navigation.setParams({pageType : Page});
            }} 
            style={{alignItems:'center', justifyContent:'center',  marginLeft: 7}}>
              <FontAwesome6 name="arrows-turn-to-dots" size={20} iconStyle='solid'/>
            </TouchableOpacity>
          ),
          headerRight: () => (
              <TouchableOpacity ref={headerButtonRef} style={{ alignItems:'center', justifyContent:'center', marginLeft: 10}} onPress={() => openTools()}>
                <FontAwesome6 name="grip" size={20} iconStyle="solid"/>
              </TouchableOpacity>
          ),
          headerTransparent: true,
          headerTitle: pageState.headerTitle,
        })}
        />

      <Stack.Screen name="Splash" component={Splash} options={{headerShown: false}}/>
    </Stack.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
       <RootStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
