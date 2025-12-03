import React from "react";
import { Text, Button } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";

const Splash: React.FC = () => {

    const navigation = useNavigation();

    return (
        <SafeAreaProvider> 
        <Text>aaa</Text>
        <Button onPress={() => navigation.navigate("Dashboard")} title="Dashboard">
        </Button>
        </SafeAreaProvider>
    );
};

export default Splash;