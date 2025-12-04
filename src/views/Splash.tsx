import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity,TextInput } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { apiConfig } from "../config/constant";
import Zeroconf from 'react-native-zeroconf';

const Splash: React.FC = () => {

    const navigation = useNavigation();
    const zeroconf = new Zeroconf();
    const [listServer, setListServer] = useState({});
    const [serverScreen, setServerScreen] = useState(false);
    const [reload, setReload] = useState(false);
    const [text, setText] = useState("");


    useEffect(()=>{
      zeroconf.on('start', () => console.log('Scanning...'));
      zeroconf.on('resolved', (service:any) => {
        try{
          console.log("Service found:", service);
          setListServer(service);
          console.log("APIURL is:", "http://"+service.addresses[0]+":"+service.port+"/");
          setServerScreen(true);
        }
        catch (err){
          console.log(err);
        }
        finally{
        }

      });
      zeroconf.on('error', (err: any) => console.log("Error", err));
      zeroconf.scan('project4n', 'tcp', 'local.');
    },[reload]);

    const devBypass = () =>{
      navigation.navigate("Home");
      apiConfig.api_url = text;
    }

    const statusApi = async () => {
      try{
        const response = await axios({
          method: 'get',
          url: apiConfig.api_url + 'status'
        })
        console.log(response.data.status);
        if(response.data.status){
          navigation.navigate("Home");
        }
      }
      catch(error){
        console.log("Server Not Available or Down");
      }
    }

    const selectServer = () =>{
      apiConfig.api_url = "http://"+listServer.addresses[0]+":"+listServer.port+"/";
      console.log("selected API ",apiConfig.api_url);
      statusApi();
    }

    return (
        <> 
        
          <View style={{flex:1, backgroundColor:'#fbfbfb', justifyContent:'center', alignItems:'center'}}>
            <View
            style={{width:'80%', alignItems:'center', position:'absolute', top:150}}>
            <TextInput
              style={{backgroundColor: '#fbfbfb',fontFamily:'ui-monospace',borderColor:'#343e7b', borderWidth:1, width:'100%', borderRadius: 40, justifyContent:'center', padding:10, color:'black', marginBottom:10,}}
              value={text}
              placeholder='Your Api link here...'
              placeholderTextColor={'grey'}
              onChangeText={setText}
            />
            <TouchableOpacity style={{ backgroundColor:"#A4ADC7", padding:10,borderRadius:10, }} onPress={devBypass}><Text>Bypass</Text></TouchableOpacity>
          </View>
            <Text style={{fontFamily:'ui-monospace', marginBottom:10,}}>Server Lists</Text>
            {serverScreen?
            <>
              {listServer != ({})?
              <>
              <View style={{width:'80%', flexDirection:'row', alignItems:'center',borderRadius:20, justifyContent:'space-between', borderWidth:2, borderColor:'#343E7B', padding:12,}}>
                <View>
                  <Text>{JSON.stringify(listServer?.name)}</Text>
                  <Text style={{color:'grey', fontSize:13}}>{JSON.stringify(listServer?.addresses)}</Text>
                </View>
                <TouchableOpacity onPress={selectServer} style={{backgroundColor:'#59BD93', padding:16, borderRadius:100}}>
                  <Text style={{fontFamily:'ui-monospace', }}>Select</Text>
                </TouchableOpacity>
              </View>
              </>
              :
              null
              }

            </>
            :
            null  
          }

            <TouchableOpacity onPress={()=>{
              setListServer({});
              setReload(!reload);
              }} style={{backgroundColor:'#F69B63', padding:16, borderRadius:20, marginTop:40,}}>
              <Text>Reload</Text>
            </TouchableOpacity>
          </View>
        </>
    );
};

export default Splash;