import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import React, { useState, useEffect, useEffectEvent, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, useColorScheme, StatusBar, Modal, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import {apiConfig, modelChat, loading_anim, uploadFile, modelInference,pageState, modelQuestionGenerate, extractText} from '../config/constant.js';
import LottieView from 'lottie-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tools from '../components/tools';
import Lucide from '@react-native-vector-icons/lucide';
import * as Progress from 'react-native-progress';
import DocumentPicker from 'react-native-document-picker';
import Pdf from 'react-native-pdf';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export default function Dashboard() {
  const isDarkMode = useColorScheme() === 'dark';
  const [outputText, setOutputText] = useState("");
  const [evaluationText, setEvaluationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [borderHeight, setBorderHeight] = useState(0);
  const [radius, setRadius] = useState(50);
  const [toolVisible, setToolVisible] = useState(false);
  const [contentPage, setContentPage] = useState("Chat");
  const [jobPdfUri, setJobPdfUri] = useState<any>(null);
  const [CvPdfUri, setCvPdfUri] = useState<any>(null);
  const [returnName, setReturnName] = useState({job: null, cv: null});
  const [progressTime, setProgressTime] = useState(0);
  const [questionText, setQuestionText] = useState("Provide the job requirements & our AI will generate questions 🙋...");

  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  useEffect(()=>{
  const dynamicRadius = Math.max(10, 60 - borderHeight * 0.2);
  setRadius(dynamicRadius);
  },[borderHeight]);

  useEffect(()=>{
    if (route.params?.openTools){
      setToolVisible(!toolVisible);
      navigation.setParams({ openTools: false });
    }

  },[route.params?.openTools]);

  useEffect(()=>{
    if(route.params?.pageType){
      pageState.prevPage = pageState?.currentPage;
      pageState.currentPage = (route.params.pageType);
      setContentPage(route.params.pageType);
    }
  },[route.params?.pageType]);


  useEffect(() => {
    setOutputText("Your output will appear here 😎 ");
    setEvaluationText("Provide the job requirements and CV, and our AI will assess how well they match 🧩...");
  },[]);

  const pickPdf = async (pdfType: string) => {
    try{
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });

      console.log("PDF Picked", res);
      if(pdfType == 'job'){
        setJobPdfUri(res);
        setEvaluationText("Press that submit button bro... 😏");
      }
      else if (pdfType == 'cv'){
        setCvPdfUri(res);
        setEvaluationText("Press that submit button bro... 😏");

      }
    }
    catch (err) {
      if (DocumentPicker.isCancel(err)){
        console.log("User Cancelled");
      }
    else{
        console.log(err);
      } 
    }
  };

  const removePDF = (pdfType : string) => {
    if(pdfType == 'job'){
      setJobPdfUri(null);
    }
    else if (pdfType == 'cv'){
      setCvPdfUri(null);
    }
  }

  const apiCall = async (fileUri) => {
    try{
      const data = new FormData();
      data.append("file",{
        uri: fileUri.uri,
        type: "application/pdf",
        name: fileUri.name
      })
      const response = await axios({
        method : 'post',
        url: apiConfig.api_url + uploadFile,
        data : data
      })
        console.log('response is ',response.data);
        return response.data;
    }
      catch (error){
        console.log(error);

      }
    };


  const runModelInference = async () => {
    setLoading(true);
    let value = 0;
    setProgressTime(0);

    const timer = setInterval(() => {
      value += 0.05;
      if (value >= 0.9) {  // hold at 90%
        clearInterval(timer);
        value = 0.9;
      }
      setProgressTime(value);
    }, 500);

    setEvaluationText("Please be patient. Lil Ai is working on your evaluation 🤠");
    try{
      const response = await axios({
        method: 'post',
        url: apiConfig.api_url + modelInference,
        data: {applicantCv: returnName.cv, jobDescription: returnName.job}
      }
    )
      console.log(response);
      setEvaluationText(response.data.model_response.content);
    }
    catch (error) {
      console.log('error', error);
    }
    finally{
      setLoading(false);
      setProgressTime(1);

    }
  }

  const uploadForQuestion = async () =>{
    try {
    const respJob = await apiCall(jobPdfUri);
    removePDF('job');
    setReturnName(prev=>({
      ...prev,
      job: respJob.filename
    }));
    }
    catch (error){
      console.log(error);
    }
    finally{
      questionApi();
    }

  }

  const uploadFileToServer = async () => {
    if (!jobPdfUri){
      Alert.alert("Please Upload Job Description");
      setEvaluationText("Yeah you need to upload Job Description 😌");
    }
    else if (!CvPdfUri){
      Alert.alert("Please Upload Applicant CV");
      setEvaluationText("You need to upload Applicant CV 😴");
    }

    else{
      try {
        const respJob = await apiCall(jobPdfUri);
        removePDF('job');
        setReturnName(prev=>({
          ...prev,
          job: respJob.filename
        }));
        const respCv = await apiCall(CvPdfUri);
        removePDF('cv');
        setReturnName(prev=>({
          ...prev,
          cv: respCv.filename
        }));

      } catch (err) {
        console.log("Error uploading files", err);
      } finally {
          setProgressTime(0);
          runModelInference();
      }
    }
    };

  //ChatContent
  const ChatContent = () => {
  const [tempText, setTempText] = useState("");
  return (
  <ScrollView automaticallyAdjustKeyboardInsets={true} contentContainerStyle={styles.container}>
        <View 
          onLayout={(event) => {
          const boxHeight = event.nativeEvent.layout.height;
            setBorderHeight(boxHeight);
            }}
          style={[styles.outputContainer, {borderRadius: radius}]}
          >
          <Text style={{textAlign:'auto', fontFamily:'ui-monospace',marginTop:140+insets.top,}}>{outputText}</Text>
        </View>

        <View style={[ {width:'100%',flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end' }]}>
            <TextInput 
              style={{backgroundColor: '#fbfbfb',fontFamily:'ui-monospace',borderColor:'#343e7b', borderWidth:1, width:'80%', borderRadius: 40, justifyContent:'center', padding:20, color:'black'}}
              value={tempText}
              onChangeText={setTempText}
              placeholder='Write something...'
              placeholderTextColor={"#888"}
              multiline
              >
            </TextInput>
            <View
              style={{
                  borderRadius: 100,
                  borderColor:'#343e7b',
                  borderWidth:1,
                  width: '15%',
                  aspectRatio:1,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fbfbfb' // subtle overlay
              }}>
                    {!loading?
                      <TouchableOpacity onPress={()=>chat_with_model(tempText)}>
                        <FontAwesome6 name="paper-plane" size={20} iconStyle="solid" color="black"/>
                      </TouchableOpacity>
                      :
                        <LottieView source={loading_anim} style={{ width: '100%', height: '100%', padding:10, }} autoPlay loop/>
                    }

                </View>
            </View>
          </ScrollView>
    );
  }
  const EvaluateContent = () => {
    return(
      <ScrollView automaticallyAdjustKeyboardInsets={true} contentContainerStyle={styles.evalContainer}>
      <View style={{justifyContent:'flex-start', flexDirection:'column', top:insets.top+80, flex:1, alignItems:'center'}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', padding:16,}}>
          <TouchableOpacity onPress={()=>pickPdf('job')} style={{width:'45%',aspectRatio:1, borderColor:'#343E7B', borderWidth:2, alignItems:'center', justifyContent:'space-evenly', borderRadius:20,}}>
            {jobPdfUri?
            <>
            <Text style={{fontSize:10, bottom:15, position:'absolute', fontWeight:'bold', padding:16,}}>{jobPdfUri.name}</Text>
            <TouchableOpacity onPress={() => removePDF('job')} style={{position:'absolute', top:0, right:0, padding:10}}>
              <Lucide name="octagon-x" size={30} />
            </TouchableOpacity>
            </>
            :
            <Lucide name="clipboard-list" size={70} />
            }
            <Text style={{fontFamily:'ui-monospace', fontSize:16, textAlign:'center'}}>Job Description</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>pickPdf('cv')} style={{width:'45%',aspectRatio:1, borderColor:'#343E7B', borderWidth:2, alignItems:'center', justifyContent:'space-evenly', borderRadius:20,}}>
            {CvPdfUri?
            <>
            <Text style={{fontSize:10, bottom:15, position:'absolute', fontWeight:'bold', padding:16,}}>{CvPdfUri?.name}</Text>
            <TouchableOpacity onPress={() => removePDF('cv')} style={{position:'absolute', top:0, right:0, padding:10}}>
              <Lucide name="octagon-x" size={30} />
            </TouchableOpacity>
            </>
            :
            <Lucide name="cloud-upload" size={70} />
            }
            <Text style={{fontFamily:'ui-monospace', fontSize:16, textAlign:'center'}}>Applicant CV</Text>
          </TouchableOpacity>
          </View>
          {loading?
          <Progress.Bar progress={progressTime} width={300} borderColor='#343E7B' color='#59BD93'/>
            :
            null
          }
          <TouchableOpacity onPress = {(uploadFileToServer)} style={{ backgroundColor:'#59BD93', marginTop:16, padding:16, borderRadius:20}}>
              <Text style={{fontFamily:'ui-monospace', fontSize:18}}>Submit</Text>
          </TouchableOpacity>
          <View 
              onLayout={(event) => {
              const boxHeight = event.nativeEvent.layout.height;
                setBorderHeight(boxHeight);
                }}
              style={[styles.outputContainerCv, {borderRadius: radius}]}
              >
              <Text style={{textAlign:'auto', fontFamily:'ui-monospace',}}>{evaluationText}</Text>
            </View>
      </View>
      </ScrollView>
    )
  }

  const QuestionContent = () => {

    return (
      <ScrollView automaticallyAdjustKeyboardInsets={true} contentContainerStyle={styles.evalContainer}>
      <View style={{justifyContent:'flex-start', flexDirection:'column', top:insets.top+80, flex:1, alignItems:'center', }}>
          <TouchableOpacity onPress={()=>pickPdf('job')} style={{width:'45%',aspectRatio:1, borderColor:'#343E7B', borderWidth:2, alignItems:'center', justifyContent:'space-evenly', borderRadius:20, marginBottom:10,}}>
            {jobPdfUri?
            <>
            <Text style={{fontSize:10, bottom:15, position:'absolute', fontWeight:'bold', padding:16,}}>{jobPdfUri.name}</Text>
            <TouchableOpacity onPress={() => removePDF('job')} style={{position:'absolute', top:0, right:0, padding:10}}>
              <Lucide name="octagon-x" size={30} />
            </TouchableOpacity>
            </>
            :
            <Lucide name="clipboard-list" size={70} />
            }
            <Text style={{fontFamily:'ui-monospace', fontSize:16, textAlign:'center'}}>Job Description</Text>
          </TouchableOpacity>
          {loading?
          <Progress.Bar progress={progressTime} width={300} borderColor='#343E7B' color='#59BD93'/>
            :
            null
          }
          <TouchableOpacity onPress = {uploadForQuestion} style={{ backgroundColor:'#59BD93', marginTop:16, padding:16, borderRadius:20}}>
              <Text style={{fontFamily:'ui-monospace', fontSize:18}}>Submit</Text>
          </TouchableOpacity>
          <View 
              onLayout={(event) => {
              const boxHeight = event.nativeEvent.layout.height;
                setBorderHeight(boxHeight);
                }}
              style={[styles.outputContainerCv, {borderRadius: radius}]}
              >
              <Text style={{textAlign:'auto', fontFamily:'ui-monospace',}}>{questionText}</Text>
            </View>
      </View>
      </ScrollView>
    )
  }



  const ScanContent = () =>{
    const cameraRef = useRef(null);
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const [photo, setPhoto] = useState(null);
    const [extractOutput, setExtractOutput] = useState("");

    useEffect(()=>{
       (async () => {
      const status = await Camera.requestCameraPermission();
    })();
    },[]);

      const extractApi = async (picName: string) => {
        console.log("picName " + picName);
        try{
          const response = await axios({
            method: 'post',
            url: apiConfig.api_url + extractText,
            data: {pictureName: picName}
          })
          console.log(response.data);
          setExtractOutput(response.data);
        }
        catch(err){
          console.log(err);
        }
      }

    const takePhoto = async () =>{ 
      const res = await cameraRef.current.takePhoto({
        flash: 'off'
      });
      console.log(res);
      setPhoto(res);

      const response = await apiCall({uri:res.path, name:'photoclick.jpg'});
      console.log(response);
      extractApi(response.filename);
   
      }

    if (!hasPermission) return <Text>No Permission...</Text>
    if (device == null) return <Text>No Device</Text>;
    
    return(
        <View style={StyleSheet.absoluteFill}>
        {  extractOutput ? (
          <View style={{justifyContent:'center', alignSelf:'center', top:300}}>
            <Text>{extractOutput?.extractedText}</Text>
            </View>
        )
        :
        photo ? (
          <Image
            source={{uri: 'file://' + photo.path}} 
            style={{flex: 1}}/>
        ) 
        :
        (
          <Camera
            ref={cameraRef}
            style={{flex:1, width:'100%',}}
            device={device}
            isActive={true}
            photo={true}
          />
        )
        }
          <TouchableOpacity onPress={takePhoto} style={{position:'absolute', borderRadius:20, backgroundColor:'#59BD93', padding:16, bottom:40, alignSelf:'center'}} >
            <Text>Click</Text>
          </TouchableOpacity>
        </View>

    )
  }


  const chat_with_model = async (prompt: string) => {
    setLoading(true);
    setOutputText("Ai is working on your answer 🤖 ...");
    axios({
      method: 'post',
      url: apiConfig.api_url + modelChat,
      data: { user:'dazu', message: prompt}
    })
    .then(async response => {
      setOutputText(response.data.content);
      setLoading(false);

    })
    .catch(error => {
      console.log(error);
      setLoading(false);

    });
  }

    const questionApi = async () =>{
    setLoading(true);
    try{
      const response = await axios({
        method: 'post',
        url: apiConfig.api_url + modelQuestionGenerate,
        data:{jobDescription: returnName.job}
      })
      console.log(response);
      setQuestionText(response.data.content);
    }
    catch (error){
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <View style={{flex:1, backgroundColor:'#fbfbfb', justifyContent:'center', alignItems:'center'}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      { contentPage == 'Chat' ?(
        <><ChatContent/></>
      )
      : contentPage == 'Evaluate' ? (
        <><EvaluateContent/></>
      )
      : contentPage == 'Question' ? (
        <><QuestionContent/></>
      )
      : contentPage == 'Scan' ?(
        <ScanContent/>
      ) 
      :
      (<></>)
      }
      
      {toolVisible?
        <Tools />
        :
        null 
      }
      </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfbfb', // change based on theme
  },
  linearGradient: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },
  
  outputContainer:{
    padding: 16,
    backgroundColor:'#fbfbfb',
    opacity:1,
    bottom:20,
    width:'100%',
  },

  outputContainerCv:{
    padding: 16,
    opacity:1,
    top:40,
    width:'90%',
    marginBottom:300,
    borderColor:'#343E7B',
    borderWidth:1,
  },

  container: {
    flexGrow:1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    flexDirection:'column',
    bottom:10,
  },

  evalContainer: {
    flexGrow:1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    flexDirection:'column',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
 
});
